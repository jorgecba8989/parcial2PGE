import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HighContrastService {
  private isHighContrastEnabled: boolean = false;
  private readonly HIGH_CONTRAST_CLASS = 'high-contrast-mode';
  private readonly STORAGE_KEY = 'highContrastEnabled';

  constructor() {
    this.loadPreference();
    this.applyTheme();
  }

  private loadPreference(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    this.isHighContrastEnabled = saved === 'true';
  }

  private savePreference(): void {
    localStorage.setItem(this.STORAGE_KEY, this.isHighContrastEnabled.toString());
  }

  private applyTheme(): void {
    const body = document.body;
    if (this.isHighContrastEnabled) {
      body.classList.add(this.HIGH_CONTRAST_CLASS);
    } else {
      body.classList.remove(this.HIGH_CONTRAST_CLASS);
    }
  }

  toggleHighContrast(): boolean {
    this.isHighContrastEnabled = !this.isHighContrastEnabled;
    this.savePreference();
    this.applyTheme();
    return this.isHighContrastEnabled;
  }

  isHighContrastActive(): boolean {
    return this.isHighContrastEnabled;
  }

  enableHighContrast(): void {
    if (!this.isHighContrastEnabled) {
      this.toggleHighContrast();
    }
  }

  disableHighContrast(): void {
    if (this.isHighContrastEnabled) {
      this.toggleHighContrast();
    }
  }
}
