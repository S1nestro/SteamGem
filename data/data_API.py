import requests

from data.data_crawler import get_game_details_and_review
from config import STEAM_API_BASE_URL, API_KEY


# 获取用户名称
def get_user_name(steam_id):
    try:
        url = f"{STEAM_API_BASE_URL}ISteamUser/GetPlayerSummaries/v0002/?key={API_KEY}&steamids={steam_id}"
        response = requests.get(url).json()
        return response['response']['players'][0]['personaname'].encode('utf-8').decode('utf-8')
    except Exception as e:
        raise Exception(f"Error fetching name for Steam ID {steam_id}. Error: {str(e)}")


# 获取用户好友列表
def get_friends_list(steam_id):
    try:
        url = f"http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key={API_KEY}&steamid={steam_id}&relationship=friend"
        response = requests.get(url).json()
        if 'friendslist' in response and 'friends' in response['friendslist']:
            return [friend['steamid'] for friend in response['friendslist']['friends']]
        else:
            return []
    except Exception as e:
        raise Exception(f"Error fetching friends list for Steam ID {steam_id}. Error: {str(e)}")


# 获取用户游戏列表以及游戏详情
def get_games(steam_id):
    try:
        url = f'{STEAM_API_BASE_URL}IPlayerService/GetOwnedGames/v0001/?key={API_KEY}&steamid={steam_id}&include_appinfo=1&include_played_free_games=1'
        response = requests.get(url).json()
        if 'response' not in response or 'games' not in response['response']:
            return []
        games = response['response']['games']
        # 按照游玩时长筛选前10个游戏
        games = sorted(games, key=lambda x: x['playtime_forever'], reverse=True)[:10]
        # 定义processed_games填充游戏详情
        processed_games = []
        for game in games:
            appid = game['appid']
            # 转换成utf-8乱码
            game_name = game['name'].encode('utf-8').decode('utf-8')
            playtime = game.get('playtime_forever', 0)
            release_date, genres, rating = get_game_details_and_review(appid)
            # 如果发行日期和类别有空值，我们认为这个游戏不值得被参考
            if release_date and genres:
                processed_games.append((appid, game_name, playtime, release_date, genres, rating))
                # try:
                #     print(f"Processing game {game_name} ({appid}) for user {steam_id}")  # 打印当前处理的游戏
                # except UnicodeEncodeError:
                #     print(f"Processing game {game_name.encode('utf-8')} ({appid}) for user {steam_id}")

        return processed_games
    except Exception as e:
        raise Exception(f"Error fetching games for Steam ID {steam_id}. Error: {str(e)}")


# 获取玩家对某一游戏的成就数
def get_achievement_count(steam_id, appid):
    try:
        url = f'{STEAM_API_BASE_URL}ISteamUserStats/GetPlayerAchievements/v0001/?appid={appid}&key={API_KEY}&steamid={steam_id}'
        response = requests.get(url).json()

        if 'playerstats' in response and 'error' in response['playerstats']:
            if "Profile is not public" in response['playerstats']['error'] or "Requested app has no stats" in response['playerstats']['error']:
                # 表示用户资料不公开或没有数据
                return 0
            else:
                # 抛出其他未知错误
                raise Exception(response['playerstats']['error'])

        if 'playerstats' not in response or 'achievements' not in response['playerstats']:
            return 0

        completed_achievements = sum(
            1 for achievement in response['playerstats']['achievements'] if achievement['achieved'])
        return completed_achievements
    except Exception as e:
        print(f"Error fetching achievements for Steam ID {steam_id} in game {appid}. Error: {str(e)}")
        return 0


# 获取全球玩家对某一游戏的成就百分比
def get_global_average_achievement_count(appid):
    try:
        url = f'{STEAM_API_BASE_URL}ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid={appid}'
        response = requests.get(url).json()

        if 'achievementpercentages' not in response or 'achievements' not in response['achievementpercentages']:
            return 0

        # 计算全球平均完成的成就数
        total_achievements = len(response['achievementpercentages']['achievements'])
        average_completed_achievements = round(
            sum(ach['percent'] / 100 for ach in response['achievementpercentages']['achievements']))

        return average_completed_achievements
    except Exception as e:
        print(f"Error fetching global achievement percentages for game {appid}. Error: {str(e)}")
        return 0

############################################################################################
# Test Part
# steam_id = "76561199155209999"
# appid = "1497440"  # 替换为您想查询的游戏的APPID
# print(get_friends_list(steam_id))
