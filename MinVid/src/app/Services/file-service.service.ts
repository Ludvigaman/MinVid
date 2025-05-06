import { Injectable } from '@angular/core';
import { VideoMetadata } from '../Models/videoMetadata';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, Observable } from 'rxjs';
import { Guid } from 'guid-typescript';
import { API_URL } from '../CONFIG/constants';

@Injectable({
  providedIn: 'root'
})
export class FileServiceService {

  _client: HttpClient;

  constructor(private httpClient: HttpClient) { 
    this._client = httpClient;
  }

  //Should be GUID; but it's tricky...
  getVideoMetadata(videoId: string): Observable<VideoMetadata> {
    const url = `${API_URL}/getVideoMetadata/${videoId}`;
    return this._client.get<VideoMetadata>(url);
  }

  getThumbnailUrl(videoId: string): string {
    var str = `${API_URL}/getThumbnail/${videoId}`;
    return str;
  }

  getVideoUrl(videoId: string): string {
    return `${API_URL}/video/${videoId}`;
  }

  async loadLatest(): Promise<VideoMetadata[]> {
    try {
      const result = await firstValueFrom(this._client.get<VideoMetadata[]>(API_URL + "/getLatestVideos"));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return [];
    }
  }

  async loadCatalog(): Promise<VideoMetadata[]> {
    try {
      const result = await firstValueFrom(this._client.get<VideoMetadata[]>(API_URL + "/getAllVideos"));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return [];
    }
  }
}
