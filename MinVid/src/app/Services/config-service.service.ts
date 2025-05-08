import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigServiceService {

  constructor(private http: HttpClient) {} // Inject HttpClient in the constructor

  getConfig(): Observable<any> {
    return this.http.get("/assets/config.json");
  }
}
