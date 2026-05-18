import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-security-analytics-console',
  templateUrl: './security-analytics-console.component.html',
  styleUrls: ['./security-analytics-console.component.scss']
})
export class SecurityAnalyticsConsoleComponent {
  @Input() pctMale: number = 0;
  @Input() pctFemale: number = 0;
  @Input() pctAge20_25: number = 0;
  @Input() pctAge26_35: number = 0;
  @Input() pctAge36_45: number = 0;
  @Input() pctAge46: number = 0;
  @Input() topOccupationName: string = 'N/A';
  @Input() topOccupationPct: number = 0;
  @Input() geoTracks: { city: string, pct: number }[] = [];
  @Input() rightLlamaProfile: string = '';
  @Input() isRightAiLoading: boolean = false;
  @Input() rawInterceptLog: string = '';
  @Input() chartOptions: any;

  @Output() openTableModalEmitter = new EventEmitter<void>();
  @Output() activeChartTabChangedEmitter = new EventEmitter<string>();

  activeTab: 'metrics' | 'geo' | 'cognition' | 'raw' = 'metrics';
  activeChartTab: 'demographics' | 'geo' | 'channels' | 'velocity' = 'demographics';
  isChartMaximized: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  setTab(tab: 'metrics' | 'geo' | 'cognition' | 'raw'): void {
    this.activeTab = tab;
  }

  toggleChartSize(event: MouseEvent): void {
    event.stopPropagation(); 
    this.isChartMaximized = !this.isChartMaximized;
    this.cdr.detectChanges();
  }

  setChartTab(tab: 'demographics' | 'geo' | 'channels' | 'velocity', event: MouseEvent): void {
    event.stopPropagation();
    this.activeChartTab = tab;
    this.activeChartTabChangedChanged(tab);
  }

  activeChartTabChangedChanged(tab: string): void {
    this.activeChartTabChangedEmitter.emit(tab);
    this.cdr.detectChanges();
  }

  triggerTableModal(): void {
    this.openTableModalEmitter.emit();
  }
}