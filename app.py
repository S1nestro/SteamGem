from flask import Flask
from sqlalchemy.orm import sessionmaker
from extensions import db
from config import Config
from data.data_manager import fetch_data
from model.game_recommender import main_recommendation_pipeline

# 改成动态获取
START_USER = "76561199155209999"


# 76561198381625583
# 76561198315311042
# 76561199155209999

def create_application():
    application = Flask(__name__)
    application.config.from_object(Config)
    db.init_app(application)
    with application.app_context():
        # 检查已定义的所有模型，并在数据库中为它们创建表（如果它们尚未存在）
        db.create_all()
    return application


app = create_application()

with app.app_context():
    # fetch_data(START_USER)
    user_preferences = {
        'preferred_categories': ['Action', 'Adventure'],  # 用户偏好的游戏类型
        'release_date_range': ('1970-01-01', '2023-10-07'),  # 用户偏好的游戏发行日期范围
    }
    games_with_details = main_recommendation_pipeline(START_USER, user_preferences, db.session)

    encoded_string = str(games_with_details).encode('utf-8')
    print(encoded_string)


# 获取封面图 https://steamcdn-a.akamaihd.net/steam/apps/{appid}/header.jpg

@app.route('/')
def hello_world():
    return 'Hello World!'


if __name__ == '__main__':
    app.run()
