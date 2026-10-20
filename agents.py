import os
from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from tools import web_search, scrape_url 
from dotenv import load_dotenv

load_dotenv()

def get_llm(provider="gemini", model="gemini-2.5-flash", api_key=None):
    provider = (provider or "gemini").lower()
    
    if provider == "groq":
        try:
            from langchain_groq import ChatGroq
            key = api_key or os.getenv("GROQ_API_KEY")
            return ChatGroq(model=model or "llama-3.3-70b-versatile", api_key=key)
        except Exception as e:
            print(f"Warning: Failed initializing Groq LLM ({e}), falling back to gemini-2.5-flash")
            return ChatGoogleGenerativeAI(model="gemini-2.5-flash")

    elif provider in ("huggingface", "hf"):
        try:
            from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
            token = api_key or os.getenv("HUGGINGFACEHUB_ACCESS_TOKEN")
            endpoint = HuggingFaceEndpoint(
                repo_id=model or "meta-llama/Llama-3.3-70B-Instruct",
                huggingfacehub_api_token=token,
                task="text-generation",
                max_new_tokens=1500,
            )
            return ChatHuggingFace(llm=endpoint)
        except Exception as e:
            print(f"Warning: Failed initializing HuggingFace LLM ({e}), falling back to gemini-2.5-flash")
            return ChatGoogleGenerativeAI(model="gemini-2.5-flash")

    # Default: Google Gemini
    model_name = model or "gemini-2.5-flash"
    google_key = api_key or os.getenv("GOOGLE_API_KEY")
    return ChatGoogleGenerativeAI(model=model_name, google_api_key=google_key)

# Default LLM instance
llm = get_llm("gemini", "gemini-2.5-flash")

def build_search_agent(active_llm=None):
    return create_agent(
        model=active_llm or llm,
        tools=[web_search]
    )

def build_reader_agent(active_llm=None):
    return create_agent(
        model=active_llm or llm,
        tools=[scrape_url]
    )

writer_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert research writer. Write clear, structured and insightful reports."),
    ("human", """Write a detailed research report on the topic below.

Topic: {topic}

Research Gathered:
{research}

Structure the report as:
- Introduction
- Key Findings (minimum 3 well-explained points)
- Conclusion
- Sources (list all URLs found in the research)

Be detailed, factual and professional."""),
])

def get_writer_chain(active_llm=None):
    target_llm = active_llm or llm
    return writer_prompt | target_llm | StrOutputParser()

writer_chain = get_writer_chain(llm)

critic_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a sharp and constructive research critic. Be honest and specific."),
    ("human", """Review the research report below and evaluate it strictly.

Report:
{report}

Respond in this exact format:

Score: X/10

Strengths:
- ...
- ...

Areas to Improve:
- ...
- ...

One line verdict:
..."""),
])

def get_critic_chain(active_llm=None):
    target_llm = active_llm or llm
    return critic_prompt | target_llm | StrOutputParser()

critic_chain = get_critic_chain(llm)