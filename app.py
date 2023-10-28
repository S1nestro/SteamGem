from datetime import datetime

from flask import Flask, request, jsonify, render_template
from sqlalchemy.orm import sessionmaker
from extensions import db
from config import Config, STEAM_ITEM_URL
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


@app.route('/guide')
def guide():
    return render_template('guide.html')


@app.route('/get-recommendations', methods=['POST'])
def receive_data():
    data = request.json
    user_id = data.get('userId')
    game_type = data.get('gameTypes')
    fromMonth1 = data.get('fromMonth1')
    fromYear1 = data.get('fromYear1')
    fromMonth2 = data.get('fromMonth2')
    fromYear2 = data.get('fromYear2')
    anyTimeChecked = data.get('anyTimeChecked')

    fromDate_str = f'{fromYear1}-{fromMonth1}-01'
    fromDate = datetime.strptime(fromDate_str, '%Y-%m-%d')
    toDate_str = f'{fromYear2}-{fromMonth2}-01'
    toDate = datetime.strptime(toDate_str, '%Y-%m-%d')

    if (anyTimeChecked):
        fromDate = datetime.strptime("1970-01-01", '%Y-%m-%d')
        toDate = datetime.today()

    user_preferences = {
        "preferred_categories": game_type,
        "release_date_range": (fromDate, toDate)
    }
    response_data = []

    with app.app_context():
        fetch_data(user_id)
        games_with_details = main_recommendation_pipeline(user_id, user_preferences, db.session)
        encoded_string = str(games_with_details).encode('utf-8')
        print(encoded_string)

        for item in games_with_details:
            game_info = {
                'name': item[1],  # 使用item[1]而不是item[2]获取游戏名称
                'image': f'https://steamcdn-a.akamaihd.net/steam/apps/{item[0]}/header.jpg',  # 使用f-string格式化URL
                'price': "The lowest price is on the STEAM platform currently."
                if item[2] is None or item[3] is None
                else f'{item[3]} U.S. dollar at {item[2] if item[2] is not None else "STEAM"}',
                # 使用f-string格式化价格和平台信息，并使用item[2]获取平台名称
                'link': item[4] if item[4] is not None else f'{STEAM_ITEM_URL}{item[0]}',  # 使用item[4]获取链接
                'reason': item[5]  # 使用item[5]获取推荐理由
            }
            response_data.append(game_info)

        return jsonify(response_data)


if __name__ == '__main__':
    app.run()
