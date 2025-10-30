import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AudioAccessibilityService } from '../services/audio-accessibility.service';
import { ApplicationDialogComponent } from '../components/application-dialog/application-dialog.component';
import { JobsService, Job } from '../services/jobs.service';
import { TestLoggerService } from '../services/test-logger.service';
import { TranslationService } from '../services/translation.service'

@Component({
  selector: 'app-job-search',
  templateUrl: './job-search.component.html',
  styleUrls: ['./job-search.component.scss']
})
export class JobSearchComponent implements OnInit {
  searchForm: FormGroup;
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  appliedJobs: Set<string> = new Set(); // IDs de trabajos aplicados
  currentUserEmail = 'usuario@example.com'; // Simular usuario (después será real)
  appliedJobsDetails: Map<string, string> = new Map(); // jobId -> email usado
  isLoading: boolean = false;
  
  jobTypes = ['Tiempo completo', 'Medio tiempo', 'Por horas', 'Freelance'];
  accessibilityOptions = [
    'Acceso para sillas de ruedas',
    'Intérprete de señas',
    'Tecnología asistiva',
    'Horarios flexibles',
    'Trabajo remoto',
    'Apoyo visual',
    'Apoyo auditivo'
  ];

  languages: any = [];
  currentLanguage: string = 'es';

  constructor(
    private fb: FormBuilder,
    private audioService: AudioAccessibilityService,
    private dialog: MatDialog,
    private jobsService: JobsService,
    private testLogger: TestLoggerService,
    public translateService: TranslationService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['', [Validators.minLength(3)]],
      location: ['', [Validators.minLength(3)]],
      jobType: [''],
      accessibility: [''],
      remoteOnly: [false],
      showAppliedOnly: [false]
    });

    this.languages = this.translateService.getLanguages();
  }

  ngOnInit(): void {
    this.loadJobsFromFirestore();
    this.loadUserApplications();
    this.setupVoiceCommandListener();
  }

  setupVoiceCommandListener(): void {
    window.addEventListener('voiceCommand', (event: any) => {
      const { function: funcName, parameters } = event.detail;
      this.executeVoiceCommand(funcName, parameters);
    });
  }

  executeVoiceCommand(funcName: string, parameters: any): void {
    console.log('Ejecutando comando de voz:', funcName, parameters);

    switch (funcName) {
      case 'change_lang':
        this.changeLangByVoice(parameters.lang);
        break;
      case 'toggle_high_contrast':
        this.toggleHighContrastByVoice(parameters.enable);
        break;
      case 'toggle_voice':
        this.toggleVoiceByVoice(parameters.enable);
        break;
      case 'search_jobs':
        this.searchJobsByVoice(parameters);
        break;
      default:
        console.log('Comando no reconocido:', funcName);
    }
  }

  changeLangByVoice(lang: string): void {
    this.currentLanguage = lang;
    const message = lang === 'es' ? 'Se cambia a idioma Español' : 'Se cambia a idioma Ingles';
    this.audioService.speak(message);
    this.translateService.chageLanguage(lang);
  }

  toggleHighContrastByVoice(enable: boolean): void {
    const event = new CustomEvent('toggleHighContrast', { detail: { enable } });
    window.dispatchEvent(event);
  }

  toggleVoiceByVoice(enable: boolean): void {
    if (enable) {
      this.audioService.speak('Voz activada');
    }
    const event = new CustomEvent('toggleVoice', { detail: { enable } });
    window.dispatchEvent(event);
  }

  searchJobsByVoice(params: any): void {
    if (params.searchTerm) {
      this.searchForm.patchValue({ searchTerm: params.searchTerm });
    }
    if (params.location) {
      this.searchForm.patchValue({ location: params.location });
    }
    if (params.jobType) {
      this.searchForm.patchValue({ jobType: params.jobType });
    }
    if (params.remoteOnly !== undefined) {
      this.searchForm.patchValue({ remoteOnly: params.remoteOnly });
    }
    this.onSearch();
  }

  loadJobsFromFirestore(): void {
    this.isLoading = true;
    const minLoadingTime = 4000; // 4 segundos mínimo para ver toda la animación
    const startTime = Date.now();

    this.jobsService.getJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.filteredJobs = jobs;
        console.log('Trabajos cargados desde Firestore:', jobs.length);
        this.testLogger.success('Trabajos cargados desde Firestore', { count: jobs.length });

        // Calcular tiempo transcurrido y esperar si es necesario
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

        setTimeout(() => {
          this.isLoading = false;
        }, remainingTime);
      },
      error: (error) => {
        console.error('Error cargando trabajos:', error);
        this.testLogger.error('Error cargando trabajos', error);
        // Fallback a datos de ejemplo si Firebase falla
        this.loadSampleJobsAsFallback();

        // Mantener tiempo mínimo también en caso de error
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

        setTimeout(() => {
          this.isLoading = false;
        }, remainingTime);
      }
    });
  }

  // Método de respaldo si Firebase no está configurado
  loadSampleJobsAsFallback(): void {
    console.log('Usando datos de ejemplo como respaldo');
    this.testLogger.warning('Usando datos de ejemplo como respaldo');
    this.jobs = [
      {
        title: 'Desarrollador Frontend',
        company: 'TechInclusiva S.A.',
        location: 'Buenos Aires, Argentina',
        type: 'Tiempo completo',
        description: 'Buscamos desarrollador frontend con experiencia en Angular. Empresa comprometida con la inclusión.',
        accessibility: ['Trabajo remoto', 'Horarios flexibles', 'Tecnología asistiva'],
        remote: true,
        salary: '$80.000 - $120.000'
      }
    ];
    this.filteredJobs = this.jobs;
    this.testLogger.info('Trabajos de fallback cargados', { count: this.jobs.length });
  }


  filterJobs(): void {
    const formValue = this.searchForm.value;

    this.filteredJobs = this.jobs.filter(job => {
      const matchesSearch = !formValue.searchTerm ||
        job.title.toLowerCase().includes(formValue.searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(formValue.searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(formValue.searchTerm.toLowerCase());

      const matchesLocation = !formValue.location ||
        job.location.toLowerCase().includes(formValue.location.toLowerCase());

      const matchesType = !formValue.jobType || job.type === formValue.jobType;

      const matchesAccessibility = !formValue.accessibility ||
        job.accessibility.includes(formValue.accessibility);

      const matchesRemote = !formValue.remoteOnly || job.remote;

      const matchesAppliedFilter = !formValue.showAppliedOnly || this.hasAppliedToJob(job.id!);

      return matchesSearch && matchesLocation && matchesType && matchesAccessibility && matchesRemote && matchesAppliedFilter;
    });

    // Anunciar resultados de búsqueda
    this.audioService.announceSearchResults(this.filteredJobs.length);
  }

  clearFilters(): void {
    this.audioService.announceAction('clear');
    this.searchForm.reset();
    this.filteredJobs = this.jobs;
  }

  onApply(job: Job): void {
    // Verificar si ya aplicó
    if (this.hasAppliedToJob(job.id!)) {
      this.audioService.announceAction('already_applied');
      return;
    }

    const dialogRef = this.dialog.open(ApplicationDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { job: job },
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Enviar aplicación a Firebase
        this.submitApplication(job, result);
      }
    });
  }

  // Enviar aplicación a Firebase
  submitApplication(job: Job, applicationData: any): void {
    this.jobsService.applyToJob(
      job.id!,
      applicationData.toEmail, // Email real del formulario
      `${job.title} - ${job.company}`, // Nombre del puesto y empresa
      applicationData.message, // Mensaje del formulario
      applicationData.attachmentFile // Archivo adjunto si existe
    ).subscribe({
      next: (applicationId) => {
        console.log('Aplicación enviada con ID:', applicationId);
        this.testLogger.success('Aplicación registrada', {
          applicationId,
          jobTitle: job.title,
          company: job.company,
          email: applicationData.toEmail
        });
        // Marcar como aplicado inmediatamente
        this.appliedJobs.add(job.id!);
        this.appliedJobsDetails.set(job.id!, applicationData.toEmail);
        this.audioService.announceAction('apply');
      },
      error: (error) => {
        console.error('Error enviando aplicación:', error);
        this.testLogger.error('Error enviando aplicación', error);
      }
    });
  }

  // Cargar aplicaciones del usuario
  loadUserApplications(): void {
    // Cargar TODAS las aplicaciones para mostrar cualquier email usado
    this.jobsService.getAllUserApplications().subscribe({
      next: (applications) => {
        this.appliedJobs.clear();
        this.appliedJobsDetails.clear();
        applications.forEach(app => {
          this.appliedJobs.add(app.jobId);
          this.appliedJobsDetails.set(app.jobId, app.userEmail);
          console.log('Aplicación encontrada:', {
            puesto: app.userName,
            email: app.userEmail,
            mensaje: app.message,
            archivo: app.attachmentName || 'Sin archivo'
          });
        });
        console.log(`Total aplicaciones cargadas: ${applications.length}`);
      },
      error: (error) => {
        console.error('Error cargando aplicaciones:', error);
      }
    });
  }

  // Verificar si ya aplicó a un trabajo
  hasAppliedToJob(jobId: string): boolean {
    return this.appliedJobs.has(jobId);
  }


  onSearch(): void {
    if (this.searchForm.valid) {
      this.audioService.announceAction('search');
      this.filterJobs();
    } else {
      this.checkFormErrors();
    }
  }

  checkFormErrors(): void {
    const controls = this.searchForm.controls;

    Object.keys(controls).forEach(key => {
      const control = controls[key];
      if (control.invalid && control.errors) {
        const errors = Object.keys(control.errors);
        if (errors.length > 0) {
          const fieldName = this.getFieldDisplayName(key);
          this.audioService.announceFormError(fieldName, errors[0]);
        }
      }
    });
  }

  private getFieldDisplayName(fieldKey: string): string {
    const fieldNames: { [key: string]: string } = {
      'searchTerm': 'búsqueda',
      'location': 'ubicación',
      'jobType': 'tipo de trabajo',
      'accessibility': 'accesibilidad'
    };
    return fieldNames[fieldKey] || fieldKey;
  }

    onInputChange(fieldName: string) {
    const searchControl = this.searchForm.get(fieldName);
    searchControl?.markAsTouched(); // Esto hace que se muestren los errores
    searchControl?.updateValueAndValidity();
  }

  toggleLanguage(): void {
    // Alternar entre español e inglés
    this.currentLanguage = this.currentLanguage === 'es' ? 'en' : 'es';
    const message = this.currentLanguage === 'es' ? 'Se cambia a idioma Español' : 'Se cambia a idioma Ingles';
    this.audioService.speak(message);
    this.translateService.chageLanguage(this.currentLanguage);
  }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
      if (event.altKey && event.code === 'KeyI') {
        event.preventDefault();
        this.toggleLanguage();
      }
    }
}