import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VoiceCommandResponse {
  success: boolean;
  function?: string;
  parameters?: any;
  message?: string;
  error_type?: 'not_available' | 'not_recognized' | 'api_error';
}

@Injectable({
  providedIn: 'root'
})
export class VoiceInterpreterService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Reconocimiento de voz iniciado');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Transcripción obtenida:', transcript);
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Error en reconocimiento de voz:', event.error);
        if (event.error === 'no-speech') {
          reject('No se detectó voz. Intenta hablar más alto o claro.');
        } else if (event.error === 'audio-capture') {
          reject('No se pudo capturar audio. Verifica los permisos del micrófono.');
        } else if (event.error === 'not-allowed') {
          reject('Permiso de micrófono denegado.');
        } else {
          reject(`Error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log('Reconocimiento de voz finalizado');
      };

      try {
        recognition.start();
      } catch (error) {
        console.error('Error al iniciar reconocimiento:', error);
        reject('Error al iniciar el reconocimiento de voz');
      }
    });
  }

  sendTranscriptionToInterpreter(transcription: string): Observable<VoiceCommandResponse> {
    return this.http.post<VoiceCommandResponse>(`${this.apiUrl}/exec_function`, {
      transcription
    });
  }
}
