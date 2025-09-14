import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AudioAccessibilityService } from '../services/audio-accessibility.service';
import { ApplicationDialogComponent } from '../components/application-dialog/application-dialog.component';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  accessibility: string[];
  remote: boolean;
  salary?: string;
}

@Component({
  selector: 'app-job-search',
  templateUrl: './job-search.component.html',
  styleUrls: ['./job-search.component.scss']
})
export class JobSearchComponent implements OnInit {
  searchForm: FormGroup;
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  
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
    private dialog: MatDialog
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['', [Validators.minLength(2)]],
      location: ['', [Validators.minLength(2)]],
      jobType: [''],
      accessibility: [''],
      remoteOnly: [false]
    });
  }

  ngOnInit(): void {
    this.loadSampleJobs();
    this.filteredJobs = this.jobs;
    
    this.searchForm.valueChanges.subscribe(() => {
      this.filterJobs();
    });
  }

  loadSampleJobs(): void {
    this.jobs = [
      {
        id: 1,
        title: 'Desarrollador Frontend',
        company: 'TechInclusiva S.A.',
        location: 'Buenos Aires, Argentina',
        type: 'Tiempo completo',
        description: 'Buscamos desarrollador frontend con experiencia en Angular. Empresa comprometida con la inclusión.',
        accessibility: ['Trabajo remoto', 'Horarios flexibles', 'Tecnología asistiva'],
        remote: true,
        salary: '$80.000 - $120.000'
      },
      {
        id: 2,
        title: 'Asistente Administrativo',
        company: 'Inclusión Total',
        location: 'Córdoba, Argentina',
        type: 'Medio tiempo',
        description: 'Posición administrativa en empresa líder en inclusión laboral.',
        accessibility: ['Acceso para sillas de ruedas', 'Horarios flexibles'],
        remote: false,
        salary: '$45.000 - $60.000'
      },
      {
        id: 3,
        title: 'Diseñador UX/UI',
        company: 'Diversidad Digital',
        location: 'Rosario, Argentina',
        type: 'Freelance',
        description: 'Diseñador con experiencia en accesibilidad web y diseño inclusivo.',
        accessibility: ['Trabajo remoto', 'Apoyo visual', 'Tecnología asistiva'],
        remote: true,
        salary: '$60.000 - $90.000'
      },
      {
        id: 4,
        title: 'Contador Público',
        company: 'Finanzas Accesibles',
        location: 'Mendoza, Argentina',
        type: 'Tiempo completo',
        description: 'Contador con experiencia en sistemas contables accesibles.',
        accessibility: ['Intérprete de señas', 'Apoyo auditivo', 'Horarios flexibles'],
        remote: false,
        salary: '$70.000 - $95.000'
      },
      {
        id: 5,
        title: 'Especialista en Marketing',
        company: 'Comunicación Inclusiva',
        location: 'La Plata, Argentina',
        type: 'Tiempo completo',
        description: 'Marketing especializado en campañas de diversidad e inclusión.',
        accessibility: ['Trabajo remoto', 'Horarios flexibles', 'Apoyo visual'],
        remote: true,
        salary: '$65.000 - $85.000'
      }
    ];
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

      return matchesSearch && matchesLocation && matchesType && matchesAccessibility && matchesRemote;
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
        // Aplicación enviada exitosamente
        console.log('Aplicación enviada:', result);
        // Aquí puedes manejar la lógica de envío real
      }
    });
  }

  onSave(job: Job): void {
    this.audioService.announceAction('save');
  }

  onShare(job: Job): void {
    this.audioService.announceAction('share');
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
}