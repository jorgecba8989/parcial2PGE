import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { AudioAccessibilityService } from '../../services/audio-accessibility.service';
import { VoiceCommandService } from '../../services/voice-command.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-voice-toggle',
  templateUrl: './voice-toggle.component.html',
  styleUrls: ['./voice-toggle.component.scss']
})
export class VoiceToggleComponent implements OnInit, OnDestroy {

  constructor(
    private audioService: AudioAccessibilityService,
    private voiceCommandService: VoiceCommandService,
    private translationService: TranslationService
  ) { }

  ngOnInit(): void {
    window.addEventListener('toggleVoice', this.handleVoiceCommand);
  }

  ngOnDestroy(): void {
    window.removeEventListener('toggleVoice', this.handleVoiceCommand);
  }

  handleVoiceCommand = (event: any) => {
    const { enable } = event.detail;
    if (enable !== this.isVoiceEnabled) {
      this.toggleVoice();
    }
  }

  get isVoiceEnabled(): boolean {
    return this.audioService.isVoiceActive();
  }

  get isVoiceCommandEnabled(): boolean {
    return this.voiceCommandService.isVoiceCommandEnabled();
  }

  toggleVoice(): void {
    const newState = this.audioService.toggleVoice();
    const messageKey = newState ? 'voiceEnabled' : 'voiceDisabled';
    const message = this.translationService.translate(messageKey);

    if (newState) {
      this.audioService.speak(message);
    }
  }

  toggleVoiceCommand(): void {
    const newState = this.voiceCommandService.toggleVoiceCommand();
    const messageKey = newState ? 'voiceCommandsEnabled' : 'voiceCommandsDisabled';
    const message = this.translationService.translate(messageKey);

    if (this.audioService.isVoiceActive()) {
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
