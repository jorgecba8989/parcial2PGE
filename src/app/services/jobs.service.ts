import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, Firestore, query, where } from 'firebase/firestore';
import { Observable, from, map, catchError } from 'rxjs';
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
  message?: string;
  hasAttachment?: boolean;
  attachmentName?: string | null;
  status: 'enviada';
  appliedAt: any;
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



  // **APLICACIONES A TRABAJOS**

  // Aplicar a un trabajo
  applyToJob(
    jobId: string,
    userEmail: string,
    userName?: string,
    message?: string,
    attachmentFile?: File
  ): Observable<string> {
    const applicationsCollection = collection(this.db, 'job_applications');
    const applicationData: JobApplication = {
      jobId,
      userEmail,
      userName,
      message,
      hasAttachment: !!attachmentFile,
      attachmentName: attachmentFile?.name || null,
      status: 'enviada',
      appliedAt: new Date()
    };

    return from(addDoc(applicationsCollection, applicationData)).pipe(
      map(docRef => docRef.id),
      catchError(error => {
        console.error('Error al enviar aplicación a Firebase:', error);
        throw error;
      })
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

  // Obtener TODAS las aplicaciones (para cualquier email)
  getAllUserApplications(): Observable<JobApplication[]> {
    const applicationsCollection = collection(this.db, 'job_applications');

    return from(getDocs(applicationsCollection)).pipe(
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