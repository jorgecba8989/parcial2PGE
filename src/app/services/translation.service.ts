import { inject, Injectable } from '@angular/core';
import {
    TranslateService,
    TranslatePipe,
    TranslateDirective
} from "@ngx-translate/core";
import translationsES from "../../../public/i18n/es.json";
import translationsEN from "../../../public/i18n/en.json";
import { firstValueFrom } from 'rxjs'; // or lastValueFrom

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  private translateService = inject(TranslateService);

  constructor() {
    this.initialize();
  }

  private async initialize() {
    this.translateService.addLangs(['es', 'en']);
    this.translateService.setTranslation('es', translationsES);
    this.translateService.setTranslation('en', translationsEN);
    await firstValueFrom(this.translateService.setFallbackLang('es'));
    await firstValueFrom(this.translateService.use('es'));
  }


translate(code: string) {
  return this.translateService.instant(code);
}

  getCurrentLang() {
    return this.translateService.getCurrentLang();
  }

  async chageLanguage(code: string): Promise<any> {
    await firstValueFrom(this.translateService.use(code));
  }

  getLanguages() {
    return [
      {
        code: 'spanish',
        value: 'es'
      },
      {
        code: 'english',
        value: 'en'
      }
    ]
  }

}
