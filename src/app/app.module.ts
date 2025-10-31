import { NgModule, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JobSearchComponent } from './job-search/job-search.component';
import { ApplicationDialogComponent } from './components/application-dialog/application-dialog.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VoiceToggleComponent } from './components/voice-toggle/voice-toggle.component';
import { HighContrastToggleComponent } from './components/high-contrast-toggle/high-contrast-toggle.component';
import { LoadingComponent } from './components/loading/loading.component';
import { TestRunnerComponent } from './test-cases/test-runner.component';
import { provideTranslateService } from "@ngx-translate/core";
import { VoiceCommandOverlayComponent } from './components/voice-command-overlay/voice-command-overlay.component';

@NgModule({
  declarations: [
    AppComponent,
    JobSearchComponent,
    ApplicationDialogComponent,
    VoiceToggleComponent,
    HighContrastToggleComponent,
    LoadingComponent,
    TestRunnerComponent,
    VoiceCommandOverlayComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatToolbarModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatGridListModule,
    MatCheckboxModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  providers: [
    provideTranslateService({
      fallbackLang: 'es',
      lang: 'es'
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
