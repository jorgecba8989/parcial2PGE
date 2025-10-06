import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AudioAccessibilityService } from '../../services/audio-accessibility.service';
import { TestLoggerService } from '../../services/test-logger.service';


@Component({
  selector: 'app-application-dialog',
  templateUrl: './application-dialog.component.html',
  styleUrls: ['./application-dialog.component.scss']
})
export class ApplicationDialogComponent implements OnInit, OnDestroy {
  applicationForm: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string = '';
  fileError: string = '';
  isLoading: boolean = false;
  generalError: string = '';

  constructor(
    private fb: FormBuilder,
    private audioService: AudioAccessibilityService,
    private testLogger: TestLoggerService,
    public dialogRef: MatDialogRef<ApplicationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: any
  ) {
    this.applicationForm = this.fb.group({
      toEmail: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Anunciar que se abrió el diálogo de aplicación
    this.audioService.speak('Formulario de aplicación abierto');
  }

  ngOnDestroy(): void {
    // Limpieza de recursos (RAII pattern)
    this.selectedFile = null;
    console.log('Recursos liberados correctamente en application-dialog');
  }

  onFileSelected(event: Event): void {
    try {
      // Limpiar errores previos
      this.fileError = '';
      this.generalError = '';

      const input = event.target as HTMLInputElement;

      if (!input || !input.files || !input.files[0]) {
        throw new Error('No se pudo acceder al archivo seleccionado');
      }

      const file = input.files[0];

      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

      if (!allowedTypes.includes(file.type)) {
        this.fileError = 'Solo se permiten archivos PDF, DOC o DOCX';
        this.selectedFile = null;
        this.selectedFileName = '';
        this.audioService.announceFormError('archivo', 'type');
        console.warn('Tipo de archivo no permitido:', file.type);
        this.testLogger.error('Tipo de archivo no permitido', { fileType: file.type });
        return;
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.fileError = 'El archivo no debe superar los 5MB';
        this.selectedFile = null;
        this.selectedFileName = '';
        this.audioService.announceFormError('archivo', 'size');
        console.warn('Archivo excede el tamaño máximo:', file.size);
        this.testLogger.error('Archivo excede el tamaño máximo', { size: file.size, maxSize });
        return;
      }

      // Archivo válido
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.fileError = '';
      this.audioService.speak(`Archivo ${file.name} seleccionado correctamente`);
      console.log('Archivo seleccionado correctamente:', file.name);
      this.testLogger.success('Archivo seleccionado correctamente', { fileName: file.name, size: file.size });

    } catch (error) {
      this.fileError = 'Error al procesar el archivo. Por favor intente nuevamente.';
      this.selectedFile = null;
      this.selectedFileName = '';
      console.error('Error en onFileSelected:', error);
      this.audioService.speak('Error al seleccionar archivo');
    }
  }

  onSubmit(): void {
    try {
      // Limpiar errores previos
      this.generalError = '';

      if (!this.applicationForm.valid) {
        this.checkFormErrors();
        return;
      }

      const toEmail = this.applicationForm.value.toEmail;
      const message = this.applicationForm.value.message;

      // Validaciones adicionales
      if (!toEmail || !message) {
        this.testLogger.error('Datos del formulario incompletos');
        throw new Error('Datos del formulario incompletos');
      }

      // Activar estado de loading
      this.isLoading = true;
      this.testLogger.info('Formulario válido', { email: toEmail, hasAttachment: !!this.selectedFile });
      this.audioService.speak('Procesando aplicación...');
      this.audioService.playConfirmationSound();

      console.log('Enviando aplicación a:', toEmail);

      this.audioService.speak('Aplicación preparada exitosamente');
      this.audioService.playSuccessSound();
      console.log('Aplicación enviada exitosamente');
      this.testLogger.success('Aplicación preparada exitosamente');
      this.dialogRef.close({ toEmail, message, attachmentFile: this.selectedFile });

    } catch (error) {
      this.generalError = 'Error al enviar la aplicación. Por favor intente nuevamente.';
      this.isLoading = false;
      console.error('Error en onSubmit:', error);
      this.audioService.speak('Error al enviar aplicación');
    }
  }

  onCancel(): void {
    this.audioService.speak('Aplicación cancelada');
    console.log('Usuario canceló la aplicación');
    this.dialogRef.close();
  }

  private checkFormErrors(): void {
    try {
      const controls = this.applicationForm.controls;

      Object.keys(controls).forEach(key => {
        const control = controls[key];
        if (control.invalid && control.errors) {
          const errors = Object.keys(control.errors);
          if (errors.length > 0) {
            const fieldName = key === 'toEmail' ? 'email destinatario' : 'mensaje';
            this.audioService.announceFormError(fieldName, errors[0]);
            console.warn(`Error en campo ${fieldName}:`, errors[0]);
          }
        }
      });

      // El archivo ahora es opcional, no verificamos si es requerido
    } catch (error) {
      console.error('Error al verificar errores del formulario:', error);
      this.generalError = 'Error al validar el formulario';
    }
  }
}