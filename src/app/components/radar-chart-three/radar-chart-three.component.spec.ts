import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadarChartThreeComponent } from './radar-chart-three.component';

describe('RadarChartThreeComponent', () => {
  let component: RadarChartThreeComponent;
  let fixture: ComponentFixture<RadarChartThreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RadarChartThreeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RadarChartThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
