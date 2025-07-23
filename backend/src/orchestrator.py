import importlib
import os

import yaml
from dotenv import load_dotenv
from datetime import datetime, UTC
from src.app_config import app_config
from src.database_handler.qdrant_connector import QdrantDBClient
from src.database_handler.document_parser import DocumentParser
from src.database_handler.mongodb_handler import MemoryHandler
from src.agent import Agent
from src.schema import UserQuestion, UserThread

load_dotenv()


class Orchestrator:
    def __init__(self, config_path):
        with open(config_path, "r") as f:
            self.config = yaml.safe_load(f)

    def run(self):
        print(f"Running orchestrator: {self.config}")
        if self.config["modules"][0]["name"] == "document_parser":
            if self.config["modules"][0]["enabled"]:
                print(
                    f"Processing document parser: {self.config['modules'][0]['params']['input_path']}"
                )
                doc_parser = DocumentParser()
                doc_parser.process_folder(
                    self.config["modules"][0]["params"]["input_path"],
                    self.config["modules"][0]["params"]["output_path"],
                )
        if self.config["modules"][1]["name"] == "create_collection":
            if self.config["modules"][1]["enabled"]:
                print(
                    f"Creating collection: {self.config['modules'][1]['params']['collection_name']}"
                )
                collection_name = self.config["modules"][1]["params"]["collection_name"]
                qdrant_handler = QdrantDBClient(collection_name)
                qdrant_handler.connect_to_database()
                qdrant_handler.delete_collection(collection_name)
                qdrant_handler.create_collection(collection_name)

        if self.config["modules"][2]["name"] == "insert_markdown_folder_to_db":
            if self.config["modules"][2]["enabled"]:
                print(
                    f"Inserting markdown folder to db: {self.config['modules'][2]['params']['input_path']}"
                )
                markdown_folder_path = self.config["modules"][2]["params"]["input_path"]
                collection_name = self.config["modules"][2]["params"]["collection_name"]
                qdrant_handler = QdrantDBClient(collection_name)
                qdrant_handler.connect_to_database()
                qdrant_handler.insert_markdown_directory(
                    markdown_folder_path, collection_name
                )
        if (
            self.config["modules"][3]["name"]
            == "convert_pdf_folder_to_markdown_and_add_image_description_and_table"
        ):
            if self.config["modules"][3]["enabled"]:
                print(
                    f"Processing document parser: {self.config['modules'][0]['params']['input_path']}"
                )
                pdf_folder_path = self.config["modules"][3]["params"]["pdf_folder_path"]
                md_folder_path = self.config["modules"][3]["params"]["md_folder_path"]
                images_dir = self.config["modules"][3]["params"]["images_dir"]
                doc_parser = DocumentParser()
                doc_parser.convert_pdf_folder_to_markdown_and_add_image_description_and_table(
                    pdf_folder_path=pdf_folder_path,
                    md_folder_path=md_folder_path,
                    images_dir=images_dir,
                )
        if self.config["modules"][4]["name"] == "similar_search":
            if self.config["modules"][4]["enabled"]:
                print(f"Similar search: {self.config['modules'][4]['params']['query']}")
                collection_name = self.config["modules"][4]["params"]["collection_name"]
                qdrant_handler = QdrantDBClient(collection_name)
                qdrant_handler.connect_to_database()
                res = qdrant_handler.search_similar_texts(
                    self.config["modules"][4]["params"]["query"]
                )
                print(res)
        if self.config["modules"][5]["name"] == "check_conversation_in_db":
            if self.config["modules"][5]["enabled"]:
                handler = MemoryHandler(
                    db_name=app_config.MONGO_DB_NAME,
                    collection_name=app_config.MONGO_COLLECTION_NAME,
                )
                handler.connect_to_database()
                conversation = {
                    "user_thread_infor": {
                        "user_id": "1",
                        "thread_id": "1",
                        "agent_name": "calculator",
                    },
                    "messages": [{"role": "user", "content": "hello world"}],
                    "timestamp": datetime.now(UTC),
                }
                result = handler.insert_one(conversation)
                print(f"Insert result: {result}")
        if self.config["modules"][6]["name"] == "chat_with_agent":
            if self.config["modules"][6]["enabled"]:
                agent = Agent()
                user_thread = UserThread(
                    user_id="1", thread_id="1", agent_name="calculator"
                )
                questions = [
                    "what is specification for D35s-5?",
                    "do the same for D40s-5?",
                ]
                for question in questions:
                    user_question = UserQuestion(
                        user_thread=user_thread, question=question
                    )
                    agent.print_stream(user_question)


def main():
    orchestrator = Orchestrator("./config.yaml")
    orchestrator.run()


if __name__ == "__main__":
    main()
