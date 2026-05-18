import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityAnalyticsConsoleComponent } from './security-analytics-console.component';

describe('SecurityAnalyticsConsoleComponent', () => {
  let component: SecurityAnalyticsConsoleComponent;
  let fixture: ComponentFixture<SecurityAnalyticsConsoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SecurityAnalyticsConsoleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SecurityAnalyticsConsoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
