import { TestBed } from '@angular/core/testing';

import { VoiceInterpreterService } from './voice-interpreter.service';

describe('VoiceInterpreterService', () => {
  let service: VoiceInterpreterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoiceInterpreterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
