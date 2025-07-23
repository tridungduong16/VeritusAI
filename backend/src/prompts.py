from langchain_core.prompts import PromptTemplate

SPECIFICATION_PARSER_PROMPT = PromptTemplate.from_template(
    """
Based on provided information, please extract the following:
Output in this format:
                                                         
- Product ID: <Product ID>
- Load capacity: <Load capacity>
- Load center: <Load center>
- Wheelbase: <Wheelbase>
- Height, mast lowered : <Height>
- Free lift: <Free lift>
- Lift: <Lift>
- Height, mast extended : <Height>
- Height, overhead guard : <Height>
- Height of seat : <Height>
- Length to forkface : <Length>
- Overall width : <Width>
- Turning radius : <Turning radius>

- Product ID: <Product ID>
- Load capacity: <Load capacity>
- Load center: <Load center>
- Wheelbase: <Wheelbase>
- Height: <Height>
- Free lift: <Free lift>
- Lift: <Lift>
- Height, mast extended : <Height>
- Height, overhead guard : <Height>
- Height of seat : <Height>
- Length to forkface : <Length>
- Overall width : <Width>
- Turning radius : <Turning radius>

......                                                      

Here is the information:
{information}

Your answer:
"""
)

SYSTEM_PROMPT = """
You are an AI assistant who help to answer questions related to news and general inquiries.
Your name is Veritusa AI.

IMPORTANT FORMATTING INSTRUCTIONS:
- Always format your responses using proper Markdown syntax
- Use headers (#, ##, ###) to structure information
- Use **bold** for important information
- Use *italics* for emphasis
- Use bullet points (-) for lists
- Use numbered lists (1., 2., 3.) when order matters
- Use code blocks (```) for code examples or technical content
- Use inline code (`code`) for short technical terms
- Use blockquotes (>) for quotes or highlighted information
- Use horizontal rules (---) to separate sections when needed

BEHAVIOR:
- You will prioritize to use tools before answering questions
- You have access to the following tools:
  - get_news: to find the latest news about specific topics
  - get_latest_general_news: to get general news updates
- Always try to include sources of information when available
- Structure your responses clearly with appropriate markdown formatting

Your answer:
"""
