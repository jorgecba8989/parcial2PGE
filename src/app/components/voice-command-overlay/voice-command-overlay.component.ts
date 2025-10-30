import { Component, OnInit, OnDestroy, HostListener, NgZone } from '@angular/core';
import { VoiceCommandService } from '../../services/voice-command.service';
import { VoiceInterpreterService } from '../../services/voice-interpreter.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-voice-command-overlay',
  templateUrl: './voice-command-overlay.component.html',
  styleUrls: ['./voice-command-overlay.component.scss']
})
export class VoiceCommandOverlayComponent implements OnInit, OnDestroy {
  isVisible = false;
  isBlockingMode = false;
  clickCount = 0;
  clickTimeout: any;

  isPressing = false;
  pressStartTime = 0;
  pressStartY = 0;
  isRecording = false;

  recognition: any = null;

  private subscription: Subscription | null = null;

  constructor(
    private voiceCommandService: VoiceCommandService,
    private voiceInterpreterService: VoiceInterpreterService,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.subscription = this.voiceCommandService.voiceCommandEnabled$.subscribe(
      enabled => this.isVisible = enabled
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.cancelRecording();
  }

  onOverlayClick(): void {
    this.clickCount++;

    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }

    if (this.clickCount >= 5) {
      this.isBlockingMode = !this.isBlockingMode;
      this.clickCount = 0;
      return;
    }

    this.clickTimeout = setTimeout(() => {
      this.clickCount = 0;
    }, 250);
  }

  onMouseDown(event: MouseEvent): void {
    this.isPressing = true;
    this.pressStartTime = Date.now();
    this.pressStartY = event.clientY;

    setTimeout(() => {
      if (this.isPressing && !this.isRecording && this.pressStartTime + 1000 < Date.now()) {
        this.startRecording();
      }
    }, 1000);
  }

  onTouchStart(event: TouchEvent): void {
    this.isPressing = true;
    this.pressStartTime = Date.now();
    this.pressStartY = event.touches[0].clientY;

    setTimeout(() => {
      if (this.isPressing && !this.isRecording && this.pressStartTime + 1000 < Date.now()) {
        this.startRecording();
      }
    }, 1000);
  }

  onMouseUp(event: MouseEvent): void {
    this.handlePressEnd();
  }

  onTouchEnd(event: TouchEvent): void {
    this.handlePressEnd();
  }

  onMouseMove(event: MouseEvent): void {
    this.handleMove(event.clientY);
  }

  onTouchMove(event: TouchEvent): void {
    if (event.touches.length > 0) {
      this.handleMove(event.touches[0].clientY);
    }
  }

  private handleMove(clientY: number): void {
    if (this.isPressing && this.isRecording) {
      const deltaY = clientY - this.pressStartY;
      if (deltaY > 100) {
        this.cancelRecording();
      }
    }
  }

  private handlePressEnd(): void {
    if (!this.isPressing) return;

    const pressDuration = Date.now() - this.pressStartTime;

    if (pressDuration < 1000) {
      this.cancelRecording();
    } else if (this.isRecording) {
      this.stopAndProcessRecording();
    }

    this.isPressing = false;
  }

  private async startRecording(): Promise<void> {
    try {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.lang = 'es-ES';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        console.log('Reconocimiento de voz iniciado');
        setTimeout(() => {
          this.zone.run(() => {
            this.isRecording = true;
          });
        }, 100);
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Transcripción obtenida:', transcript);
        this.sendTranscription(transcript);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Error en reconocimiento de voz:', event.error);
        this.isRecording = false;
        setTimeout(() => {
          this.zone.run(() => {
            this.cancelRecording();
          });
        }, 100);
        if (event.error === 'no-speech') {
          console.warn('No se detectó voz. Intenta hablar más alto.');
        } else if (event.error === 'aborted') {
          console.log('Reconocimiento cancelado por el usuario');
        }
      };

      this.recognition.onend = () => {
        console.log('Reconocimiento de voz finalizado');
        this.isRecording = false;
      };

      this.recognition.start();
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      this.isRecording = false;
    }
  }

  private stopRecording(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error al detener reconocimiento:', error);
      }
    }
    this.isRecording = false;
  }

  private cancelRecording(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (error) {
        console.error('Error al cancelar reconocimiento:', error);
      }
      this.recognition = null;
    }
    this.isRecording = false;
    this.isPressing = false;
  }

  private stopAndProcessRecording(): void {
    this.stopRecording();
  }

  private sendTranscription(transcription: string): void {
    console.log('Enviando al intérprete:', transcription);
    this.voiceInterpreterService.sendTranscriptionToInterpreter(transcription).subscribe({
      next: (response) => {
        console.log('Respuesta del intérprete:', response);
        this.processCommandResponse(response);
      },
      error: (error) => {
        console.error('Error al enviar transcripción:', error);
      }
    });
  }

  private processCommandResponse(response: any): void {
    if (!response.success) {
      console.log('Comando no reconocido:', response.message);
      return;
    }

    console.log('Ejecutando función:', response.function, 'con parámetros:', response.parameters);

    window.dispatchEvent(new CustomEvent('voiceCommand', {
      detail: {
        function: response.function,
        parameters: response.parameters
      }
    }));
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp(): void {
    if (this.isPressing) {
      this.handlePressEnd();
    }
  }

  @HostListener('document:touchend')
  onDocumentTouchEnd(): void {
    if (this.isPressing) {
      this.handlePressEnd();
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    if (this.isPressing && this.isRecording) {
      this.handleMove(event.clientY);
    }
  }

  @HostListener('document:touchmove', ['$event'])
  onDocumentTouchMove(event: TouchEvent): void {
    if (this.isPressing && this.isRecording && event.touches.length > 0) {
      this.handleMove(event.touches[0].clientY);
    }
  }
}
