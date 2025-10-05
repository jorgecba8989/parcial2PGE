import { Injectable, OnDestroy } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, Firestore, query, where } from 'firebase/firestore';
import { Observable, from, map, catchError, throwError, of, retry, timeout } from 'rxjs';
import { firebaseConfig } from '../../environments/firebase.config';
import { TestLoggerService, LogLevel } from './test-logger.service';

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
  message?: string;
  hasAttachment?: boolean;
  attachmentName?: string | null;
  status: 'enviada';
  appliedAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class JobsService implements OnDestroy {
  private db: Firestore;
  private readonly TIMEOUT_MS = 10000; // 10 segundos
  private readonly MAX_RETRIES = 2;

  constructor(private testLogger: TestLoggerService) {
    try {
      const app = initializeApp(firebaseConfig);
      this.db = getFirestore(app);
      console.log('JobsService: Firebase inicializado correctamente');
      this.testLogger.success('JobsService: Firebase inicializado correctamente');
    } catch (error) {
      console.error('JobsService: Error al inicializar Firebase:', error);
      this.testLogger.error('JobsService: Error al inicializar Firebase', error);
      throw new Error('No se pudo conectar con la base de datos');
    }
  }

  ngOnDestroy(): void {
    // Limpieza de recursos si es necesario
    console.log('JobsService: Servicio destruido, recursos liberados');
    this.testLogger.info('JobsService: Servicio destruido, recursos liberados');
  }

  // Obtener todos los trabajos desde Firestore
  getJobs(): Observable<Job[]> {
    try {
      if (!this.db) {
        throw new Error('Base de datos no inicializada');
      }

      const jobsCollection = collection(this.db, 'jobs');

      return from(getDocs(jobsCollection)).pipe(
        timeout(this.TIMEOUT_MS),
        retry(this.MAX_RETRIES),
        map(snapshot => {
          const jobs: Job[] = [];

          if (snapshot.empty) {
            console.warn('JobsService: No se encontraron trabajos en la base de datos');
            this.testLogger.warning('JobsService: No se encontraron trabajos en la base de datos');
            return jobs;
          }

          snapshot.forEach(doc => {
            try {
              const jobData = doc.data();
              jobs.push({
                id: doc.id,
                ...jobData
              } as Job);
            } catch (error) {
              console.error(`JobsService: Error al procesar trabajo ${doc.id}:`, error);
              this.testLogger.error(`JobsService: Error al procesar trabajo ${doc.id}`, error);
              // Continuar con los demás trabajos
            }
          });

          console.log(`JobsService: ${jobs.length} trabajos obtenidos correctamente`);
          this.testLogger.success(`JobsService: ${jobs.length} trabajos obtenidos correctamente`);
          return jobs;
        }),
        catchError(error => {
          console.error('JobsService: Error al obtener trabajos:', error);

          if (error.name === 'TimeoutError') {
            this.testLogger.error('TimeoutError: Tiempo de espera agotado al cargar trabajos', { timeout: this.TIMEOUT_MS });
            return throwError(() => new Error('Tiempo de espera agotado al cargar trabajos'));
          }

          this.testLogger.error('JobsService: Error al obtener trabajos', error);
          return throwError(() => new Error('No se pudieron cargar los trabajos. Por favor intente nuevamente.'));
        })
      );
    } catch (error) {
      console.error('JobsService: Error crítico en getJobs:', error);
      return throwError(() => new Error('Error al acceder a la base de datos'));
    }
  }



  // **APLICACIONES A TRABAJOS**

  // Aplicar a un trabajo
  applyToJob(
    jobId: string,
    userEmail: string,
    userName?: string,
    message?: string,
    attachmentFile?: File
  ): Observable<string> {
    try {
      // Validaciones
      if (!jobId || !userEmail) {
        console.error('JobsService: Datos incompletos para aplicar a trabajo');
        return throwError(() => new Error('Datos incompletos para la aplicación'));
      }

      if (!this.db) {
        return throwError(() => new Error('Base de datos no disponible'));
      }

      const applicationsCollection = collection(this.db, 'job_applications');
      const applicationData: JobApplication = {
        jobId,
        userEmail,
        userName: userName || 'Anónimo',
        message: message || '',
        hasAttachment: !!attachmentFile,
        attachmentName: attachmentFile?.name || null,
        status: 'enviada',
        appliedAt: new Date()
      };

      console.log('JobsService: Enviando aplicación a trabajo:', jobId);
      this.testLogger.info('JobsService: Enviando aplicación a trabajo', { jobId, userEmail, userName });

      return from(addDoc(applicationsCollection, applicationData)).pipe(
        timeout(this.TIMEOUT_MS),
        retry(1), // Solo 1 reintento para aplicaciones
        map(docRef => {
          console.log('JobsService: Aplicación enviada exitosamente, ID:', docRef.id);
          this.testLogger.success('JobsService: Aplicación enviada exitosamente', { applicationId: docRef.id });
          return docRef.id;
        }),
        catchError(error => {
          console.error('JobsService: Error al enviar aplicación a Firebase:', error);
          this.testLogger.error('JobsService: Error al enviar aplicación a Firebase', error);

          if (error.name === 'TimeoutError') {
            this.testLogger.error('TimeoutError al enviar aplicación', { timeout: this.TIMEOUT_MS });
            return throwError(() => new Error('Tiempo de espera agotado al enviar aplicación'));
          }

          if (error.code === 'permission-denied') {
            this.testLogger.error('Error de permisos en Firebase', { code: error.code });
            return throwError(() => new Error('No tiene permisos para realizar esta acción'));
          }

          return throwError(() => new Error('Error al enviar la aplicación. Por favor intente nuevamente.'));
        })
      );
    } catch (error) {
      console.error('JobsService: Error crítico en applyToJob:', error);
      return throwError(() => new Error('Error al procesar la aplicación'));
    }
  }

  // Verificar si ya aplicó a un trabajo
  hasAppliedToJob(jobId: string, userEmail: string): Observable<boolean> {
    try {
      if (!jobId || !userEmail) {
        console.warn('JobsService: Parámetros inválidos para hasAppliedToJob');
        return of(false);
      }

      if (!this.db) {
        return throwError(() => new Error('Base de datos no disponible'));
      }

      const applicationsCollection = collection(this.db, 'job_applications');
      const q = query(
        applicationsCollection,
        where('jobId', '==', jobId),
        where('userEmail', '==', userEmail)
      );

      return from(getDocs(q)).pipe(
        timeout(this.TIMEOUT_MS),
        map(snapshot => {
          const hasApplied = !snapshot.empty;
          console.log(`JobsService: Usuario ${hasApplied ? 'ya' : 'no'} ha aplicado al trabajo ${jobId}`);
          return hasApplied;
        }),
        catchError(error => {
          console.error('JobsService: Error al verificar aplicación:', error);
          // En caso de error, asumimos que no ha aplicado para no bloquear
          return of(false);
        })
      );
    } catch (error) {
      console.error('JobsService: Error crítico en hasAppliedToJob:', error);
      return of(false);
    }
  }

  // Obtener aplicaciones de un usuario
  getUserApplications(userEmail: string): Observable<JobApplication[]> {
    try {
      if (!userEmail) {
        console.warn('JobsService: Email no proporcionado para getUserApplications');
        return of([]);
      }

      if (!this.db) {
        return throwError(() => new Error('Base de datos no disponible'));
      }

      const applicationsCollection = collection(this.db, 'job_applications');
      const q = query(applicationsCollection, where('userEmail', '==', userEmail));

      return from(getDocs(q)).pipe(
        timeout(this.TIMEOUT_MS),
        retry(this.MAX_RETRIES),
        map(snapshot => {
          const applications: JobApplication[] = [];

          if (snapshot.empty) {
            console.log('JobsService: No se encontraron aplicaciones para el usuario');
            return applications;
          }

          snapshot.forEach(doc => {
            try {
              applications.push({
                id: doc.id,
                ...doc.data()
              } as JobApplication);
            } catch (error) {
              console.error(`JobsService: Error al procesar aplicación ${doc.id}:`, error);
            }
          });

          console.log(`JobsService: ${applications.length} aplicaciones obtenidas para usuario`);
          return applications;
        }),
        catchError(error => {
          console.error('JobsService: Error al obtener aplicaciones del usuario:', error);
          return throwError(() => new Error('No se pudieron cargar las aplicaciones'));
        })
      );
    } catch (error) {
      console.error('JobsService: Error crítico en getUserApplications:', error);
      return of([]);
    }
  }

  // Obtener TODAS las aplicaciones (para cualquier email)
  getAllUserApplications(): Observable<JobApplication[]> {
    try {
      if (!this.db) {
        return throwError(() => new Error('Base de datos no disponible'));
      }

      const applicationsCollection = collection(this.db, 'job_applications');

      return from(getDocs(applicationsCollection)).pipe(
        timeout(this.TIMEOUT_MS),
        retry(this.MAX_RETRIES),
        map(snapshot => {
          const applications: JobApplication[] = [];

          if (snapshot.empty) {
            console.log('JobsService: No hay aplicaciones en el sistema');
            return applications;
          }

          snapshot.forEach(doc => {
            try {
              applications.push({
                id: doc.id,
                ...doc.data()
              } as JobApplication);
            } catch (error) {
              console.error(`JobsService: Error al procesar aplicación ${doc.id}:`, error);
            }
          });

          console.log(`JobsService: ${applications.length} aplicaciones totales obtenidas`);
          return applications;
        }),
        catchError(error => {
          console.error('JobsService: Error al obtener todas las aplicaciones:', error);

          if (error.name === 'TimeoutError') {
            return throwError(() => new Error('Tiempo de espera agotado al cargar aplicaciones'));
          }

          return throwError(() => new Error('No se pudieron cargar las aplicaciones'));
        })
      );
    } catch (error) {
      console.error('JobsService: Error crítico en getAllUserApplications:', error);
      return of([]);
    }
  }
}