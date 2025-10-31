import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoiceCommandService {
  private voiceCommandEnabled = new BehaviorSubject<boolean>(false);
  public voiceCommandEnabled$ = this.voiceCommandEnabled.asObservable();
  private microphonePermissionGranted = false;

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

  async requestMicrophonePermission(): Promise<boolean> {
    // Si ya se otorgó el permiso, no volver a solicitarlo
    if (this.microphonePermissionGranted) {
      return true;
    }

    try {
      // Solicitar permisos de micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Detener el stream inmediatamente, solo necesitamos el permiso
      stream.getTracks().forEach(track => track.stop());

      this.microphonePermissionGranted = true;
      console.log('Permiso de micrófono otorgado');
      return true;
    } catch (error) {
      console.error('Error al solicitar permiso de micrófono:', error);
      this.microphonePermissionGranted = false;
      return false;
    }
  }

  hasMicrophonePermission(): boolean {
    return this.microphonePermissionGranted;
  }
}
