from fastapi import FastAPI
from pydantic import BaseModel
import ollama
from fastapi.middleware.cors import CORSMiddleware
import re  # Potrebno za izvlačenje podataka kod peer analize

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Klasa za globalnu analizu (Leva kartica)
class AnalysisRequest(BaseModel):
    text: str

# 2. Klasa za analizu pojedinačnog prijatelja na hover (Three.js Tooltip)
class PeerAnalysisRequest(BaseModel):
    username: str
    peer_text: str

# 3. Klasa za sintezu okruženja (Desna konzola - COGNITION PROFILE)
class ProfileAnalysisRequest(BaseModel):
    metadata_text: str


# =====================================================================
# 1. GLOBALNA ANALIZA KLASTERA (Leva strana ekrana)
# =====================================================================
@app.post("/analyze")
async def analyze(request: AnalysisRequest):
    content_snapshot = request.text[:2500]
    
    prompt = f"""
    Task: You are an expert forensic text analyst. Analyze the following messages and posts (which are written in English):
    \"\"\"{content_snapshot}\"\"\"

    Strictly provide the analysis in English, using the exact format below. 
    CRITICAL RULE: Do NOT use any markdown formatting, do NOT use bold text, and do NOT use double asterisks (**). Write pure, flat text.
    Do not include any intro, outro, or conversational filler.

    TOPIC: [One or two words representing the main subject, e.g., Network Breach, Soccer Match, API Sync]
    SENTIMENT: [Strictly choose only one: Positive, Negative, or Neutral]
    SUMMARY: [A concise, maximum 2-sentence summary explaining what this group of people is discussing based on their data. Do NOT use the words 'BEHAVIORAL SUMMARY' or asterisks.]
    """
    
    response = ollama.chat(model="llama3.2:1b", messages=[
        {
            "role": "system",
            "content": "You are a precise data analysis bot. You output flat text without any bolding or markdown asterisks. You follow the requested template blindly."
        },
        {
            "role": "user",
            "content": prompt
        }
    ])
    
    return {"analysis": response['message']['content']}


# =====================================================================
# 2. PEER HOVER ANALIZA (Three.js Tooltip na planetama)
# =====================================================================
@app.post("/analyze-peer")
async def analyze_peer(request: PeerAnalysisRequest):
    content_snapshot = request.peer_text[:3000]
    
    if not content_snapshot.strip():
        return {
            "relationship": "No Direct Data",
            "analysis": "No communication history found for this specific user in the selected timeline.",
            "anomaly": "No timeline anomalies could be computed."
        }

    prompt = f"""
    Task: You are a cyber-forensic behavioral analyst. Analyze the direct communication and timeline between the Main User and the friend '{request.username}':
    \"\"\"{content_snapshot}\"\"\"

    Analyze their dynamic, topics, and timeline shifts over the years (2020-2027). 
    Strictly reply in English using the exact format below, with no intro/outro or conversational filler:
    RELATIONSHIP: [Identify their dynamic in 1-3 words, e.g., Close Friends, Professional Colleagues, Suspect Alliance, Estranged Peers]
    ANALYSIS: [A concise 2-sentence breakdown of what they discuss most and the nature of their relationship dynamic.]
    ANOMALY: [Identify any specific anomaly between these two. Examples: "Sudden communication drop after 2025", "Shift from technical talk to midnight encrypted alerts", "None detected; stable interaction pattern."]
    """
    
    response = ollama.chat(model="llama3.2:1b", messages=[
        {
            "role": "system", 
            "content": "You are a precise peer-to-peer forensic intelligence bot. You strictly reply in professional English using the requested template."
        },
        {
            "role": "user", 
            "content": prompt
        }
    ])
    
    raw_res = response['message']['content']
    
    rel_match = re.search(r"RELATIONSHIP:\s*(.*)", raw_res, re.IGNORECASE)
    ans_match = re.search(r"ANALYSIS:\s*([\s\S]*?)(?=ANOMALY:|$)", raw_res, re.IGNORECASE)
    anom_match = re.search(r"ANOMALY:\s*([\s\S]*)", raw_res, re.IGNORECASE)
    
    return {
        "relationship": rel_match.group(1).strip() if rel_match else "Undetermined",
        "analysis": ans_match.group(1).strip() if ans_match else raw_res,
        "anomaly": anom_match.group(1).strip() if anom_match else "No specific anomaly detected."
    }


# =====================================================================
# 3. SINTEZA DEMOGRAFSKOG PROFILA (Desna konzola - COGNITION PROFILE)
# =====================================================================
@app.post("/analyze-profile")
async def analyze_profile(request: ProfileAnalysisRequest):
    stats_data = request.metadata_text if request.metadata_text else "No metrics available."
    
    prompt = f"""
    Task: You are a senior forensic behavioral intelligence analyst.
    Analyze the following computed demographic and geographic stats about the main user's communication environment:
    \"\"\"{stats_data}\"\"\"

    Strictly provide a concise 2-sentence synthesis profile in professional English detailing WHO the user is interacting with, WHERE they are located, and if there is any operational threat or core affinity based on the sector profile.
    
    CRITICAL RULES:
    1. Do NOT use any markdown formatting, bold text, or double asterisks (**). Output pure flat text.
    2. Do NOT use any introductory or concluding phrases (e.g., "Based on the analysis...", "The report shows..."). Start directly with the core forensic synthesis.
    3. Your output MUST be written strictly in English language.
    """
    
    try:
        response = ollama.chat(model="llama3.2:1b", messages=[
            {
                "role": "system",
                "content": "You are a precise forensic analyst. You output flat text strictly in English language without any bolding or asterisks."
            },
            {
                "role": "user",
                "content": prompt
            }
        ])
        
        clean_res = response['message']['content'].replace('*', '').strip()
        return {"profile_synthesis": clean_res}
        
    except Exception as e:
        return {"profile_synthesis": f"Error communicating with local intelligence core: {str(e)}"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)