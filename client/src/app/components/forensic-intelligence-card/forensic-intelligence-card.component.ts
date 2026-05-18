import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-forensic-intelligence-card',
  templateUrl: './forensic-intelligence-card.component.html',
  styleUrls: ['./forensic-intelligence-card.component.scss']
})
export class ForensicIntelligenceCardComponent {
  @Input() topic: string = 'N/A';
  @Input() sentiment: string = 'Neutral';
  @Input() summary: string = 'Waiting for data extraction...';
  @Input() isLoading: boolean = false;
}