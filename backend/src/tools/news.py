from newsapi import NewsApiClient
from src.app_config import app_config
import requests 

api = NewsApiClient(api_key=app_config.NEWS_API_KEY)

def get_news_about_specific_topic(query: str):
    """
    This tool is used to get the latest news about the query
    Args:
        query: str
    Returns:
        list of news articles
    """
    news = api.get_everything(q=query, sort_by="publishedAt")
    return news['articles'][:30]



def get_latest_general_news():
    """
    Fetches the latest news articles

    Returns:
        list: Up to 20 news article objects
    """
    url = "https://newsdata.io/api/1/latest"
    params = {
        "apikey": app_config.NEWSDATA_API,
        "country": "us",
        "prioritydomain": "top"
    }
    response = requests.get(url, params=params)
    if response.status_code != 200:
        raise Exception(f"❌ API request failed: {response.status_code} - {response.text}")
    data = response.json()
    return data.get("results", [])[:20]