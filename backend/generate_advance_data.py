import json
import random
from datetime import datetime, timedelta
import ollama  # Uvozimo lokalnu Llamu

# 1. Učitavamo tvoj postojeći fajl da sačuvamo strukturu
with open('../client/src/assets/user.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

friends = data['friends']
friend_ids = [f['id'] for f in friends]

# --- 1. AI GENERATOR ZA CHAT PORUKE ---
def generisi_ai_message(odnos_tip):
    if odnos_tip == "posao":
        prompt = "Write a single, concise chat message between two tech colleagues. Topics: quick code deployment questions, server status, database bugs, or setting up a quick meeting. Reply with ONLY that one sentence, no quotes, no intro."
    elif odnos_tip == "sumnjivo":
        prompt = "Write a single, mysterious or urgent chat message. Context: industrial espionage, hiding digital tracks, whispering about a secret data package, or avoiding firewalls. Reply with ONLY that one sentence, no quotes, no intro."
    else:
        prompt = "Write a single, casual chat message between two best friends. Topics: organizing a soccer match, grabbing a beer tonight, weekend concert plans, or inside jokes. Reply with ONLY that one sentence, no quotes, no intro."

    try:
        response = ollama.generate(model="llama3.2:1b", prompt=prompt)
        return response['response'].strip().replace('"', '').replace('\'', '').replace('\n', ' ')
    except Exception:
        return f"Hey, did you check the latest update regarding {odnos_tip}?"

# --- 2. AI GENERATOR ZA SOCIAL POSTOVE (NOVO & POBOLJŠANO) ---
def generisi_ai_post(odnos_tip, post_type):
    if odnos_tip == "posao":
        prompt = f"Write a professional corporate update or tech-blog style post for LinkedIn/Slack. Type of post is {post_type}. Topics: successfully migrating architecture, releasing an encrypted API module, workflow updates, or tech event highlights. Keep it under 2 sentences. Reply with ONLY the post content, no quotes."
    elif odnos_tip == "sumnjivo":
        prompt = f"Write a cryptic, alarming, or confidential system log status post. Type of post is {post_type}. Context: warning about network anomalies, deep web breaches, unexpected root access at 3 AM, or classified project updates. Keep it dark and technical. Max 2 sentences. Reply with ONLY the post content, no quotes."
    else:
        prompt = f"Write a fun, engaging social media post for Instagram/Facebook. Type of post is {post_type}. Topics: weekend getaway, concert review, gym motivation, code-and-coffee vibes, or football match summary. Use a couple of emojis. Keep it under 2 sentences. Reply with ONLY the post content, no quotes."

    try:
        response = ollama.generate(model="llama3.2:1b", prompt=prompt)
        return response['response'].strip().replace('"', '').replace('\'', '').replace('\n', ' ')
    except Exception:
        return f"Just published a new update about my recent {odnos_tip} activities!"

# Funkcija za generisanje datuma od januara 2020. do jula 2027.
def generisi_datum():
    start_date = datetime(2020, 1, 1)
    end_date = datetime(2027, 7, 31)
    time_between_dates = end_date - start_date
    random_date = start_date + timedelta(days=random.randrange(time_between_dates.days))
    return random_date.strftime("%m/%d/%Y")

new_messages = []
new_posts = []

print("🤖 Starting Advanced Dual-AI Generation via Llama 3.2:1b (100% English)...")
print("Messages and Posts are now uniquely generated based on their format. Tracking progress:")

# Prolazimo kroz sve prijatelje
for index, friend in enumerate(friends):
    friend_id = friend['id']
    username = friend['username']
    
    # Određujemo tip odnosa na osnovu indeksa korisnika
    if index % 3 == 0:
        odnos_tip = "posao"
    elif index % 4 == 0:
        odnos_tip = "sumnjivo"
    else:
        odnos_tip = "prijatelji"
        
    print(f"-> Generating distinct Messages & Posts for: {username} [{odnos_tip.upper()}]")
    
    # --- GENERISANJE CHAT PORUKA ---
    friend_messages = []
    broj_poruka = random.randint(15, 25)
    for _ in range(broj_poruka):
        timestamp = generisi_datum()
        received = random.choice(["true", "false"])
        content = generisi_ai_message(odnos_tip)
            
        friend_messages.append({
            "content": content,
            "timestamp": timestamp,
            "received": received
        })
        
    friend_messages.sort(key=lambda x: datetime.strptime(x['timestamp'], "%m/%d/%Y"))
    new_messages.append({
        "friend_id": friend_id,
        "messages": friend_messages
    })
    
    # --- GENERISANJE UNIKATNIH POSTOVA ---
    broj_postova = random.randint(3, 6)
    for p_idx in range(broj_postova):
        timestamp = generisi_datum()
        
        # Određujemo tip posta
        if odnos_tip == "posao":
            p_type = "Document"
        elif odnos_tip == "sumnjivo":
            p_type = "Status"
        else:
            p_type = random.choice(["Image", "Video"])
            
        # Pozivamo novi, posebni generator za postove!
        content = generisi_ai_post(odnos_tip, p_type)
            
        broj_lajkova = random.randint(3, 10)
        random_likes = random.sample(friend_ids, min(broj_lajkova, len(friend_ids)))
        
        new_posts.append({
            "id": f"post-{friend_id}-{p_idx}",
            "author_id": friend_id,
            "type": p_type,
            "content": content,
            "timestamp": timestamp,
            "to": None,
            "interactions": {
                "likes": random_likes,
                "comments": []
            }
        })

# Sortiranje postova hronološki
new_posts.sort(key=lambda x: datetime.strptime(x['timestamp'], "%m/%d/%Y"))

# Sklapanje finalne baze podataka
napredna_baza = {
    "id": data["id"],
    "friends": friends,
    "messages": new_messages,
    "posts": new_posts
}

# Upisivanje u fajl
with open('../client/src/assets/user.json', 'w', encoding='utf-8') as f:
    json.dump(napredna_baza, f, indent=2, ensure_ascii=False)

print("\n🚀 DEEP FORENSIC DATASET GENERATED:")
print("✅ Poruke zvuče kao brzi chat razgovori.")
print("✅ Postovi izgledaju kao prave objave, blogovi ili sistemski logovi.")
print("✅ Sve je usklađeno na engleskom jeziku za maksimalnu pamet tvog radara!")