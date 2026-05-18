import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
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

    // NOVI INPUTI za Autocomplete prosleđeni iz AppComponenta
    @Input() locationControl!: FormControl;
    @Input() occupationControl!: FormControl;
    @Input() filteredLocationOptions!: Observable<string[]>;
    @Input() filteredOccupationOptions!: Observable<string[]>;

    @Output() visualizationOptionChangedEmitter = new EventEmitter<Visualization>();
    @Output() periodOptionChangedEmitter = new EventEmitter<Period>();
    @Output() yearChangedEmitter = new EventEmitter<number>();
    @Output() monthChangedEmitter = new EventEmitter<number>();
    @Output() genderChangedEmitter = new EventEmitter<string>();

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
        this.yearChangedEmitter.emit(+(event.target.value));
    }

    monthChanged(event: any): void {
        this.monthChangedEmitter.emit(+(event.target.value));
    }

    genderChanged(value: string): void {
        this.genderChangedEmitter.emit(value);
    }
}