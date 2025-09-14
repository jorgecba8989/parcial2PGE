import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobSearchComponent } from './job-search/job-search.component';

const routes: Routes = [
  { path: '', component: JobSearchComponent },
  { path: 'busqueda', component: JobSearchComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
