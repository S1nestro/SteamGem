import requests
from bs4 import BeautifulSoup
import threading

# 定义一个全局字典来存储评价标签
review_labels = {}


# 根据HTML标签爬取Steam网页数据
def get_game_details_and_review(game_id):
    url = f"https://store.steampowered.com/app/{game_id}/"

    try:
        response = requests.get(url)
        response.raise_for_status()  # 引发HTTP错误的异常

        soup = BeautifulSoup(response.content, 'html.parser')

        # 获取发布日期
        release_date_tag = soup.find('b', string='Release Date:')
        release_date = release_date_tag.find_next_sibling(text=True) if release_date_tag else None

        # 获取游戏类别
        genre_tag = soup.find('b', string='Genre:')
        genres = [a.text for a in genre_tag.find_next_sibling('span').find_all('a')] if genre_tag else []

        # 获取评价标签
        review_label_tag = soup.find('span', {'class': 'game_review_summary'})
        if review_label_tag:
            review_text = review_label_tag.text.strip()
            if "user reviews" in review_text:
                review_label = 'Mixed'
            else:
                review_label = review_text
        else:
            review_label = None

        return release_date, genres, review_label

    except requests.RequestException as e:
        print(f"Network or request error for game_id {game_id}. Error: {str(e)}")
        return None, None, None
    except Exception as e:
        print(f"General error fetching details for game_id {game_id}. Error: {str(e)}")
        return None, None, None
