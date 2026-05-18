const fs = require('fs');
const path = require('path');

// Liste nasumičnih podataka (sve na engleskom jeziku)
const occupations = [
  'Software Engineer', 'Data Scientist', 'Marketing Manager', 'Financial Analyst', 
  'Graphic Designer', 'HR Specialist', 'Product Manager', 'Teacher', 
  'Doctor', 'Sales Representative', 'Architect', 'Lawyer'
];
const genders = ['Male', 'Female', 'Other'];
const locations = [
  { city: 'Berlin', country: 'Germany' },
  { city: 'London', country: 'UK' },
  { city: 'New York', country: 'USA' },
  { city: 'Toronto', country: 'Canada' },
  { city: 'Sydney', country: 'Australia' },
  { city: 'Tokyo', country: 'Japan' },
  { city: 'Paris', country: 'France' },
  { city: 'Belgrade', country: 'Serbia' },
  { city: 'Vienna', country: 'Austria' },
  { city: 'Stockholm', country: 'Sweden' }
];

// Pomoćne funkcije za nasumični odabir
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Putanja do tvog user.json fajla unutar src/assets foldera
const filePath = path.join(__dirname, 'src', 'assets', 'user.json');

// Čitanje fajla
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Greška pri čitanju fajla. Provjeri putanju!', err);
    return;
  }

  try {
    const userData = JSON.parse(data);

    // Prolazak kroz sve prijatelje i dodavanje novih atributa
    if (userData.friends && Array.isArray(userData.friends)) {
      userData.friends.forEach(friend => {
        friend.age = getRandomInt(18, 65); // Nasumične godine između 18 i 65
        friend.occupation = getRandomElement(occupations);
        friend.gender = getRandomElement(genders);
        friend.location = getRandomElement(locations);
      });

      // Zapisivanje novih podataka nazad u isti fajl
      fs.writeFile(filePath, JSON.stringify(userData, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
          console.error('Greška pri čuvanju novog fajla:', writeErr);
        } else {
          console.log('Uspješno! user.json je ažuriran sa novim demografskim podacima.');
        }
      });
    } else {
      console.error('Nije pronađen niz "friends" u tvom user.json fajlu.');
    }
  } catch (parseErr) {
    console.error('Greška pri parsiranju JSON formata:', parseErr);
  }
});