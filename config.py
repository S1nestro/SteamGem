import os

STEAM_API_BASE_URL = "https://api.steampowered.com/"
API_KEY = "29CBC598BBCB78A7288715AA7617B1DC"

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'database.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
