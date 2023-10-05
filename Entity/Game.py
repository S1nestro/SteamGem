from extensions import db


class GameType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type_name = db.Column(db.String(100), nullable=False, unique=True)  # 游戏类型名称


# 多对多关联表
game_game_types = db.Table('game_game_types',
                           db.Column('game_id', db.Integer, db.ForeignKey('game.id'), primary_key=True),
                           db.Column('game_type_id', db.Integer, db.ForeignKey('game_type.id'), primary_key=True)
                           )


class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(400), nullable=False)
    release_date = db.Column(db.Date, nullable=True)
    rating = db.Column(db.String(100), nullable=True)
    global_achievements_avg = db.Column(db.Float, nullable=True)
    # 多对多关系
    types = db.relationship('GameType', secondary=game_game_types, lazy='subquery',
                            backref=db.backref('games', lazy=True))
