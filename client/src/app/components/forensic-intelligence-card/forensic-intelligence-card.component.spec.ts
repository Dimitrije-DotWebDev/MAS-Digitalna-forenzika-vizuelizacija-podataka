import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForensicIntelligenceCardComponent } from './forensic-intelligence-card.component';

describe('ForensicIntelligenceCardComponent', () => {
  let component: ForensicIntelligenceCardComponent;
  let fixture: ComponentFixture<ForensicIntelligenceCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ForensicIntelligenceCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ForensicIntelligenceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
