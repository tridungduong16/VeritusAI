from typing import List
from typing import Optional
from pydantic import BaseModel


class PdfParserRequest(BaseModel):
    pdf_path: str


class Message(BaseModel):
    role: str
    content: str


class UserThread(BaseModel):
    user_id: str
    thread_id: Optional[str] = "1234"
    agent_name: Optional[str] = "MISS CHINA AI"


class ConversationInfor(BaseModel):
    user_thread_infor: UserThread
    messages: List[Message]


class UserQuestion(BaseModel):
    user_thread: UserThread
    question: str
