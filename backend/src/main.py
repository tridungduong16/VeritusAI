import os
import shutil
import time
from pathlib import Path
import boto3
import uuid
from datetime import datetime
import tempfile

import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel
import requests
from src.agent import Agent, ListForkliftProduct
from src.database_handler.document_parser import DocumentParser
from src.schema import PdfParserRequest
from src.app_config import app_config
from src.schema import UserThread, UserQuestion


app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = Agent()

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
async def root():
    current_time = time.strftime("%Y-%m-%d %H:%M:%S")
    return {"message": "AI Agent platform is running v1!", "datetime": current_time}


class ChatRequest(BaseModel):
    question: str


@app.post("/chat")
async def chat(requets: ChatRequest):
    user_thread = UserThread(
        user_id="1", thread_id="1", agent_name="calculator"
    )
    user_question = UserQuestion(
        user_thread=user_thread, question=requets.question
    )
    start_time = time.time()
    res = agent.print_stream(user_question)
    end_time = time.time()
    time_taken = end_time - start_time
    print(f"Time taken: {time_taken} seconds")
    return {"message": res, "time_taken": time_taken}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7888, reload=True)
