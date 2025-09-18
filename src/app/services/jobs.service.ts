import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, Firestore, query, where } from 'firebase/firestore';
import { Observable, from, map } from 'rxjs';
import { firebaseConfig } from '../../environments/firebase.config';

export interface Job {
  id?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  accessibility: string[];
  remote: boolean;
  salary?: string;
  createdAt?: any;
  isActive?: boolean;
}

export interface JobApplication {
  id?: string;
  jobId: string;
  userEmail: string;
  userName?: string;
  appliedAt: any;
  status: 'enviada' | 'vista' | 'en_proceso' | 'rechazada' | 'aceptada';
}

@Injectable({
  providedIn: 'root'
})
export class JobsService {
  private db: Firestore;

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
  }

  // Obtener todos los trabajos desde Firestore
  getJobs(): Observable<Job[]> {
    const jobsCollection = collection(this.db, 'jobs');

    return from(getDocs(jobsCollection)).pipe(
      map(snapshot => {
        const jobs: Job[] = [];
        snapshot.forEach(doc => {
          jobs.push({
            id: doc.id,
            ...doc.data()
          } as Job);
        });
        return jobs;
      })
    );
  }

  // Agregar un trabajo (para migrar los hardcodeados)
  addJob(job: Job): Observable<string> {
    const jobsCollection = collection(this.db, 'jobs');
    const jobData = {
      ...job,
      createdAt: new Date(),
      isActive: true
    };

    return from(addDoc(jobsCollection, jobData)).pipe(
      map(docRef => docRef.id)
    );
  }

  // Helper para agregar trabajos rápidamente (usar en DevTools)
  addQuickJob(
    title: string,
    company: string,
    location: string,
    type: string,
    description: string,
    accessibility: string[],
    remote: boolean,
    salary?: string
  ): Observable<string> {
    const job: Job = {
      title,
      company,
      location,
      type,
      description,
      accessibility,
      remote,
      salary
    };

    return this.addJob(job);
  }

  // Migrar los trabajos hardcodeados a Firestore
  async migrateSampleJobs(): Promise<string[]> {
    const sampleJobs: Job[] = [
      {
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

    const results: string[] = [];
    for (const job of sampleJobs) {
      const result = await this.addJob(job).toPromise();
      if (result) {
        results.push(result);
      }
    }
    return results;
  }

  // **APLICACIONES A TRABAJOS**

  // Aplicar a un trabajo
  applyToJob(jobId: string, userEmail: string, userName?: string): Observable<string> {
    const applicationsCollection = collection(this.db, 'job_applications');
    const applicationData: JobApplication = {
      jobId,
      userEmail,
      userName,
      appliedAt: new Date(),
      status: 'enviada'
    };

    return from(addDoc(applicationsCollection, applicationData)).pipe(
      map(docRef => docRef.id)
    );
  }

  // Verificar si ya aplicó a un trabajo
  hasAppliedToJob(jobId: string, userEmail: string): Observable<boolean> {
    const applicationsCollection = collection(this.db, 'job_applications');
    const q = query(
      applicationsCollection,
      where('jobId', '==', jobId),
      where('userEmail', '==', userEmail)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => !snapshot.empty)
    );
  }

  // Obtener aplicaciones de un usuario
  getUserApplications(userEmail: string): Observable<JobApplication[]> {
    const applicationsCollection = collection(this.db, 'job_applications');
    const q = query(applicationsCollection, where('userEmail', '==', userEmail));

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const applications: JobApplication[] = [];
        snapshot.forEach(doc => {
          applications.push({
            id: doc.id,
            ...doc.data()
          } as JobApplication);
        });
        return applications;
      })
    );
  }
}