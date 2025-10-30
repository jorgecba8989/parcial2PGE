import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoiceCommandService {
  private voiceCommandEnabled = new BehaviorSubject<boolean>(false);
  public voiceCommandEnabled$ = this.voiceCommandEnabled.asObservable();

  constructor() { }

  isVoiceCommandEnabled(): boolean {
    return this.voiceCommandEnabled.value;
  }

  enableVoiceCommand(): void {
    this.voiceCommandEnabled.next(true);
  }

  disableVoiceCommand(): void {
    this.voiceCommandEnabled.next(false);
  }

  toggleVoiceCommand(): boolean {
    const newState = !this.voiceCommandEnabled.value;
    this.voiceCommandEnabled.next(newState);
    return newState;
  }
}
