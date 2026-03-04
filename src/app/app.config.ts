import { registerLocaleData } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import localeDa from '@angular/common/locales/da';
import localeDaExtra from '@angular/common/locales/extra/da';
import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  importProvidersFrom,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { tokenInterceptor } from '@core/interceptors/token.interceptor';
import { environment } from '@env/environment';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ApiModule, Configuration } from 'openapi/generated';

import { routes } from './app.routes';

registerLocaleData(localeDa, 'da-DK', localeDaExtra);

export function httpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([tokenInterceptor])),
    importProvidersFrom(
      ApiModule.forRoot(
        () =>
          new Configuration({
            basePath: environment.path,
          })
      ),
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),

    { provide: LOCALE_ID, useValue: 'da-DK' },
    { provide: MAT_DATE_LOCALE, useValue: 'da-DK' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'DKK' },

    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
  ],
};
