import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { HighContrastService } from '../../services/high-contrast.service';
import { AudioAccessibilityService } from '../../services/audio-accessibility.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-high-contrast-toggle',
  templateUrl: './high-contrast-toggle.component.html',
  styleUrls: ['./high-contrast-toggle.component.scss']
})
export class HighContrastToggleComponent implements OnInit, OnDestroy {

  constructor(
    private highContrastService: HighContrastService,
    private audioService: AudioAccessibilityService,
    private translationService: TranslationService
  ) { }

  ngOnInit(): void {
    window.addEventListener('toggleHighContrast', this.handleVoiceCommand);
  }

  ngOnDestroy(): void {
    window.removeEventListener('toggleHighContrast', this.handleVoiceCommand);
  }

  handleVoiceCommand = (event: any) => {
    const { enable } = event.detail;
    if (enable !== this.isHighContrastEnabled) {
      this.toggleHighContrast();
    }
  }

  get isHighContrastEnabled(): boolean {
    return this.highContrastService.isHighContrastActive();
  }

  toggleHighContrast(): void {
    const newState = this.highContrastService.toggleHighContrast();
    const messageKey = newState ? 'highContrastEnabled' : 'highContrastDisabled';
    const message = this.translationService.translate(messageKey);
    this.audioService.speak(message);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.altKey && event.code === 'KeyC') {
      event.preventDefault();
      this.toggleHighContrast();
    }
  }
}
