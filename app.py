from flask import Flask, request, jsonify, render_template
from sqlalchemy.orm import sessionmaker
from extensions import db
from config import Config
from data.data_manager import fetch_data
from model.game_recommender import main_recommendation_pipeline

# app = Flask(__name__)
#
# # # 改成动态获取
# # START_USER = "76561199155209999"
# #
# #
# # # 76561198381625583
# # # 76561198315311042
# # # 76561199155209999
#
# def create_application():
#     application = Flask(__name__)
#     application.config.from_object(Config)
#     db.init_app(application)
#     with application.app_context():
#         # 检查已定义的所有模型，并在数据库中为它们创建表（如果它们尚未存在）
#         db.create_all()
#     return application
#
#
# app = create_application()
#
#
# @app.route('/receive-data', methods=['POST'])
# def receive_data():
#     # 获取前端发送的JSON数据
#     data = request.json
#
#     userId = data.get('userId')
#     gameTypes = data.get('gameTypes')
#     fromDate = data.get('fromDate')
#     toDate = data.get('toDate')
#
#     # 调用fetch_data函数
#     with app.app_context():
#         fetch_data(userId)
#
#     # 将用户偏好数据打包成一个字典
#     user_preferences = {
#         "preferred_categories": gameTypes,
#         "release_date_range": (fromDate, toDate)
#     }
#
#     # 调用推荐系统的主要功能
#     with app.app_context():
#         games_with_details = main_recommendation_pipeline(userId, user_preferences, db.session)
#         encoded_string = str(games_with_details).encode('utf-8')
#         print(encoded_string)
#
#         return jsonify(games_with_details)
#
#
# # 获取封面图 https://steamcdn-a.akamaihd.net/steam/apps/{appid}/header.jpg
#
#
# if __name__ == '__main__':
#     app.run()
def create_application():
    application = Flask(__name__)
    application.config.from_object(Config)
    db.init_app(application)
    with application.app_context():
        db.create_all()
    return application

app = create_application()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/receive-data', methods=['POST'])
def receive_data():
    data = request.json
    userId = data.get('userId')
    gameTypes = data.get('gameTypes')
    fromDate = data.get('fromDate')
    toDate = data.get('toDate')

    user_preferences = {
        "preferred_categories": gameTypes,
        "release_date_range": (fromDate, toDate)
    }

    with app.app_context():
        fetch_data(userId)
        games_with_details = main_recommendation_pipeline(userId, user_preferences, db.session)
        encoded_string = str(games_with_details).encode('utf-8')
        print(encoded_string)
        return jsonify(games_with_details)

if __name__ == '__main__':
    app.run()