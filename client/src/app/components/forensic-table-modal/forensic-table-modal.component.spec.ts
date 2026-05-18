import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForensicTableModalComponent } from './forensic-table-modal.component';

describe('ForensicTableModalComponent', () => {
  let component: ForensicTableModalComponent;
  let fixture: ComponentFixture<ForensicTableModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ForensicTableModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ForensicTableModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
