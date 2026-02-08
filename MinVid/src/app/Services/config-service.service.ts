import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigServiceService {

  private config$?: Observable<AppConfig>;

  constructor(private http: HttpClient) {}

  getConfig(): Observable<AppConfig> {
    if (!this.config$) {
      this.config$ = this.http
        .get<AppConfig>(environment.configFilePath)
        .pipe(shareReplay(1)); // cache for everyone
    }
    return this.config$;
  }

}

export interface AppConfig {
  API_URL: string;
}
