import { Injectable } from '@angular/core';
import { TestLoggerService } from './test-logger.service';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root'
})
export class AudioAccessibilityService {
  private synth = window.speechSynthesis;
  private audioContext: AudioContext | null = null;
  private isVoiceEnabled: boolean = true;

  constructor(
    private testLogger: TestLoggerService,
    private translationService: TranslationService
  ) {
    this.initAudioContext();
    this.loadVoicePreference();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.testLogger.success('AudioContext inicializado correctamente');
    } catch (error) {
      console.warn('Web Audio API not supported', error);
      this.testLogger.warning('Web Audio API no soportado', error);
    }
  }

  // Sonidos de confirmación
  playConfirmationSound() {
    this.playTone(800, 0.1, 'sine');
  }

  playErrorSound() {
    this.playTone(300, 0.2, 'sawtooth');
  }

  playSuccessSound() {
    this.playSequence([
      { frequency: 523, duration: 0.1 },
      { frequency: 659, duration: 0.1 },
      { frequency: 784, duration: 0.2 }
    ]);
  }

  playSearchSound() {
    this.playTone(440, 0.1, 'triangle');
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);

    this.testLogger.info(`Reproduciendo tono: ${frequency}Hz, duración: ${duration}s, tipo: ${type}`);
  }

  private playSequence(notes: { frequency: number, duration: number }[]) {
    let currentTime = 0;
    notes.forEach(note => {
      setTimeout(() => {
        this.playTone(note.frequency, note.duration);
      }, currentTime * 1000);
      currentTime += note.duration + 0.05;
    });
  }

  private loadVoicePreference() {
    const saved = localStorage.getItem('voiceEnabled');
    this.isVoiceEnabled = saved !== null ? saved === 'true' : true;
    this.testLogger.info('Preferencia de voz cargada', { isVoiceEnabled: this.isVoiceEnabled });
  }

  private saveVoicePreference() {
    localStorage.setItem('voiceEnabled', this.isVoiceEnabled.toString());
  }

  toggleVoice(): boolean {
    this.isVoiceEnabled = !this.isVoiceEnabled;
    this.saveVoicePreference();
    if (!this.isVoiceEnabled) {
      this.stopSpeaking();
    }
    return this.isVoiceEnabled;
  }

  isVoiceActive(): boolean {
    return this.isVoiceEnabled;
  }

  // Anuncios de voz
  speak(text: string, options?: { rate?: number, pitch?: number, volume?: number }) {
    if (!this.synth || !this.isVoiceEnabled) return;

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = options?.rate || 1;
    utterance.pitch = options?.pitch || 1;
    utterance.volume = options?.volume || 0.8;

    const currentLang = this.translationService.getCurrentLang();
    utterance.lang = currentLang === 'es' ? 'es-ES' : 'en-US';

    this.synth.speak(utterance);
    this.testLogger.info(`SpeechSynthesis: "${text}"`, {
      lang: utterance.lang,
      rate: utterance.rate,
      pitch: utterance.pitch
    });
  }

  announceSearchResults(count: number) {
    let message: string;
    if (count === 0) {
      message = this.translationService.translate('noOpportunities');
      this.speak(message);
      this.playErrorSound();
      this.testLogger.warning('Búsqueda sin resultados', { count });
    } else if (count === 1) {
      message = this.translationService.translate('oneOpportunity');
      this.speak(message);
      this.playSuccessSound();
      this.testLogger.success('Búsqueda completada', { count });
    } else {
      message = this.translationService.translate('multipleOpportunities').replace('{{count}}', count.toString());
      this.speak(message);
      this.playSuccessSound();
      this.testLogger.success('Búsqueda completada', { count });
    }
  }

  announceFormError(fieldName: string, errorType: string) {
    let errorMessage: string;

    switch (errorType) {
      case 'required':
        errorMessage = this.translationService.translate('errorRequired');
        break;
      case 'minlength':
        errorMessage = this.translationService.translate('errorMinlength');
        break;
      case 'maxlength':
        errorMessage = this.translationService.translate('errorMaxlength');
        break;
      case 'email':
        errorMessage = this.translationService.translate('errorEmail');
        break;
      default:
        errorMessage = this.translationService.translate('errorInvalid');
    }

    const message = this.translationService.translate('formError').replace('{{field}}', fieldName) + errorMessage;

    this.speak(message);
    this.playErrorSound();
    this.testLogger.error(`Error en formulario: ${fieldName}`, { errorType });
  }

  announceAction(action: string) {
    const actionKeys: Record<string, string> = {
      'apply': 'actionApply',
      'search': 'actionSearch',
      'clear': 'actionClear',
      'already_applied': 'actionAlreadyApplied'
    };

    const translationKey = actionKeys[action];
    const message = translationKey ? this.translationService.translate(translationKey) : action;
    this.speak(message);
    this.playConfirmationSound();
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}