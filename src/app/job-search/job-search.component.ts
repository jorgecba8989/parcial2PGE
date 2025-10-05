import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AudioAccessibilityService } from '../services/audio-accessibility.service';
import { ApplicationDialogComponent } from '../components/application-dialog/application-dialog.component';
import { JobsService, Job } from '../services/jobs.service';
import { TestLoggerService } from '../services/test-logger.service';

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

  constructor(
    private fb: FormBuilder,
    private audioService: AudioAccessibilityService,
    private dialog: MatDialog,
    private jobsService: JobsService,
    private testLogger: TestLoggerService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['', [Validators.minLength(3)]],
      location: ['', [Validators.minLength(3)]],
      jobType: [''],
      accessibility: [''],
      remoteOnly: [false],
      showAppliedOnly: [false]
    });
  }

  ngOnInit(): void {
    this.loadJobsFromFirestore();
    this.loadUserApplications();
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
}