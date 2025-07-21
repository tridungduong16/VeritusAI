from newsapi import NewsApiClient
from app_config import app_config

api = NewsApiClient(api_key=app_config.NEWS_API_KEY)


def get_news(query: str):
    return api.get_top_headlines(q=query)
