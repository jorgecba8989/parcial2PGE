import { Component } from '@angular/core';
import { HighContrastService } from '../../services/high-contrast.service';
import { AudioAccessibilityService } from '../../services/audio-accessibility.service';

@Component({
  selector: 'app-high-contrast-toggle',
  templateUrl: './high-contrast-toggle.component.html',
  styleUrls: ['./high-contrast-toggle.component.scss']
})
export class HighContrastToggleComponent {

  constructor(
    private highContrastService: HighContrastService,
    private audioService: AudioAccessibilityService
  ) { }

  get isHighContrastEnabled(): boolean {
    return this.highContrastService.isHighContrastActive();
  }

  toggleHighContrast(): void {
    const newState = this.highContrastService.toggleHighContrast();
    const message = newState ? 'Alto contraste activado' : 'Alto contraste desactivado';
    this.audioService.speak(message);
  }
}
