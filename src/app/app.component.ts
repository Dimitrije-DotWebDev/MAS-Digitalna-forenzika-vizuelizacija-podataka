import { Component, OnInit } from '@angular/core';
import * as user from '../assets/user.json';
import { UserInformation } from './shared/models/user-information';
import { Visualization } from './shared/enums/visualization';
import { Period } from './shared/enums/period';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  userInformation!: UserInformation;
  filteredUserInformation!: UserInformation;
  
  selectedYear: number = 2024;
  selectedMonth: number = 1;
  selectedVisualization = Visualization.Messages;
  selectedPeriod = Period.Month;

  selectedGender: string = '';
  selectedOccupation: string = '';
  selectedLocation: string = '';

  ngOnInit(): void {
    this.userInformation = user as unknown as UserInformation;
    this.applyFilters(); // Inicijalno postavljanje podataka
  }

  
  yearChanged(value: number): void { this.selectedYear = value; this.applyFilters(); }
  monthChanged(value: number): void { this.selectedMonth = value; this.applyFilters(); }
  visualizationChanged(value: Visualization): void { this.selectedVisualization = value; this.applyFilters(); }
  periodChanged(value: Period): void { this.selectedPeriod = value; this.applyFilters(); }
  
  genderChanged(value: string): void { this.selectedGender = value; this.applyFilters(); }
  occupationChanged(value: string): void { this.selectedOccupation = value; this.applyFilters(); }
  locationChanged(value: string): void { this.selectedLocation = value; this.applyFilters(); }

  applyFilters(): void {
    
    const filteredFriends = this.userInformation.friends.filter(friend => {
    const matchesGender = !this.selectedGender || friend.gender === this.selectedGender;
      
    const matchesOccupation = !this.selectedOccupation || 
      friend.occupation.toLowerCase().includes(this.selectedOccupation.toLowerCase());
      
    const matchesLocation = !this.selectedLocation || 
      friend.location.country.toLowerCase().includes(this.selectedLocation.toLowerCase()) ||
      friend.location.city.toLowerCase().includes(this.selectedLocation.toLowerCase());

      return matchesGender && matchesOccupation && matchesLocation;
    });

    
    this.filteredUserInformation = {
      ...this.userInformation,
      friends: filteredFriends
    };
  }
}