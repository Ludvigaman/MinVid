import { Injectable } from '@angular/core';
import { VideoMetadata } from '../Models/videoMetadata';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { ConfigServiceService } from './config-service.service';

@Injectable({
  providedIn: 'root'
})
export class FileServiceService {

  _client: HttpClient;
  API_URL: String;

  constructor(private httpClient: HttpClient, private config: ConfigServiceService) { 
    this._client = httpClient;
    
    this.config.getConfig().subscribe(config => {
      this.API_URL = config.API_URL;
    })
  }

  //Please don't ever do it like this, this is STUPID and holy moly unsecure... But I don't really care at the moments, it's a private site with no public endpoints.
  async login(password: string): Promise<boolean> {
    try {
      return await firstValueFrom(this._client.get<boolean>(`${this.API_URL}/login/${password}`));
    } catch (error) {
      console.error('Error during login', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      return await firstValueFrom(this._client.get<boolean>(`${this.API_URL}/delete/${id}`));
    } catch (error) {
      console.error('Error deleting video', error);
      return false;
    }
  }
  
  async search(tags: string[]): Promise<VideoMetadata[]> {
    try {
      return await firstValueFrom(this._client.post<VideoMetadata[]>(`${this.API_URL}/search/`, tags));
    } catch (error) {
      console.error('Error during search', error);
      return [];
    }
  }

  getVideoMetadata(videoId: string): Observable<VideoMetadata> {
    const url = `${this.API_URL}/getVideoMetadata/${videoId}`;
    return this._client.get<VideoMetadata>(url);
  }

  getThumbnailUrl(videoId: string): string {
    var str = `${this.API_URL}/getThumbnail/${videoId}`;
    return str;
  }

  getVideoUrl(videoId: string): string {
    return `${this.API_URL}/video/${videoId}`;
  }

  async loadLatest(count: number): Promise<VideoMetadata[]> {
    try {
      const result = await firstValueFrom(this._client.get<VideoMetadata[]>(this.API_URL + "/getLatestVideos/" + count));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return [];
    }
  }

  async getRecommended(videoId: string): Promise<VideoMetadata[]> {
    try {
      const result = await firstValueFrom(this._client.get<VideoMetadata[]>(`${this.API_URL}/getRecommended/${videoId}`));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return [];
    }
  }

  async getVideosWithTag(tag: string): Promise<VideoMetadata[]> {
    try {
      const result = await firstValueFrom(this._client.get<VideoMetadata[]>(`${this.API_URL}/getVideosWithTag/${tag}`));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return [];
    }
  }

  async getTagList(): Promise<string[]> {
    try {
      const result = await firstValueFrom(this._client.get<string[]>(`${this.API_URL}/getTagList/`));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return [];
    }
  }

  async loadCatalog(): Promise<VideoMetadata[]> {
    try {
      const result = await firstValueFrom(this._client.get<VideoMetadata[]>(this.API_URL + "/getAllVideos"));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return [];
    }
  }
}
