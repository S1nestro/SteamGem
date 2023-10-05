from flask import Flask
from extensions import db
from config import Config
from data.data_manager import fetch_data


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
    # fetch_data()



@app.route('/')
def hello_world():
    return 'Hello World!'


if __name__ == '__main__':
    app.run()
