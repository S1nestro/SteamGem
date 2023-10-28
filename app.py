from flask import Flask, request, jsonify, render_template
from sqlalchemy.orm import sessionmaker
from extensions import db
from config import Config
from data.data_manager import fetch_data
from model.game_recommender import main_recommendation_pipeline



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