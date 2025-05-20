import { Injectable } from '@angular/core';
import { VideoMetadata } from '../Models/videoMetadata';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { ConfigServiceService } from './config-service.service';
import { ImageMetadata } from '../Models/imageMetadata';
import { PasswordChangeObject } from '../Models/passwordChangeObject';

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
      sessionStorage.setItem("API_URL", config.API_URL);
    })

    if(this.API_URL == undefined){
      this.API_URL = sessionStorage.getItem("API_URL")!;
    }
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

  async scanLibrary(): Promise<string[]> {
    try {
      return await firstValueFrom(this._client.get<string[]>(`${this.API_URL}/scanLibrary/`));
    } catch (error) {
      console.error('Error during login', error);
      return [];
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

  getImageUrl(imageId: string): string {
    return `${this.API_URL}/image/${imageId}`;
  }
  
  async search(tags: string[]): Promise<VideoMetadata[]> {
    try {
      return await firstValueFrom(this._client.post<VideoMetadata[]>(`${this.API_URL}/search/`, tags));
    } catch (error) {
      console.error('Error during search', error);
      return [];
    }
  }

  async searchImages(tags: string[]): Promise<ImageMetadata[]> {
    try {
      return await firstValueFrom(this._client.post<ImageMetadata[]>(`${this.API_URL}/searchImages/`, tags));
    } catch (error) {
      console.error('Error during search', error);
      return [];
    }
  }

  async getImagesWithTag(tag: string): Promise<ImageMetadata[]> {
    try {
      const result = await firstValueFrom(this._client.get<ImageMetadata[]>(`${this.API_URL}/getImagesWithTag/${tag}`));
      return result;
    } catch (error) {
      console.error('Error loading tag list', error);
      return [];
    }
  }

  async uploadImage(formData: FormData): Promise<{ id: string }> {
    try {
      return await firstValueFrom(this._client.post<{ id: string }>(`${this.API_URL}/uploadImage`, formData));
    } catch (error) {
      console.error('Error during upload', error);
      return { id: "0" };
    }
  }

  async updateVideoMetadata(metadata: VideoMetadata): Promise<boolean> {
    try {
      return await firstValueFrom(this._client.post<boolean>(`${this.API_URL}/updateMetadata/`, metadata));
    } catch (error) {
      console.error('Error during search', error);
      return false;
    }
  }

  async uploadVideo(formData: FormData): Promise<{ id: string }> {
    try {
      return await firstValueFrom(this._client.post<{ id: string }>(`${this.API_URL}/upload`, formData));
    } catch (error) {
      console.error('Error during upload', error);
      return { id: "0" };
    }
  }

  async uploadThumbnail(formData: FormData, videoId: string): Promise<boolean> {
    try {
      return await firstValueFrom(this._client.post<boolean>(`${this.API_URL}/upload-thumbnail/${videoId}`, formData));
    } catch (error) {
      console.error('Error during search', error);
      return false;
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

  async loadLatestImages(count: number): Promise<ImageMetadata[]> {
    try {
      const result = await firstValueFrom(this._client.get<ImageMetadata[]>(this.API_URL + "/getLatestImages/" + count));
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

  async changePassword(pwObj: PasswordChangeObject): Promise<boolean>{
    try {
      return await firstValueFrom(this._client.post<boolean>(`${this.API_URL}/resetPassword`, pwObj));
    } catch (error) {
      console.error('Could not change password!', error);
      return false;
    }
  }
}
