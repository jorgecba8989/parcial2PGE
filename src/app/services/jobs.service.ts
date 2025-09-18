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
  applyToJob(jobId: string, userEmail: string, userName?: string): Observable<string> {
    const applicationsCollection = collection(this.db, 'job_applications');
    const applicationData: JobApplication = {
      jobId,
      userEmail,
      userName,
      appliedAt: new Date()
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