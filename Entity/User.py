from extensions import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # 用户ID
    username = db.Column(db.String(300), nullable=False, unique=False)  # 用户名
