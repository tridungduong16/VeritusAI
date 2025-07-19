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


class Agent:
    def __init__(self):

        self.database_handler = QdrantDBClient(collection_name="brochure")
        self.database_handler.connect_to_database()

        self.memory_handler = MemoryHandler(db_name="test", collection_name="test")
        self.memory_handler.connect_to_database()

        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        self.tools = [self.database_handler.search_similar_texts]
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
        import pdb

        pdb.set_trace()
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

    def parse_specification(self, information: str) -> List[ForkliftProduct]:
        """Parse structured forklift product specs from natural language input."""
        llm = ChatOpenAI(
            model=app_config.OPENAI_MODEL_NAME,
            temperature=0.1,
            top_p=0.1,
            frequency_penalty=0.2,
            presence_penalty=0.2,
        )
        prompt_chain = SPECIFICATION_PARSER_PROMPT | llm
        response = prompt_chain.invoke({"information": information})
        product_info = self._parse_product_info(response.content)
        # import pdb; pdb.set_trace()
        products = [ForkliftProduct(**p) for p in product_info]
        res = ListForkliftProduct(products=products)
        return res

    def _parse_product_info(self, product_info_str: str) -> List[dict]:
        products = []
        product_blocks = product_info_str.strip().split("\n\n")
        for block in product_blocks:
            lines = block.strip().split("\n")
            product_dict = {}
            for line in lines:
                line = line.strip()
                if line.startswith("- ") and ": " in line:
                    # Remove the '- ' prefix
                    line = line[2:]
                    key, value = line.split(": ", 1)

                    # Handle the Product ID specially
                    if key == "Product ID":
                        product_dict["product_id"] = value.strip()
                    else:
                        # Convert key to snake_case
                        key = key.strip().lower().replace(", ", "_").replace(" ", "_")
                        value = value.strip()

                        # Parse numeric values
                        numeric_fields = [
                            "load_capacity",
                            "load_center",
                            "wheelbase",
                            "height_mast_lowered",
                            "height_mast_extended",
                            "height_overhead_guard",
                            "height_of_seat",
                            "free_lift",
                            "lift",
                            "length_to_forkface",
                            "overall_width",
                            "turning_radius",
                        ]

                        if key in numeric_fields:
                            # Remove non-numeric characters except decimal point
                            numeric_value = re.sub(r"[^\d.]", "", value)
                            try:
                                # Try to convert to int first, then float
                                if "." not in numeric_value:
                                    value = int(numeric_value)
                                else:
                                    value = float(numeric_value)
                            except ValueError:
                                # Keep original value if conversion fails
                                pass

                        product_dict[key] = value

            # Add product only if it has a product_id
            if "product_id" in product_dict:
                products.append(product_dict)

        return products
