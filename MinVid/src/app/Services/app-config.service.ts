import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private appConfig: any;

  constructor(private http: HttpClient) { }

  loadAppConfig() {
    return this.http.get('/assets/appsettings.json')
      .toPromise()
      .then(data => {
        this.appConfig = data;
      });
  }
  
  getDataDirectory() {

    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }

    return this.appConfig.ata_directory;
  }
}