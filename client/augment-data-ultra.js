const fs = require('fs');
const path = require('path');

// Dinamičko pronalaženje putanje
const filePath = path.join(__dirname, 'src/assets/user.json');

console.log('--- START GENERATOR ---');
console.log('Putanja fajla:', filePath);

const START_DATE = new Date('2024-01-01');
const END_DATE = new Date('2026-04-17');

const locations = [
    { city: 'Nis', country: 'Serbia' },
    { city: 'Belgrade', country: 'Serbia' },
    { city: 'Novi Sad', country: 'Serbia' },
    { city: 'Kragujevac', country: 'Serbia' },
    { city: 'Berlin', country: 'Germany' },
    { city: 'New York', country: 'USA' },
    { city: 'Prague', country: 'Czech Republic' },
    { city: 'Tokyo', country: 'Japan' },
    { city: 'Rome', country: 'Italy' },
    { city: 'Paris', country: 'France' },
    { city: 'London', country: 'UK' },
    { city: 'Vienna', country: 'Austria' },
    { city: 'Toronto', country: 'Canada' },
    { city: 'Sydney', country: 'Australia' }
];
const occupations = ['Software Engineer', 'Digital Artist', 'Cyber Forensic Expert', 'Data Scientist', 'Musician', 'Architect', 'Pilot', 'UX Designer'];
const names = ['Luka', 'Sofija', 'Stefan', 'Dunja', 'Aleksa', 'Anja', 'Nikola', 'Mila', 'Marko', 'Sara', 'Igor', 'Elena', 'Viktor', 'Petra', 'Uroš', 'Tea'];

function randomDate() {
    const date = new Date(START_DATE.getTime() + Math.random() * (END_DATE.getTime() - START_DATE.getTime()));
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Inicijalna baza podataka
const data = {
    id: "96a95e6d-1b4d-44a1-a924-9ee8ab08258e",
    friends: [],
    messages: [],
    posts: []
};

// 1. Generisanje 400 prijatelja
console.log('🛠 Generišem prijatelje...');
for (let i = 0; i < 400; i++) {
    const id = `user-${Math.random().toString(36).substr(2, 9)}`;
    data.friends.push({
        id: id,
        username: getRandom(names) + "_" + Math.floor(Math.random() * 999),
        gender: Math.random() > 0.45 ? (Math.random() > 0.1 ? 'Male' : 'Other') : 'Female',
        location: getRandom(locations),
        occupation: getRandom(occupations)
    });
}

const friendIds = data.friends.map(f => f.id);

// 2. Generisanje poruka (Messages)
console.log('🛠 Generišem poruke...');
data.messages = data.friends.map(f => {
    const msgs = [];
    const count = Math.floor(Math.random() * 60) + 10;
    for (let j = 0; j < count; j++) {
        msgs.push({
            content: "Encrypted data packet " + j,
            timestamp: randomDate(),
            received: Math.random() > 0.5 ? "true" : "false"
        });
    }
    return { friend_id: f.id, messages: msgs };
});

// 3. Generisanje postova (3000 komada)
console.log('🛠 Generišem postove...');
for (let i = 0; i < 3000; i++) {
    const authorId = getRandom(friendIds);
    // 40% šanse da je interakcija direktno sa tobom (to: null)
    const toId = Math.random() > 0.6 ? null : getRandom([null, getRandom(friendIds)]);
    
    data.posts.push({
        id: `post-${i}`,
        author_id: authorId,
        type: getRandom(['Photo', 'Video', 'Status']),
        content: "Analysis point #" + i,
        timestamp: randomDate(),
        to: toId,
        interactions: {
            likes: friendIds.filter(() => Math.random() > 0.97),
            comments: Array.from({ length: Math.floor(Math.random() * 3) }, () => ({
                user_id: getRandom(friendIds),
                text: "Point confirmed."
            }))
        }
    });
}

// 4. Upisivanje u fajl
try {
    // Provera da li folder postoji, ako ne, pravi ga
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('✅ USPEŠNO UPISANO!');
    console.log(`- Putanja: ${filePath}`);
    console.log(`- Ukupno karaktera: ${JSON.stringify(data).length}`);
} catch (err) {
    console.error('❌ GREŠKA PRI UPISU:', err);
}