const fs = require('fs');
const path = require('path');

// Putanja do tvog originalnog JSON-a
const filePath = path.join(__dirname, 'src/assets/user.json');
const rawData = fs.readFileSync(filePath);
let data = JSON.parse(rawData);

const friends = data.friends;
const friendIds = friends.map(f => f.id);

// Funkcija za generisanje datuma u 2024. i 2025.
function generateRandomDate() {
    const start = new Date(2024, 0, 1);
    const end = new Date(2025, 11, 31);
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

// 1. Dopuna poruka (Messages)
data.messages.forEach(friendMsg => {
    const extraMessagesCount = Math.floor(Math.random() * 30) + 20;
    for (let i = 0; i < extraMessagesCount; i++) {
        friendMsg.messages.push({
            content: "Generated forensic insight " + Math.floor(Math.random() * 100),
            timestamp: generateRandomDate(),
            received: Math.random() > 0.5 ? "true" : "false"
        });
    }
});

// 2. Generisanje novih postova sa interakcijama
const postTypes = ["Photo", "Video", "Status"];
const augmentedPosts = [];

for (let i = 0; i < 250; i++) {
    const author = friends[Math.floor(Math.random() * friends.length)];
    const target = Math.random() > 0.7 ? friendIds[Math.floor(Math.random() * friendIds.length)] : null;
    
    const post = {
        id: `post-${i}`,
        author_id: author.id,
        type: postTypes[Math.floor(Math.random() * postTypes.length)],
        content: "Expanded social data point for 3D analysis",
        timestamp: generateRandomDate(),
        to: target,
        interactions: {
            likes: friendIds.filter(() => Math.random() > 0.8), // Nasumični prijatelji lajkuju
            comments: Array.from({ length: Math.floor(Math.random() * 5) }, () => ({
                user_id: friendIds[Math.floor(Math.random() * friendIds.length)],
                text: "Inter-planet communication test"
            }))
        }
    };
    augmentedPosts.push(post);
}

data.posts = augmentedPosts;

// Snimanje nazad u fajl
fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
console.log("✅ Podaci uspešno dopunjeni i snimljeni u user.json!");