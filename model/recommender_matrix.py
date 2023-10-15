import traceback
import requests
import datetime
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from sqlalchemy.orm import joinedload
from Entity.Game import Game, GameType
from Entity.GameRecord import GameRecord
from config import STEAM_API_BASE_URL, API_KEY, ISTHEREANYDEAL_API, ISTHEREANYDEAL_API_BASE_URL

REVIEW_TAG_WEIGHT = {
    'Overwhelmingly Positive': 1.5,
    'Very Positive': 1.4,
    'Positive': 1.3,
    'Mostly Positive': 1.2,
    'Mixed': 1.0,
    'Mostly Negative': 0.8,
    'Negative': 0.7,
    'Very Negative': 0.6,
    'Overwhelmingly Negative': 0.5
}


def fetch_user_game_data(session, user_id):
    try:
        # 从数据库获取用户的游戏数据并与游戏表进行联接
        results = session.query(GameRecord.game_id,
                                GameRecord.playtime,
                                GameRecord.achievements_unlocked,
                                Game.rating,
                                Game.global_achievements_avg). \
            join(Game, Game.id == GameRecord.game_id). \
            filter(GameRecord.user_id == user_id).all()

        user_game_data = {}
        for record in results:
            user_game_data[record.game_id] = {
                'playtime': record.playtime,
                'achievements_unlocked': record.achievements_unlocked,
                'rating': record.rating,
                'global_achievements_avg': record.global_achievements_avg
            }

        return user_game_data

    except Exception as e:
        error_message = f"Error in fetch_user_game_data: {str(e)}"
        print(error_message)
        raise Exception(error_message)


def fetch_game_features(session):
    try:
        # 获取所有游戏和它们的类型
        games = session.query(Game).options(joinedload(Game.types)).all()

        # 预先查询所有的 GameType
        all_game_types = [gt.type_name for gt in session.query(GameType).all()]

        # 将游戏数据构建成字典，键为游戏ID，值为游戏数据
        game_data = {game.id: {
            'name': game.name,
            'release_date': game.release_date,
            'rating': game.rating,
            # 将游戏类型转化为列表
            'types': [game_type.type_name for game_type in game.types],
            'global_achievements_avg': game.global_achievements_avg
        } for game in games}

        # 初始化映射表
        rating_weights = {
            "Overwhelmingly Positive": 1.5,
            "Very Positive": 1.3,
            "Positive": 1.1,
            "Mostly Positive": 1.0,
            "Mixed": 0.7,
            "Mostly Negative": 0.4,
            "Negative": 0.2,
            "Very Negative": 0.1,
            "Overwhelmingly Negative": 0.05
        }

        # 提取游戏特征
        game_features = {}
        for game in games:
            # 使用独热编码表示类型
            type_vector = [1 if t in [gt.type_name for gt in game.types] else 0 for t in all_game_types]

            # 使用映射表获取评分权重
            rating_score = rating_weights.get(game.rating, 0)

            # 将发行日期编码为从1970年1月1日以来的天数
            release_days = (game.release_date - datetime.date(1970, 1, 1)).days

            # 合并所有特征
            features = type_vector + [rating_score, release_days]
            game_features[game.id] = features

        # 使用 MinMaxScaler 标准化所有游戏的特征
        scaler = MinMaxScaler()
        all_features = list(game_features.values())
        all_features_scaled = scaler.fit_transform(all_features)
        game_features = {game_id: list(feature) for game_id, feature in zip(game_features.keys(), all_features_scaled)}

        return game_features, game_data

    except Exception as e:
        error_message = f"Error in fetch_game_features: {str(e)}"
        print(error_message)
        raise Exception(error_message)


def calculate_game_similarity_matrix(game_features):
    try:
        # 将特征向量转换为矩阵形式
        feature_matrix = [features for _, features in game_features.items()]
        game_ids = [game_id for game_id, _ in game_features.items()]

        # 计算cosine相似度矩阵
        similarity_matrix = cosine_similarity(feature_matrix)

        # 转换为游戏ID与相似度的映射
        game_similarity = {}
        for idx, game_id in enumerate(game_ids):
            game_similarity[game_id] = {game_ids[j]: similarity_matrix[idx][j] for j in range(len(game_ids))}

        return game_similarity

    except Exception as e:
        error_message = f"Error calculating game similarity matrix. Error: {str(e)}"
        traceback.print_exc()
        raise Exception(error_message)


# 特定用户对给定游戏的预测评分
def predict_user_rating_for_game(user_id, game_id, game_similarity, user_game_data):
    try:
        # 获取用户玩过的游戏
        user_played_games = user_game_data

        if not user_played_games:
            return 0

        # 加入权重系数
        weight_playtime = 0.7  # 假设玩家的游玩时长占总体权重的70%
        weight_achievement_ratio = 0.3  # 考虑成就完成比率的权重

        numerator = sum(
            game_similarity[game_id][other_game_id] *
            REVIEW_TAG_WEIGHT.get(user_played_games[other_game_id]['rating']) *
            (weight_playtime * user_played_games[other_game_id]['playtime'] +
             weight_achievement_ratio * (
                 user_played_games[other_game_id]['achievements_unlocked'] /
                 user_played_games[other_game_id]['global_achievements_avg'] if user_played_games[other_game_id][
                                                                                    'global_achievements_avg'] != 0 else 0
             ))
            for other_game_id in user_played_games if other_game_id in game_similarity[game_id]
        )

        denominator = sum(
            abs(game_similarity[game_id][other_game_id])
            for other_game_id in user_played_games if other_game_id in game_similarity[game_id]
        )

        if denominator == 0:
            return 0

        return numerator / denominator

    except Exception as e:
        error_message = f"Error predicting user rating for game {game_id}. Error: {str(e)}"
        traceback.print_exc()
        raise Exception(error_message)


def weight_predicted_rating(game_id, predicted_rating, user_preferences, game_data):
    try:
        category_pref_weight = 1.0
        release_date_pref_weight = 1.0

        # 根据用户的类别偏好调整权重
        if any(game_type in user_preferences['preferred_categories'] for game_type in game_data[game_id]['types']):
            category_pref_weight = 1.2

        # 根据用户的发行日期偏好调整权重
        # 用户可以选择Any,Any指从1970/1/1到今天
        if str(user_preferences['release_date_range'][0]) <= str(game_data[game_id]['release_date']) <= str(
                user_preferences['release_date_range'][1]):
            release_date_pref_weight = 1.1

        # 根据游戏的评价标签调整权重
        review_weight = REVIEW_TAG_WEIGHT.get(game_data[game_id]['rating'], 1.0)

        return predicted_rating * category_pref_weight * release_date_pref_weight * review_weight

    except Exception as e:
        error_message = f"Error weighting predicted rating for game {game_id}. Error: {str(e)}"
        traceback.print_exc()
        raise Exception(error_message)


def recommend_games_for_user(user_id, user_preferences, game_data, game_similarity, user_game_data):
    try:
        all_games = set(game_data.keys())
        user_played_games = set(user_game_data.get(user_id, {}).keys())
        unplayed_games = all_games - user_played_games

        predicted_ratings = {}
        for game_id in unplayed_games:
            predicted_rating = predict_user_rating_for_game(user_id, game_id, game_similarity, user_game_data)
            weighted_rating = weight_predicted_rating(game_id, predicted_rating, user_preferences, game_data)
            predicted_ratings[game_id] = weighted_rating

        # 根据评分排序并获取评分最高的100款游戏的ID
        top_100_game_ids = sorted(predicted_ratings.keys(), key=lambda x: predicted_ratings[x], reverse=True)[:100]

        # 根据ID从game_data中提取游戏名称
        recommended_games = [(game_id, game_data[game_id]['name']) for game_id in top_100_game_ids]

        return recommended_games

    except Exception as e:
        error_message = f"Error recommending games for user {user_id}. Error: {str(e)}"
        traceback.print_exc()
        raise Exception(error_message)


# 获取一个用户的所有游戏
def fetch_user_games(steam_id):
    try:
        url = f'{STEAM_API_BASE_URL}IPlayerService/GetOwnedGames/v0001/?key={API_KEY}&steamid={steam_id}&include_appinfo=1&include_played_free_games=1'
        response = requests.get(url).json()

        # 直接尝试解析JSON，如果失败则会引发异常
        games = response.get("response", {}).get("games", [])
        return [game["appid"] for game in games]

    except Exception as e:
        error_message = f"Error fetching games for Steam ID {steam_id}. Error: {str(e)}"
        traceback.print_exc()
        raise Exception(error_message)


def filter_user_owned_games(user_id, recommended_games_list):
    try:
        user_owned_game_ids = set(fetch_user_games(user_id))

        # 过滤掉用户已经拥有的游戏
        filtered_recommendations = [(appid, name) for appid, name in recommended_games_list if
                                    appid not in user_owned_game_ids]

        # 从筛选后的推荐列表中选择前10个
        return filtered_recommendations[:10]
    except Exception as e:
        print(f"Error filtering owned games for user {user_id}. Error: {e}")
        return []


# 获取游戏的价格和推荐理由等细节
def get_game_details(filtered_recommendations):
    game_details_list = []

    for appid, game_name in filtered_recommendations:
        shop, lowest_price, url = get_current_lowest_price(game_name)
        if lowest_price:
            print(f"The current lowest price for {game_name} (AppID: {appid}) is: ${lowest_price} at {shop},link is {url}.")
            game_details_list.append((appid, game_name, shop, lowest_price, url))
        else:
            print(f"Could not find price data for {game_name} (AppID: {appid}).")

    return game_details_list


def get_current_lowest_price(game_name):
    # 首先根据游戏名称进行搜索，获取plain标识
    search_url = f"{ISTHEREANYDEAL_API_BASE_URL}v02/search/search/?key={ISTHEREANYDEAL_API}&q={game_name}"
    response = requests.get(search_url)
    data = response.json()
    # 检查是否有匹配的游戏结果
    if not data['data']['results']:
        return None, None, None
    # v02端点支持模糊匹配，选第一个相似度最高的
    game_plain = data['data']['results'][0]['plain']

    prices_url = f"https://api.isthereanydeal.com/v01/game/prices/?key={ISTHEREANYDEAL_API}&plains={game_plain}"

    response = requests.get(prices_url)
    prices_data = response.json()
    # 检查是否有价格数据
    if not prices_data['data'][game_plain]['list']:
        return None, None, None
    # 选择最低的价格
    lowest_price_shop = prices_data['data'][game_plain]['list'][0]
    return lowest_price_shop['shop']['name'], lowest_price_shop['price_new'], lowest_price_shop['url']