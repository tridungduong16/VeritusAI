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
from backend.src.tts.openai import TTSService

load_dotenv()


class Orchestrator:
    def __init__(self, config_path):
        with open(config_path, "r") as f:
            self.config = yaml.safe_load(f)

    def run(self):
        print(f"Running orchestrator: {self.config}")
        if self.config["modules"][0]["name"] == "convert_markdown_folder_to_speech":
            if self.config["modules"][0]["enabled"]:
                tts_service = TTSService()
                tts_service.convert_markdown_folder_to_speech(
                    self.config["modules"][0]["params"]["input_path"],
                    self.config["modules"][0]["params"]["output_path"],
                    self.config["modules"][0]["params"]["language"],
                    self.config["modules"][0]["params"]["overwrite"],
                )

def main():
    orchestrator = Orchestrator("./config.yaml")
    orchestrator.run()


if __name__ == "__main__":
    main()
