import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvRegistrationComponent } from './csv-registration.component';

describe('CsvRegistrationComponent', () => {
  let component: CsvRegistrationComponent;
  let fixture: ComponentFixture<CsvRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsvRegistrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsvRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
