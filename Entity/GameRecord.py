from extensions import db


class GameRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # 记录ID
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 用户ID
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)  # 游戏ID
    playtime = db.Column(db.Float, nullable=True)  # 游玩时长
    achievements_unlocked = db.Column(db.Integer, nullable=False, default=0)  # 已解锁的成就数量
    # 建立关系, 这会方便你在代码中从一个GameRecord对象访问对应的User和Game对象
    user = db.relationship('User', backref='game_records')
    game = db.relationship('Game', backref='game_records')
