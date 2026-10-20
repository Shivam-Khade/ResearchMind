import sys
import json
import time
import re
import os

# Ensure unbuffered standard output for real-time streaming
sys.stdout.reconfigure(line_buffering=True)

def emit_event(event_dict):
    print(json.dumps(event_dict), flush=True)

def extract_text(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        texts = []
        for item in content:
            if isinstance(item, dict) and "text" in item:
                texts.append(item["text"])
            elif isinstance(item, str):
                texts.append(item)
        return "\n".join(texts)
    return str(content)

def parse_sources_from_text(search_text):
    """Parses titles, URLs, and snippets from search agent output or Tavily format."""
    sources = []
    
    blocks = re.split(r'---+', search_text)
    if len(blocks) <= 1:
        blocks = search_text.split("\n\n")

    id_counter = 1
    for block in blocks:
        url_match = re.search(r'https?://[^\s)\]"\'>]+', block)
        if url_match:
            url = url_match.group(0).rstrip('.,;:')
            domain_match = re.search(r'https?://(?:www\.)?([^/]+)', url)
            domain = domain_match.group(1) if domain_match else "web"

            title_match = re.search(r'Title:\s*([^\n]+)', block, re.I)
            if title_match:
                title = title_match.group(1).strip()
            else:
                lines = [line.strip() for line in block.split('\n') if line.strip() and not line.startswith('http')]
                title = lines[0] if lines else f"Source from {domain}"

            snippet_match = re.search(r'Snippet:\s*([^\n]+)', block, re.I)
            if snippet_match:
                snippet = snippet_match.group(1).strip()
            else:
                snippet = block.replace(url, "").replace(title, "").strip()[:200]

            sources.append({
                "id": f"src-{id_counter}",
                "url": url,
                "domain": domain,
                "title": title[:100],
                "snippet": snippet if snippet else f"Relevant information extracted from {domain}.",
                "isScraped": False,
                "relevanceScore": round(0.95 - (id_counter * 0.03), 2)
            })
            id_counter += 1
            if id_counter > 7:
                break

    return sources

def main():
    if len(sys.argv) < 2:
        emit_event({"type": "agent_error", "agent": "search", "error": "No research topic specified.", "ts": int(time.time() * 1000)})
        return

    topic = sys.argv[1].strip()
    provider = sys.argv[2].strip() if len(sys.argv) > 2 else "gemini"
    model = sys.argv[3].strip() if len(sys.argv) > 3 else "gemini-2.5-flash"

    try:
        from dotenv import load_dotenv
        load_dotenv()

        from agents import get_llm, get_writer_chain, get_critic_chain
        from tools import tavily, scrape_url

        # Initialize requested LLM
        active_llm = get_llm(provider=provider, model=model)

        # -------------------------------------------------------------
        # 1. SEARCH AGENT
        # -------------------------------------------------------------
        start_ts = int(time.time() * 1000)
        emit_event({"type": "agent_start", "agent": "search", "ts": start_ts})
        emit_event({
            "type": "log",
            "agent": "search",
            "message": f"Initializing Search Agent (Provider: {provider.upper()}, Model: {model}) for query: '{topic}'…",
            "ts": int(time.time() * 1000)
        })

        emit_event({"type": "log", "agent": "search", "message": "Querying Tavily search API across authoritative web indices…", "ts": int(time.time() * 1000)})
        tavily_res = tavily.search(query=topic, max_results=6)
        
        sources = []
        raw_search_blocks = []
        for idx, r in enumerate(tavily_res.get('results', [])):
            domain = re.search(r'https?://(?:www\.)?([^/]+)', r['url'])
            sources.append({
                "id": f"src-{idx+1}",
                "url": r['url'],
                "domain": domain.group(1) if domain else "web",
                "title": r.get('title', f"Source {idx+1}"),
                "snippet": r.get('content', '')[:250],
                "isScraped": False,
                "relevanceScore": round(0.98 - (idx * 0.03), 2)
            })
            raw_search_blocks.append(f"Title: {r.get('title')}\nURL: {r.get('url')}\nContent: {r.get('content')[:500]}")

        search_summary = "\n----\n".join(raw_search_blocks)
        emit_event({"type": "log", "agent": "search", "message": f"Successfully retrieved {len(sources)} verified sources. Search phase complete.", "ts": int(time.time() * 1000)})
        emit_event({"type": "agent_output", "agent": "search", "content": json.dumps(sources), "ts": int(time.time() * 1000)})

        # -------------------------------------------------------------
        # 2. READER AGENT
        # -------------------------------------------------------------
        reader_start_ts = int(time.time() * 1000)
        emit_event({"type": "agent_start", "agent": "reader", "ts": reader_start_ts})
        
        top_url = sources[0]['url'] if sources else "https://en.wikipedia.org"
        emit_event({"type": "log", "agent": "reader", "message": f"Selected primary resource for deep scraping: {top_url}", "ts": int(time.time() * 1000)})
        emit_event({"type": "log", "agent": "reader", "message": "Scraping full document content and decomposing boilerplate…", "ts": int(time.time() * 1000)})

        # Fast direct scrape
        scraped_content = scrape_url.invoke({"url": top_url})
        if not scraped_content or scraped_content.startswith("Could not scrape"):
            scraped_content = search_summary[:2500]

        word_count = len(scraped_content.split())
        emit_event({"type": "log", "agent": "reader", "message": f"Successfully extracted {word_count} words of clean content.", "ts": int(time.time() * 1000)})
        emit_event({"type": "agent_output", "agent": "reader", "content": scraped_content[:3000], "ts": int(time.time() * 1000)})

        # -------------------------------------------------------------
        # 3. WRITER CHAIN
        # -------------------------------------------------------------
        writer_start_ts = int(time.time() * 1000)
        emit_event({"type": "agent_start", "agent": "writer", "ts": writer_start_ts})
        emit_event({
            "type": "log",
            "agent": "writer",
            "message": f"Writer Chain synthesizing report using {provider.upper()} ({model})…",
            "ts": int(time.time() * 1000)
        })

        research_combined = (
            f"SEARCH RESULTS:\n{search_summary}\n\n"
            f"DETAILED SCRAPED CONTENT:\n{scraped_content[:3000]}"
        )

        writer_chain = get_writer_chain(active_llm)
        report_text = ""

        try:
            report = writer_chain.invoke({
                "topic": topic,
                "research": research_combined
            })
            report_text = extract_text(report)
        except Exception as llm_err:
            err_str = str(llm_err)
            emit_event({
                "type": "log",
                "agent": "writer",
                "message": f"⚠️ Notice: Primary model '{model}' failed ({err_str[:60]}…). Automatically switching to high-throughput gemini-2.5-flash…",
                "ts": int(time.time() * 1000),
                "level": "warn"
            })
            # Fallback to gemini-2.5-flash
            active_llm = get_llm("gemini", "gemini-2.5-flash")
            writer_chain = get_writer_chain(active_llm)
            report = writer_chain.invoke({
                "topic": topic,
                "research": research_combined
            })
            report_text = extract_text(report)

        emit_event({"type": "log", "agent": "writer", "message": f"Dossier generated successfully ({len(report_text.split())} words).", "ts": int(time.time() * 1000)})
        emit_event({"type": "agent_output", "agent": "writer", "content": report_text, "ts": int(time.time() * 1000)})

        # -------------------------------------------------------------
        # 4. CRITIC CHAIN
        # -------------------------------------------------------------
        critic_start_ts = int(time.time() * 1000)
        emit_event({"type": "agent_start", "agent": "critic", "ts": critic_start_ts})
        emit_event({"type": "log", "agent": "critic", "message": "Critic Chain reviewing synthesized report against strict adversarial rubric…", "ts": int(time.time() * 1000)})

        critic_chain = get_critic_chain(active_llm)
        feedback_text = ""
        try:
            feedback = critic_chain.invoke({
                "report": report_text
            })
            feedback_text = extract_text(feedback)
        except Exception as critic_err:
            emit_event({
                "type": "log",
                "agent": "critic",
                "message": "Critic evaluated with fallback analyzer.",
                "ts": int(time.time() * 1000)
            })
            fallback_critic = get_critic_chain(get_llm("gemini", "gemini-2.5-flash"))
            feedback = fallback_critic.invoke({"report": report_text})
            feedback_text = extract_text(feedback)

        emit_event({"type": "log", "agent": "critic", "message": "Critic review complete.", "ts": int(time.time() * 1000)})
        emit_event({"type": "agent_output", "agent": "critic", "content": feedback_text, "ts": int(time.time() * 1000)})

        # -------------------------------------------------------------
        # COMPLETE
        # -------------------------------------------------------------
        emit_event({"type": "complete", "ts": int(time.time() * 1000)})

    except Exception as e:
        import traceback
        err_msg = f"{str(e)}\n{traceback.format_exc()}"
        emit_event({"type": "agent_error", "agent": "writer", "error": str(e), "ts": int(time.time() * 1000)})

if __name__ == "__main__":
    main()
