import { Component, HostListener } from '@angular/core';
import { AudioAccessibilityService } from '../../services/audio-accessibility.service';

@Component({
  selector: 'app-voice-toggle',
  templateUrl: './voice-toggle.component.html',
  styleUrls: ['./voice-toggle.component.scss']
})
export class VoiceToggleComponent {

  constructor(private audioService: AudioAccessibilityService) { }

  get isVoiceEnabled(): boolean {
    return this.audioService.isVoiceActive();
  }

  toggleVoice(): void {
    const newState = this.audioService.toggleVoice();
    const message = newState ? 'Voz activada' : 'Voz desactivada';

    if (newState) {
      this.audioService.speak(message);
    }
  }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
      if (event.altKey && event.code === 'KeyS') {
        event.preventDefault();
        this.toggleVoice();
      }
    }
}
