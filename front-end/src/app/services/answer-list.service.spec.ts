import { TestBed } from '@angular/core/testing';

import { AnswerListService } from './answer-list.service';

describe('AnswerListService', () => {
  let service: AnswerListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnswerListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
