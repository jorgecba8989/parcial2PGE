import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AudioAccessibilityService } from '../../services/audio-accessibility.service';
import { EmailService } from '../../services/email.service';


@Component({
  selector: 'app-application-dialog',
  templateUrl: './application-dialog.component.html',
  styleUrls: ['./application-dialog.component.scss']
})
export class ApplicationDialogComponent implements OnInit {
  applicationForm: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string = '';
  fileError: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private audioService: AudioAccessibilityService,
    private emailService: EmailService,
    public dialogRef: MatDialogRef<ApplicationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: any
  ) {
    this.applicationForm = this.fb.group({
      toEmail: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Anunciar que se abrió el diálogo de envío de email
    this.audioService.speak('Formulario de envío de email abierto');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

      if (!allowedTypes.includes(file.type)) {
        this.fileError = 'Solo se permiten archivos PDF, DOC o DOCX';
        this.selectedFile = null;
        this.selectedFileName = '';
        this.audioService.announceFormError('archivo', 'type');
        return;
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.fileError = 'El archivo no debe superar los 5MB';
        this.selectedFile = null;
        this.selectedFileName = '';
        this.audioService.announceFormError('archivo', 'size');
        return;
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.fileError = '';
      this.audioService.speak(`Archivo ${file.name} seleccionado correctamente`);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.applicationForm.valid) {
      const toEmail = this.applicationForm.value.toEmail;
      const message = this.applicationForm.value.message;

      // Activar estado de loading
      this.isLoading = true;
      this.audioService.speak('Enviando email...');
      this.audioService.playConfirmationSound();

      try {
        // Llamar al servicio de email
        const success = await this.emailService.sendEmail(toEmail, message, this.selectedFile || undefined);

        if (success) {
          this.audioService.speak('Email enviado exitosamente');
          this.audioService.playSuccessSound();
          this.dialogRef.close({ toEmail, message, attachmentFile: this.selectedFile });
        } else {
          this.audioService.speak('Error al enviar el email. Por favor, inténtalo de nuevo.');
          this.isLoading = false;
        }
      } catch (error) {
        console.error('Error al enviar email:', error);
        this.audioService.speak('Error al enviar el email. Por favor, verifica tu conexión e inténtalo de nuevo.');
        this.isLoading = false;
      }

    } else {
      // Verificar errores y anunciarlos
      this.checkFormErrors();
    }
  }

  onCancel(): void {
    this.audioService.speak('Envío de email cancelado');
    this.dialogRef.close();
  }

  private checkFormErrors(): void {
    const controls = this.applicationForm.controls;

    Object.keys(controls).forEach(key => {
      const control = controls[key];
      if (control.invalid && control.errors) {
        const errors = Object.keys(control.errors);
        if (errors.length > 0) {
          const fieldName = key === 'toEmail' ? 'email destinatario' : 'mensaje';
          this.audioService.announceFormError(fieldName, errors[0]);
        }
      }
    });

    // El archivo ahora es opcional, no verificamos si es requerido
  }
}