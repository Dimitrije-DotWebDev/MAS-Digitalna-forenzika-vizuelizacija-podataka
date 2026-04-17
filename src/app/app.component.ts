import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserInformation } from './shared/models/user-information';
import { Visualization } from './shared/enums/visualization';
import { Period } from './shared/enums/period';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // Koristimo "!" jer će se podaci učitati asinhrono u ngOnInit
  userInformation!: UserInformation;
  filteredUserInformation!: UserInformation;
  
  // Inicijalni filteri (podešeni na 2026. zbog skripte)
  selectedYear: number = 2026;
  selectedMonth: number = 4;
  selectedVisualization = Visualization.Messages;
  selectedPeriod = Period.Month;

  // Polja za tekstualnu pretragu
  selectedGender: string = '';
  selectedOccupation: string = '';
  selectedLocation: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Rešava build error: učitavamo podatke asinhrono iz assets foldera
    this.http.get<UserInformation>('assets/user.json').subscribe({
      next: (data) => {
        this.userInformation = data;
        this.applyFilters();
        console.log('🚀 Forensic Data Hub: Loaded successfully via HTTP');
      },
      error: (err) => {
        console.error('❌ Data Load Failed:', err);
      }
    });
  }

  // --- Event Handlers za filtere ---
  yearChanged(value: number): void { this.selectedYear = value; this.applyFilters(); }
  monthChanged(value: number): void { this.selectedMonth = value; this.applyFilters(); }
  visualizationChanged(value: Visualization): void { this.selectedVisualization = value; this.applyFilters(); }
  periodChanged(value: Period): void { this.selectedPeriod = value; this.applyFilters(); }
  
  genderChanged(value: string): void { this.selectedGender = value; this.applyFilters(); }
  occupationChanged(value: string): void { this.selectedOccupation = value; this.applyFilters(); }
  locationChanged(value: string): void { this.selectedLocation = value; this.applyFilters(); }

  /**
   * Glavna logika za procesuiranje podataka pre slanja u Three.js
   */
  applyFilters(): void {
    // Guard clause: ne radimo ništa dok HTTP poziv ne vrati podatke
    if (!this.userInformation) return;

    const searchTermLocation = this.selectedLocation.toLowerCase().trim();
    const searchTermOccupation = this.selectedOccupation.toLowerCase().trim();

    const filteredFriends = this.userInformation.friends.filter(friend => {
      // 1. Filter po polu (tačno poklapanje)
      const matchesGender = !this.selectedGender || friend.gender === this.selectedGender;
      
      // 2. Filter po zanimanju (proširena pretraga, neosetljiva na velika/mala slova)
      const matchesOccupation = !searchTermOccupation || 
        (friend.occupation && friend.occupation.toLowerCase().includes(searchTermOccupation));
      
      // 3. Filter po lokaciji (ujedinjena pretraga za gradove i države)
      const matchesLocation = !searchTermLocation || 
        (friend.location?.country?.toLowerCase().includes(searchTermLocation)) ||
        (friend.location?.city?.toLowerCase().includes(searchTermLocation));

      return matchesGender && matchesOccupation && matchesLocation;
    });

    // Kreiramo novi objekat za detekciju promena u Angularu (Immutable update)
    this.filteredUserInformation = {
      ...this.userInformation,
      friends: filteredFriends
    };
  }
}