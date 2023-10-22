import os

STEAM_API_BASE_URL = "https://api.steampowered.com/"
STEAM_ITEM_URL = "https://store.steampowered.com/app/"
ISTHEREANYDEAL_API_BASE_URL = "https://api.isthereanydeal.com/"
ISTHEREANYDEAL_API = "9673676f83833dbd6ae372d133f3d64bceb5dde9"
API_KEY = "29CBC598BBCB78A7288715AA7617B1DC"

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'database.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
