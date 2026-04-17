import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

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

@NgModule({
  declarations: [
    AppComponent,
    FilterBarComponent,
    GraphComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    MatRadioModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatSelectModule,
    RadarChartThreeComponent
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }