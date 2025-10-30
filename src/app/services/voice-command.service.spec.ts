import { TestBed } from '@angular/core/testing';

import { VoiceCommandService } from './voice-command.service';

describe('VoiceCommandService', () => {
  let service: VoiceCommandService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoiceCommandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
