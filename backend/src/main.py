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


@app.post("/pdf_parser")
async def pdf_parser(file: UploadFile = File(...)) -> ListForkliftProduct:
    try:
        file_data = await file.read()
        s3_url = upload_file_to_s3(file_data, file.filename)
        response = requests.get(s3_url)
        if response.status_code != 200:
            raise HTTPException(
                status_code=400, detail="Failed to download PDF from S3 URL."
            )
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(response.content)
            tmp_pdf_path = tmp_file.name
        data_parser = DocumentParser()
        markdown = data_parser.parse_pdf_and_extract_tables_to_markdown(tmp_pdf_path)
        result = agent.parse_specification(markdown)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# @app.post("/pdf_parser")
# async def pdf_parser(request: PdfParserRequest) -> ListForkliftProduct:
#     try:
#         data_parser = DocumentParser()
#         res = data_parser.parse_pdf_and_extract_tables_to_markdown(request.pdf_path)
#         res = agent.parse_specification(res)
#         return res
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


def random_filename(extension: str) -> str:
    return f"{uuid.uuid4().hex}{extension}"


def upload_file_to_s3(file_data: bytes, filename: str) -> str:
    today = datetime.now().strftime("%Y/%m/%d")
    ext = os.path.splitext(filename)[1]
    short_name = random_filename(ext)
    object_key = f"uploads/{today}/{short_name}"
    s3 = boto3.client(
        "s3",
        aws_access_key_id=app_config.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=app_config.AWS_SECRET_ACCESS_KEY,
        region_name=app_config.AWS_REGION,
    )
    s3.put_object(
        Bucket=app_config.AWS_BUCKET_NAME,
        Key=object_key,
        Body=file_data,
        ContentType="application/pdf",
    )
    url = f"https://{app_config.AWS_BUCKET_NAME}.s3.{app_config.AWS_REGION}.amazonaws.com/{object_key}"
    return url


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    file_data = await file.read()
    s3_url = upload_file_to_s3(file_data, file.filename)
    return {"filename": file.filename, "s3_url": s3_url}


class ChatRequest(BaseModel):
    question: str


@app.post("/chat")
async def chat(requets: ChatRequest):
    llm = Agent()
    messages = []
    messages.append({"role": "user", "content": requets.question})
    res = llm.print_stream({"messages": messages})
    print(res)
    return {"message": res}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7888, reload=True)
