import json
import random
import requests
import time
from datetime import datetime, timedelta

# =====================================================================
# CONFIGURATOR: VEZA SA LOKALNOM LLAMOM I PUTANJE (Tvoja struktura)
# =====================================================================
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.2:1b"  # Promeni u "llama3.2" ako je u Ollami drugačije
INPUT_PATH = '../client/src/assets/user.json'

start_date = datetime(2022, 8, 1)
end_date = datetime(2026, 7, 31)

def generate_random_timestamp(start, end, specific_month=None, specific_year=None):
    """Generiše potpuno nepravilan i organski timestamp (Format: MM/DD/YYYY)."""
    if specific_month and specific_year:
        current_start = datetime(specific_year, specific_month, 1)
        if specific_month == 12:
            current_end = datetime(specific_year + 1, 1, 1) - timedelta(seconds=1)
        else:
            current_end = datetime(specific_year, specific_month + 1, 1) - timedelta(seconds=1)
    else:
        current_start = start
        current_end = end

    delta_days = (current_end - current_start).days
    if delta_days <= 0:
        delta_days = 1
    
    random_days = random.randint(0, delta_days)
    random_dt = current_start + timedelta(days=random_days)
    return random_dt.strftime("%m/%d/%Y")

def ask_llama_agent(prompt_text):
    """AI Agent: Povlači masovni rezervoar čistih linija teksta od Llame."""
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt_text + "\nOutput ONLY plain text lines, one per line. No numbers, no bullet points, no quotes.",
        "stream": False
    }
    try:
        response = requests.post(OLLAMA_URL, json=payload)
        output = response.json().get("response", "").strip()
        return [line.strip() for line in output.split('\n') if line.strip() and not line.startswith(('1.', '2.', '-', '['))]
    except Exception as e:
        print(f"\n⚠️ Llama Error: {e}. Koristim backup.")
        return ["Routine testing on deployment triggers."]

# =====================================================================
# SYNCHRONIZER: UČITAVANJE ORIGINALNOG JSON-A
# =====================================================================
with open(INPUT_PATH, 'r', encoding='utf-8') as f:
    database = json.load(f)

friends = database.get("friends", [])
friend_ids = [f["id"] for f in friends]

if not friends:
    print(f"❌ Greška: Podaci o prijateljima nisu pronađeni u {INPUT_PATH}")
    exit()

# Definisanje dve glavne mete za forenzičke anomalije
target_1 = friends[0]
target_2 = friends[1] if len(friends) > 1 else friends[0]

target_1["username"] = "alex_dev"
target_1["profession"] = "Senior DevOps Engineer"
target_2["username"] = "clara_matrix"
target_2["profession"] = "Cyber Security Analyst"

print("=====================================================================")
print(f"🤖 AGENT POKRENUT: MASOVNA FORENZIČKA GENERACIJA ZA {len(friends)} PRIJATELJA")
print("=====================================================================")
print(f"   -> Target 1 (Insider Burst): ID {target_1['id']} (@{target_1['username']})")
print(f"   -> Target 2 (Ghost DM Channel): ID {target_2['id']} (@{target_2['username']})")
print("=====================================================================\n")

# =====================================================================
# PHASE 1: AGENT GENERIŠE REZERVOARE KVALITETNIH TEKSTOVA (BATCHES)
# =====================================================================
print("🧠 [Phase 1/3] Agent prikuplja masovne tekstualne pakete od Llame...")

prompt_tech = "Generate 60 distinct, short professional chat messages in English about code deployment, server logs, database bug fixes, Jenkins pipelines, and server uptime status questions."
tech_pool = ask_llama_agent(prompt_tech)
if len(tech_pool) < 15: tech_pool += ["Can you check the server logs for errors?", "Pipeline deployment looks green.", "Review the database deployment script."]

prompt_casual = "Generate 60 short, informal daily life chat messages in English (e.g., concert plans, grabbing a beer tonight, football match, short random questions)."
casual_pool = ask_llama_agent(prompt_casual)
if len(casual_pool) < 15: casual_pool += ["Hey, are we still on for coffee?", "Sounds good, see you tomorrow!", "Let me know when you check it."]

prompt_hacker = "Generate 50 highly suspicious, urgent chat messages in English about copying sensitive internal backup dumps, bypassing network controls, and wiping system tracking logs."
hacker_pool = ask_llama_agent(prompt_hacker)

prompt_tunnel = "Generate 50 cryptic, secretive chat messages in English between two security operators establishing an encrypted proxy tunnel, secure handshake, and bypassing firewalls."
tunnel_pool = ask_llama_agent(prompt_tunnel)

# =====================================================================
# PHASE 2: GENERISANJE STRUKTURIRANIH PORUKA (MESSAGES) BEZ MENJANJA FORMATA
# =====================================================================
print("\n⚡ [Phase 2/3] Agent puni strukture poruka na sofisticiranom nivou...")
new_messages_array = []
total_friends = len(friends)
start_time = time.time()

for idx, friend in enumerate(friends):
    f_id = friend["id"]
    f_name = f"{friend.get('firstName', 'Unknown')} {friend.get('lastName', 'Node')}"
    f_job = friend.get("profession", "Specialist").lower()

    # Vremenska procena (ETA) i Progres Bar u konzoli
    elapsed = time.time() - start_time
    avg_time = elapsed / idx if idx > 0 else 0
    eta = int(avg_time * (total_friends - idx))
    eta_str = f"{eta}s remaining" if idx > 0 else "Calculating..."
    
    bar_len = 20
    filled = int(bar_len * idx // total_friends)
    bar = '█' * filled + '░' * (bar_len - filled)
    print(f"\r[{bar}] {int((idx/total_friends)*100)}% | ETA: {eta_str} | Processing: {f_name[:15]}", end="", flush=True)

    friend_messages = []
    num_logs = 0

    # Primena pravila asimetrije i anomalija (5-10x više podataka!)
    if f_id == target_1["id"]:
        # Haker: 30 redovnih + 120 RAFALNIH sumnjivih poruka
        num_logs = 30
        for _ in range(120):
            friend_messages.append({
                "content": f"[CRITICAL_ALERT] {random.choice(hacker_pool)}",
                "timestamp": generate_random_timestamp(start_date, end_date, specific_month=10, specific_year=2025),
                "received": random.choice(["true", "false"])
            })
    elif f_id == target_2["id"]:
        # Ghost Channel: Potpuni mrak 3 godine, pa 140 poruka u Januaru 2026!
        for _ in range(140):
            friend_messages.append({
                "content": f"[SECURE_CHANNEL] {random.choice(tunnel_pool)}",
                "timestamp": generate_random_timestamp(start_date, end_date, specific_month=1, specific_year=2026),
                "received": random.choice(["true", "false"])
            })
        num_logs = 0
    else:
        # Svi ostali prijatelji - Duboka asimetrija (Masivni skup podataka)
        tier_roll = random.random()
        if "engineer" in f_job or "developer" in f_job or "tech" in f_job:
            num_logs = random.randint(40, 85)  # Kolege sa visokim brojem poruka
        elif tier_roll < 0.25:
            num_logs = random.randint(30, 60)  # Porodica / Bliski kontakti
        elif tier_roll < 0.70:
            num_logs = random.randint(10, 20)  # Umereni kontakti
        else:
            num_logs = random.randint(2, 5)    # Retki kontakti (SNE čvorovi)

    # Puni poruke iz odgovarajućih rezervoara
    for _ in range(num_logs):
        pool = tech_pool if ("engineer" in f_job or "developer" in f_job or "tech" in f_job) else casual_pool
        friend_messages.append({
            "content": random.choice(pool),
            "timestamp": generate_random_timestamp(start_date, end_date),
            "received": random.choice(["true", "false"])
        })

    # Sortiranje poruka ovog prijatelja hronološki da se grafikoni ne zbune
    friend_messages.sort(key=lambda x: datetime.strptime(x['timestamp'], "%m/%d/%Y"))

    # Pakujemo nazad prateći tačnu tvoju strukturu objekta
    new_messages_array.append({
        "friend_id": f_id,
        "messages": friend_messages
    })

# =====================================================================
# PHASE 3: AGENT GENERIŠE POSTOVE I AKTUELNE INTERAKCIJE (POSTS)
# =====================================================================
print("\n\n📝 [Phase 3/3] Agent preusmerava Llamu na masovne javne postove...")

prompt_posts = "Generate 12 distinct, professional technical infrastructure updates or cyber status messages in English. One per line."
post_pool = ask_llama_agent(prompt_posts)
if len(post_pool) < 5: post_pool = ["Mainframe security baseline refactored successfully.", "Anomalous router traffic trace detected in western segment."]

new_posts = []
# Pravimo masovan i nepravilan skup postova na osnovu prijatelja
for friend in friends:
    f_id = friend["id"]
    # Svaki prijatelj ima 30% šanse da napiše 1-2 posta (asimetrija)
    if random.random() < 0.35:
        for p_idx in range(random.randint(1, 2)):
            
            # Određivanje tipa posta na osnovu uloge
            if f_id == target_1["id"]:
                p_type = "Status"
                content = f"[SYSTEM ALERT] {random.choice(hacker_pool)}"
            elif "engineer" in friend.get("profession", "").lower():
                p_type = "Document"
                content = random.choice(tech_pool)
            else:
                p_type = random.choice(["Image", "Video"])
                content = random.choice(casual_pool)

            num_likes = random.randint(5, min(25, len(friend_ids)))
            random_likes = random.sample(friend_ids, num_likes)
            
            # Target 2 nikada ne komunicira javno na feedu!
            if target_2["id"] in random_likes:
                random_likes.remove(target_2["id"])

            new_posts.append({
                "id": f"post-{f_id}-{p_idx}",
                "author_id": f_id,
                "type": p_type,
                "content": content,
                "timestamp": generate_random_timestamp(start_date, end_date),
                "to": None,
                "interactions": {
                    "likes": random_likes,
                    "comments": []
                }
            })

# Sortiranje svih postova hronološki
new_posts.sort(key=lambda x: datetime.strptime(x['timestamp'], "%m/%d/%Y"))

# =====================================================================
# SAVE STRUCTURE: STRUKTURNO PAKOVANJE KOJE JE ODMAH INTEGRABILNO
# =====================================================================
database["messages"] = new_messages_array
database["posts"] = new_posts

with open(INPUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(database, f, indent=2, ensure_ascii=False)

total_duration = int(time.time() - start_time)
print("\n=====================================================================")
print(f"🚀 POKIDALI SMO! | Total Generation Time: {total_duration}s")
print("=====================================================================")
print(f"   -> Struktura `messages` i `posts` je 100% IDZENTIČNA staroj formaciji.")
print(f"   -> Sačuvani ključevi: `friend_id`, `messages` unutra, `received: true/false`.")
print(f"   -> Baza podataka je napunjena sa 5-10x više masovnog i pametnog saobraćaja.")
print("=====================================================================\n")