import time
from collections import deque
from typing import Optional
from Entity.Game import Game, GameType
from Entity.GameRecord import GameRecord
from Entity.User import User
from extensions import db
import dateparser
from config import API_KEY, STEAM_API_BASE_URL
from data.data_API import get_user_name, get_games, get_friends_list, get_global_average_achievement_count, \
    get_achievement_count

# 改成动态获取
START_USER = "76561198381625583"


# 76561198381625583
# 76561198315311042
# 76561199155209999

# 检查该用户是否为公开账户，是则返回他的好友列表和游戏列表以避免多次请求API，不是则返回None
def is_user_data_public(steam_id):
    friends = get_friends_list(steam_id)
    games = get_games(steam_id)

    if friends is not None and games is not None:
        return True, friends, games
    else:
        return False, None, None


# 添加用户，用户游戏记录进入session
def process_game_data(session, user_id, game_info):
    try:
        appid, game_name, playtime, release_date, genres, rating = game_info
        print(f"Processing game: {game_name.encode('utf-8')} for user: {user_id}")

        username = get_user_name(user_id)
        user = session.query(User).filter_by(id=user_id).first()
        # 不在列表中则创建新用户
        if not user:
            user = User(id=user_id, username=username)
            session.add(user)

        achievements_count = get_achievement_count(user_id, appid)

        game = session.query(Game).filter_by(id=appid).first()
        # 不在列表中则创建新游戏
        if not game:
            global_achievements_avg = get_global_average_achievement_count(appid)
            game = Game(id=appid, name=game_name, release_date=dateparser.parse(release_date),
                        rating=rating, global_achievements_avg=global_achievements_avg)
            session.add(game)
            # 不在列表中则创建新类别
            for genre in genres:
                game_type = session.query(GameType).filter_by(type_name=genre).first()
                if not game_type:
                    game_type = GameType(type_name=genre)
                    session.add(game_type)
                game.types.append(game_type)

        game_record = session.query(GameRecord).filter_by(user_id=user.id, game_id=game.id).first()
        # 不在游戏记录中则创建新游戏记录
        if not game_record:
            game_record = GameRecord(user_id=user.id, game_id=game.id, playtime=round(playtime / 60, 1),
                                     achievements_unlocked=achievements_count)
            session.add(game_record)
            print("**********************************************************************")
            print(f"Added game record for user: {user_id} and game: {game_name.encode('utf-8')} ({appid})")
        else:
            # 更新记录
            game_record.playtime = round(playtime / 60, 1)
            game_record.achievements_unlocked = achievements_count

    except Exception as e:
        game_name_msg = f" and game: {game_name.encode('utf-8')}" if 'game_name' in locals() else ""
        print(f"An error occurred while processing user: {user_id}{game_name_msg}. Error: {str(e)}")


def fetch_data():
    start_time = time.time()

    print('fetch 启动！')
    session = db.session()

    initial_id = START_USER
    # 定义已处理过的用户集合，防止好友之间互查嵌套
    users_processed = set()
    # 定义好友队列，把每个用户的好友加入对列以防止初始用户的好友不足50
    user_queue = deque([(initial_id, None)])  # type: deque[tuple[str, Optional[str]]]
    # 定义字典：有效用户，有效用户必须是公开账户且存在游戏记录
    valid_users = {}

    try:
        while user_queue:
            current_id, source_id = user_queue.popleft()

            if current_id in users_processed:  # 如果已经处理过这个用户，跳过
                continue

            users_processed.add(current_id)  # 标记当前用户为已处理

            is_public, friends, games = is_user_data_public(current_id)  # 获取当前用户的公开状态，好友列表和游戏列表

            if is_public:
                if games:  # 向valid_users中添加用户的游戏数据
                    valid_users[current_id] = games

                # 如果是初始用户或者好友数量不足50，则将好友加入队列
                if not source_id or len(valid_users) < 50:
                    user_queue.extend([(f, current_id) for f in friends if f not in users_processed])

            if len(valid_users) >= 50:  # 如果收集到足够的用户，停止
                print(f"Collected enough users: {len(valid_users)}")
                break

        for user, games in valid_users.items():
            for game_info in games:
                process_game_data(session, user, game_info)


    except Exception as e:
        session.rollback()
        print(f"An error occurred: {str(e)}")
    finally:
        session.commit()
        session.close()

    end_time = time.time()
    print(f"Total time taken: {end_time - start_time:.2f} seconds")

# 备用方法，会在添加每一个好友时把他的好友列表中的好友全部加进user_queue，时间复杂度较高，但是稳定，慎用
# while user_queue:
#     current_id, source_id = user_queue.popleft()
#
#     if current_id in users_processed:  # If we've already processed this user, skip
#         continue
#
#     users_processed.add(current_id)  # Mark the current user as processed
#
#     is_public, friends, games = is_user_data_public(current_id)
#
#     if is_public:
#         if games:  # Add the user's games data to valid_users
#             valid_users[current_id] = games
#
#         # Queue the current user's friends
#         user_queue.extend([(f, current_id) for f in friends if f not in users_processed])
#
#     elif source_id:  # If user is private, we move to the next friend of the source user
#         friends_of_source = get_friends_list(source_id)
#         next_friends = [f for f in friends_of_source if f not in users_processed]
#         user_queue.extend([(f, source_id) for f in next_friends])  # Add all next friends to queue
#
#     if len(valid_users) >= 50:  # Stop if we have enough users
#         print(f"Collected enough users: {len(valid_users)}")
#         break
#
# for user, games in valid_users.items():
#     for game_info in games:
#         process_game_data(session, user, game_info)
