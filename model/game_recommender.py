from model.recommender_matrix import fetch_user_game_data, fetch_game_features, calculate_game_similarity_matrix, \
    recommend_games_for_user, filter_user_owned_games


def main_recommendation_pipeline(user_id, user_preferences, session):
    # 1. 获取用户的游戏数据
    user_game_data = fetch_user_game_data(session, user_id)

    # 2. 从数据库获取所有游戏的特征
    game_features, games = fetch_game_features(session)

    # 3. 计算游戏相似度矩阵
    game_similarity = calculate_game_similarity_matrix(game_features)

    # 4. 使用上述数据为特定用户生成推荐的游戏
    recommended_games = recommend_games_for_user(user_id, user_preferences, games, game_similarity, user_game_data)

    # 5. 根据用户的Steam账号，过滤掉用户已拥有的游戏
    filtered_recommendations = filter_user_owned_games(user_id, recommended_games)

    return filtered_recommendations


