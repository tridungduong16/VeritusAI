from typing import List

from langchain.output_parsers import PydanticOutputParser
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from pydantic import BaseModel

from src.app_config import app_config
from src.prompts import SPECIFICATION_PARSER_PROMPT
from src.schema import ForkliftProduct, ListForkliftProduct
from src.prompts import SYSTEM_PROMPT
from src.database_handler.qdrant_connector import QdrantDBClient
from src.schema import UserQuestion, ConversationInfor, Message, UserThread
import re
from src.database_handler.mongodb_handler import MemoryHandler
from src.tools.news import get_news_about_specific_topic, get_latest_general_news

class Agent:
    def __init__(self):
        self.database_handler = QdrantDBClient(collection_name=app_config.COLLECTION_NAME_QDRANT)
        self.database_handler.connect_to_database()
        self.memory_handler = MemoryHandler(db_name="test", collection_name=app_config.COLLECTION_NAME_MONGO)
        self.memory_handler.connect_to_database()
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        self.tools = [get_news_about_specific_topic, get_latest_general_news]
        self.react_agent = create_react_agent(
            self.llm, tools=self.tools, prompt=SYSTEM_PROMPT
        )

    def generate_response(self, input: str) -> str:
        ans = self.react_agent.invoke({"input": input})
        res = ans.content
        return res

    def print_stream(self, user_question: UserQuestion):
        self.question = user_question.question
        messages = self._get_chat_history(user_question.user_thread)
        messages.append({"role": "user", "content": user_question.question})
        for s in self.react_agent.stream({"messages": messages}, stream_mode="values"):
            message = s["messages"][-1]
            if isinstance(message, tuple):
                print(message)
            else:
                message.pretty_print()
        self._save_conversation(
            user_question.user_thread, user_question.question, message.content
        )
        return message.content if message else ""

    def _get_chat_history(self, user_thread: UserThread):
        chat_history = self.memory_handler.retrieve_conversation(user_thread)
        if not chat_history or "messages" not in chat_history:
            return []
        messages = chat_history["messages"]
        return [
            {"role": msg["role"], "content": msg["content"]} for msg in messages[-6:]
        ]

    def _save_conversation(self, user_thread: UserThread, question: str, answer: str):
        conversation = ConversationInfor(
            user_thread_infor=user_thread,
            messages=[
                Message(role="user", content=question),
                Message(role="assistant", content=answer),
            ],
        )
        self.memory_handler.insert_or_update_conversation(conversation)