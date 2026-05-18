import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FilterBarComponent } from './components/filter-bar/filter-bar.component';
import { GraphComponent } from './components/graph/graph.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { RadarChartThreeComponent } from './components/radar-chart-three/radar-chart-three.component';


// --- 1. UVOZ APEXCHARTS MODULA ---
import { NgApexchartsModule } from 'ng-apexcharts';
import { ForensicTableModalComponent } from './components/forensic-table-modal/forensic-table-modal.component';
import { ForensicIntelligenceCardComponent } from './components/forensic-intelligence-card/forensic-intelligence-card.component';
import { SecurityAnalyticsConsoleComponent } from './components/security-analytics-console/security-analytics-console.component';

@NgModule({
  declarations: [
    AppComponent,
    FilterBarComponent,
    GraphComponent,
    ForensicTableModalComponent,
    ForensicIntelligenceCardComponent,
    SecurityAnalyticsConsoleComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    AppRoutingModule,
    MatRadioModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatSelectModule,
    RadarChartThreeComponent,
    
    // --- 2. DODAVANJE U IMPORTS NIZ ---
    NgApexchartsModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }