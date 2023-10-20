from flask import Flask, request, jsonify, render_template
from sqlalchemy.orm import sessionmaker
from extensions import db
from config import Config
from data.data_manager import fetch_data
from model.game_recommender import main_recommendation_pipeline

# app = Flask(__name__)
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
#     # 这里进行你的数据处理...
#
#     # 假设你的处理完成后，你得到了以下数据结构
#     responseData = [
#         {
#             "name": "Game 1",
#             "link": "Link 1",
#             "image": "Image 1",
#             "reason": "Reason 1",
#             "price": "Price 1"
#         },
#         # ... 更多游戏数据
#     ]
#
#     # 发送响应数据回前端
#     return jsonify(responseData)
#
#
# # 改成动态获取
# START_USER = "76561199155209999"
#
#
# # 76561198381625583
# # 76561198315311042
# # 76561199155209999
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
# with app.app_context():
#     # fetch_data(START_USER)
#     user_preferences = {
#         'preferred_categories': ['Action', 'Adventure'],  # 用户偏好的游戏类型
#         'release_date_range': ('1970-01-01', '2023-10-07'),  # 用户偏好的游戏发行日期范围
#     }
#     games_with_details = main_recommendation_pipeline(START_USER, user_preferences, db.session)
#
#     encoded_string = str(games_with_details).encode('utf-8')
#     print(encoded_string)
#
#
# # 获取封面图 https://steamcdn-a.akamaihd.net/steam/apps/{appid}/header.jpg
#
# @app.route('/')
# def hello_world():
#     return 'Hello World!'
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