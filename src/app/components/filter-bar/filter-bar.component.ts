import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Period, PeriodOptions } from "../../shared/enums/period";
import { Visualization, VisualizationOptions } from "../../shared/enums/visualization";

@Component({
    selector: 'filter-bar',
    templateUrl: './filter-bar.component.html',
    styleUrls: ['./filter-bar.component.scss']
})
export class FilterBarComponent {
    @Input() selectedPeriod = Period.Month;    
    @Input() selectedVisualization = Visualization.Messages;
    @Input() selectedYear: number = 2024;
    @Input() selectedMonth: number = 1;

    @Output() visualizationOptionChangedEmitter = new EventEmitter<Visualization>();
    @Output() periodOptionChangedEmitter = new EventEmitter<Period>();
    @Output() yearChangedEmitter = new EventEmitter<number>();
    @Output() monthChangedEmitter = new EventEmitter<number>();

    // Novi emiteri za demografiju
    @Output() genderChangedEmitter = new EventEmitter<string>();
    @Output() occupationChangedEmitter = new EventEmitter<string>();
    @Output() locationChangedEmitter = new EventEmitter<string>();

    periods = Period;
    visualizationOptions = VisualizationOptions;
    periodOptions = PeriodOptions;

    visualizationChanged(visualization: Visualization): void {
        this.visualizationOptionChangedEmitter.emit(visualization);
    }

    periodChanged(period: Period): void {
        this.periodOptionChangedEmitter.emit(period);
    }

    yearChanged(event: any): void {
        const year = +(event.target.value);
        this.yearChangedEmitter.emit(year);
    }

    monthChanged(event: any): void {
        const month = +(event.target.value);
        this.monthChangedEmitter.emit(month);
    }

    genderChanged(value: string): void {
        this.genderChangedEmitter.emit(value);
    }

    occupationChanged(event: any): void {
        this.occupationChangedEmitter.emit(event.target.value);
    }

    locationChanged(event: any): void {
        this.locationChangedEmitter.emit(event.target.value);
    }
}