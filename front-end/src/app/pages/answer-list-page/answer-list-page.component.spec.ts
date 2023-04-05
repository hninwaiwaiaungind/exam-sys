import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerListPageComponent } from './answer-list-page.component';

describe('AnswerListPageComponent', () => {
  let component: AnswerListPageComponent;
  let fixture: ComponentFixture<AnswerListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnswerListPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnswerListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
