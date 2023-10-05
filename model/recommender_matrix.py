import requests
import datetime
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from sqlalchemy.orm import joinedload
from Entity.Game import Game, GameType
from Entity.GameRecord import GameRecord
from config import STEAM_API_BASE_URL, API_KEY


def fetch_user_game_data(session, user_id):
    # 从数据库获取用户的游戏数据
    user_games = session.query(GameRecord).filter_by(user_id=user_id).all()

    user_game_data = {}
    for game in user_games:
        user_game_data[game.game_id] = {
            'playtime': game.playtime,
            'achievement_rate': game.achievement_rate
        }

    return user_game_data


def fetch_game_features(session):
    # 获取所有游戏和它们的类型
    games = session.query(Game).options(joinedload(Game.types)).all()

    # 初始化映射表
    rating_weights = {
        "overwhelmingly positive": 1.5,
        "very positive": 1.3,
        "positive": 1.1,
        "mostly positive": 1.0,
        "mixed": 0.7,
        "mostly negative": 0.4,
        "negative": 0.2,
        "very negative": 0.1,
        "overwhelmingly negative": 0.05
    }

    # 提取游戏特征
    game_features = {}
    for game in games:
        # 使用独热编码表示类型
        type_vector = [1 if t in game.types else 0 for t in GameType.query.all()]

        # 使用映射表获取评分权重
        rating_score = rating_weights.get(game.rating, 0)

        # 将发行日期编码为从1970年1月1日以来的天数
        release_days = (game.release_date - datetime.date(1970, 1, 1)).days

        # 合并所有特征
        features = type_vector + [rating_score, release_days]
        game_features[game.id] = features

    # 标准化特征
    scaler = MinMaxScaler()
    for game_id, features in game_features.items():
        game_features[game_id] = scaler.fit_transform([features])[0]

    return game_features, games


def calculate_game_similarity_matrix(game_features):
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


# 特定用户对给定游戏的预测评分
def predict_user_rating_for_game(user_id, game_id, game_similarity, user_game_data):
    # 获取用户玩过的游戏
    user_played_games = user_game_data.get(user_id, {})

    if not user_played_games:
        return 0

    # 加入权重系数
    weight_playtime = 0.7  # 假设玩家的游玩时长占总体权重的70%
    weight_achievement = 0.3  # 假设成就率占总体权重的30%

    numerator = sum(
        game_similarity[game_id][other_game_id] *
        user_played_games[other_game_id]['rating'] *
        (weight_playtime * user_played_games[other_game_id]['playtime'] +
         weight_achievement * user_played_games[other_game_id]['achievement_rate'])
        for other_game_id in user_played_games if other_game_id in game_similarity[game_id]
    )

    denominator = sum(
        abs(game_similarity[game_id][other_game_id])
        for other_game_id in user_played_games if other_game_id in game_similarity[game_id]
    )

    if denominator == 0:
        return 0

    return numerator / denominator


def weight_predicted_rating(game_id, predicted_rating, user_preferences, game_data):
    category_pref_weight = 1.0
    release_date_pref_weight = 1.0
    review_tag_weight = {
        'overwhelmingly positive': 1.5,
        'very positive': 1.4,
        'positive': 1.3,
        'mostly positive': 1.2,
        'mixed': 1.0,
        'mostly negative': 0.8,
        'negative': 0.7,
        'very negative': 0.6,
        'overwhelmingly negative': 0.5
    }

    # 根据用户的类别偏好调整权重
    if any(game_type.type_name in user_preferences['preferred_categories'] for game_type in
           game_data[game_id]['types']):
        category_pref_weight = 1.2

    # 根据用户的发行日期偏好调整权重
    if user_preferences['release_date_range'][0] <= game_data[id]['release_date'] <= \
            user_preferences['release_date_range'][1]:
        release_date_pref_weight = 1.1

    # 根据游戏的评价标签调整权重
    review_weight = review_tag_weight.get(game_data[id]['rating'], 1.0)

    return predicted_rating * category_pref_weight * release_date_pref_weight * review_weight


def recommend_games_for_user(user_id, user_preferences, game_data, game_similarity, user_game_data):
    all_games = set(game_data.keys())
    user_played_games = set(user_game_data.get(user_id, {}).keys())
    unplayed_games = all_games - user_played_games

    predicted_ratings = {}
    for game_id in unplayed_games:
        predicted_rating = predict_user_rating_for_game(user_id, game_id, game_similarity, user_game_data)
        weighted_rating = weight_predicted_rating(user_id, game_id, predicted_rating, user_preferences, game_data)
        predicted_ratings[game_id] = weighted_rating

    # 返回评分最高的100款游戏
    recommended_games = sorted(predicted_ratings.keys(), key=lambda x: predicted_ratings[x], reverse=True)[:100]

    return recommended_games


def fetch_user_games(steam_id):
    try:
        url = f'{STEAM_API_BASE_URL}IPlayerService/GetOwnedGames/v0001/?key={API_KEY}&steamid={steam_id}&include_appinfo=1&include_played_free_games=1'
        response = requests.get(url).json()
        if response.status_code == 200:
            games = response.json().get("response", {}).get("games", [])
            return [game["appid"] for game in games]
        else:
            # 如果响应失败，返回一个空列表
            return []
    except Exception as e:
        raise Exception(f"Error fetching games for Steam ID {steam_id}. Error: {str(e)}")


def filter_user_owned_games(user_id, recommended_games_list):
    user_owned_games = fetch_user_games(user_id)
    filtered_recommendations = [game for game in recommended_games_list if game not in user_owned_games]

    # 从筛选后的推荐列表中选择前10个
    return filtered_recommendations[:10]
