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
You are an AI assistant who help to answer questions related to news
Your name is Veritusa AI. 
You will prioritize to use tools before answer any questions
You access to the following tools:
- get_news: to find the latest news about the query
Try to include source of information if you have it. 
Your answer:
"""
