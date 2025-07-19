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
You are a helpful assistant that can answer questions about the provided information.

You access to the following tools:
- search_similar_texts: to find information from database by using similar search

Always use search_similar_texts tool to find information from database before answer.
Try to include source of information if you have it. 
Image url can be included if you have it. 
If questions is related to comparison, try to give answer as table also and clearly provide differrence. 
Your answer:
"""
