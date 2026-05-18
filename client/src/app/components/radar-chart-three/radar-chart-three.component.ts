import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import Experience from '../../three-core/Experience/Experience';
import { Period } from '../../shared/enums/period';
import { Visualization } from '../../shared/enums/visualization';

@Component({
  selector: 'app-radar-chart-three',
  standalone: true,
  imports: [], 
  templateUrl: './radar-chart-three.component.html',
  styleUrl: './radar-chart-three.component.scss'     
})
export class RadarChartThreeComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('canvas') canvasRef!: ElementRef;
  @ViewChild('tooltip') tooltipRef!: ElementRef; 

  @Input() data: any;
  @Input() selectedYear: number = 2024;
  @Input() selectedMonth: number = 1;
  @Input() selectedPeriod: Period = Period.Month;
  @Input() selectedVisualization: Visualization = Visualization.Messages;

  experience: any;

  ngAfterViewInit() {
    this.experience = new Experience(this.canvasRef.nativeElement);
    if (this.experience.world?.radarSystem) {
      this.experience.world.radarSystem.setTooltipElement(this.tooltipRef.nativeElement);
    }
    if(this.data) {
      this.sendDataToExperience();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.experience) {
      this.sendDataToExperience();
    }
  }

  private sendDataToExperience() {
    const filters = {
      year: this.selectedYear,
      month: this.selectedMonth,
      period: Period[this.selectedPeriod],
      visualization: Visualization[this.selectedVisualization]
    };
    this.experience.updateData(this.data, filters);
  }

  ngOnDestroy() {
    if(this.experience) {
      this.experience.destroy();
    }
  }
}