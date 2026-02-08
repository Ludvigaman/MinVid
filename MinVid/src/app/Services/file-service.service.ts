import { Injectable } from '@angular/core';
import { VideoMetadata } from '../Models/videoMetadata';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable, shareReplay } from 'rxjs';
import { ConfigServiceService } from './config-service.service';
import { ImageMetadata } from '../Models/imageMetadata';
import { PasswordChangeObject } from '../Models/passwordChangeObject';
import { Comic } from '../Models/comic';

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
  }

  //------------------- Auth stuff ----------------------

  //Please don't ever do it like this, this is STUPID and holy moly unsecure... But I don't really care at the moments, it's a private site with no public endpoints.
  async login(password: string): Promise<boolean> {
    try {
      const config = await firstValueFrom(this.config.getConfig());
      if (!config.API_URL) throw new Error('API_URL missing in config');

      return await firstValueFrom(
        this.httpClient.get<boolean>(`${config.API_URL}/login/${password}`)
      );
    } catch (error) {
      console.error('Error during login', error);
      return false;
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
  
  //------------------- Library stuff ----------------------
  
  async scanLibrary(): Promise<string[]> {
    try {
      return await firstValueFrom(this._client.get<string[]>(`${this.API_URL}/scanLibrary/`));
    } catch (error) {
      console.error('Error during login', error);
      return [];
    }
  }

  //------------------- Comic stuff ----------------------

  async uploadComicZip(metadata: Comic, zipFile: File): Promise<string> {
    const formData = new FormData();
    formData.append("metadataJson", JSON.stringify(metadata));
    formData.append("zipFile", zipFile);

    try {
      const result = await firstValueFrom(this._client.post(`${this.API_URL}/uploadComicZip`, formData, { responseType: 'text' }));
      return result;
    } catch (err) {
      console.error("Upload failed", err);
      return "0";
    }
  }

  async getTotalComicCount(unrestricted: boolean): Promise<number> {
    try {
      const result = await firstValueFrom(this._client.get<number>(`${this.API_URL}/getTotalComicCount?unrestricted=${unrestricted}`));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return 0;
    }
  }

  async getTotalShortsCount(unrestricted: boolean): Promise<number> {
    try {
      const result = await firstValueFrom(this._client.get<number>(`${this.API_URL}/getTotalShortsCount?unrestricted=${unrestricted}`));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return 0;
    }
  }

  async deleteComic(comicId: string): Promise<boolean> {
    try {
      const result = await firstValueFrom(this._client.get<boolean>(`${this.API_URL}/deleteComic/${comicId}`));
      return result;
    } catch (error) {
      console.error('Error deleting comic', error);
      return false;
    }
  }

  async searchComics(tags: string[], unrestricted: boolean): Promise<Comic[]> {
    try {
      return await firstValueFrom(this._client.post<Comic[]>(`${this.API_URL}/comicSearch?unrestricted=${unrestricted}`, tags));
    } catch (error) {
      console.error('Error during search', error);
      return [];
    }
  }

  async getComicMetadata(comicId: string): Promise<Comic> {
    try {
      const result = await firstValueFrom(this._client.get<Comic>(`${this.API_URL}/comic/${comicId}`));
      return result;
    } catch (error) {
      console.error('Error loading tag list', error);
      return new Comic("0", "", "", "", 0, []);
    }
  }

  getPageImageUrl(comicId: string, page: number): string {
    return `${this.API_URL}/comicImage/${comicId}/${page}`;
  }

  async getCatalog(number: number, unrestricted: boolean): Promise<Comic[]> {
    try {
      const result = await firstValueFrom(this._client.get<Comic[]>(`${this.API_URL}/comicCatalog/${number}?unrestricted=${unrestricted}`));
      return result;
    } catch (error) {
      console.error('Error loading tag list', error);
      return [];
    }
  }

  // ----------------- Image stuff --------------------------

  getImageUrl(imageId: string): string {
    return `${this.API_URL}/image/${imageId}`;
  }

  async getTotalImageCount(unrestricted: boolean): Promise<number> {
    try {
      const result = await firstValueFrom(this._client.get<number>(`${this.API_URL}/getTotalImageCount?unrestricted=${unrestricted}`));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return 0;
    }
  }

  async searchImages(tags: string[], unrestricted: boolean): Promise<ImageMetadata[]> {
    try {
      return await firstValueFrom(this._client.post<ImageMetadata[]>(`${this.API_URL}/searchImages?unrestricted=${unrestricted}`, tags));
    } catch (error) {
      console.error('Error during search', error);
      return [];
    }
  }

  async getImagesWithTag(tag: string, unrestricted: boolean): Promise<ImageMetadata[]> {
    try {
      const result = await firstValueFrom(this._client.get<ImageMetadata[]>(`${this.API_URL}/getImagesWithTag/${tag}?unrestricted=${unrestricted}`));
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

  async loadLatestImages(count: number, unrestricted: boolean): Promise<ImageMetadata[]> {
  try {
    const result = await firstValueFrom(
      this._client.get<ImageMetadata[]>(
        `${this.API_URL}/getLatestImages/${count}?unrestricted=${unrestricted}`
      )
    );
    return result;
  } catch (error) {
    console.error('Error loading catalog', error);
    return [];
  }
  }

  async deleteImage(id: string): Promise<boolean> {
    try {
      const result = await firstValueFrom(this._client.get<boolean>(`${this.API_URL}/deleteImage/${id}`));
      return result;
    } catch (error) {
      console.error('Error deleting image with id:' + id, error);
      return false;
    }
  }


  // ----------------- Video stuff --------------------------


  async delete(id: string): Promise<boolean> {
    try {
      return await firstValueFrom(this._client.get<boolean>(`${this.API_URL}/delete/${id}`));
    } catch (error) {
      console.error('Error deleting video', error);
      return false;
    }
  }
  
  async search(tags: string[], unrestricted: boolean): Promise<VideoMetadata[]> {
    try {
      return await firstValueFrom(this._client.post<VideoMetadata[]>(`${this.API_URL}/search?unrestricted=${unrestricted}`, tags));
    } catch (error) {
      console.error('Error during search', error);
      return [];
    }
  }

  async searchShorts(tags: string[], unrestricted: boolean): Promise<VideoMetadata[]> {
    try {
      return await firstValueFrom(this._client.post<VideoMetadata[]>(`${this.API_URL}/searchShorts?unrestricted=${unrestricted}`, tags));
    } catch (error) {
      console.error('Error during search', error);
      return [];
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

  async loadLatest(page: number, unrestricted: boolean): Promise<VideoMetadata[]> {
    try {
      const result = await firstValueFrom(this._client.get<VideoMetadata[]>(`${this.API_URL}/getLatestVideos/${page}?unrestricted=${unrestricted}`));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return [];
    }
  }

  async loadLatestShorts(page: number, unrestricted: boolean): Promise<VideoMetadata[]> {
    try {
      const result = await firstValueFrom(this._client.get<VideoMetadata[]>(`${this.API_URL}/getLatestShorts/${page}?unrestricted=${unrestricted}`));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return [];
    }
  }

  async getTotalVideoCount(unrestricted: boolean): Promise<number> {
    try {
      const result = await firstValueFrom(this._client.get<number>(`${this.API_URL}/getTotalVideoCount?unrestricted=${unrestricted}`));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return 0;
    }
  }

  async getRecommended(videoId: string, unrestricted: boolean): Promise<VideoMetadata[]> {
    try {
      const result = await firstValueFrom(this._client.get<VideoMetadata[]>(`${this.API_URL}/getRecommended/${videoId}?unrestricted=${unrestricted}`));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return [];
    }
  }

  async getVideosWithTag(tag: string, unrestricted: boolean): Promise<VideoMetadata[]> {
    try {
      const result = await firstValueFrom(this._client.get<VideoMetadata[]>(`${this.API_URL}/getVideosWithTag/${tag}?unrestricted=${unrestricted}`));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return [];
    }
  }

  async getShortsWithTag(tag: string, unrestricted: boolean): Promise<VideoMetadata[]> {
    try {
      const result = await firstValueFrom(this._client.get<VideoMetadata[]>(`${this.API_URL}/getShortsWithTag/${tag}?unrestricted=${unrestricted}`));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return [];
    }
  }

  async getTagList(unrestricted: boolean): Promise<string[]> {
    try {
      const result = await firstValueFrom(this._client.get<string[]>(`${this.API_URL}/getTagList?unrestricted=${unrestricted}`));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return [];
    }
  }

  async getTagListCount(unrestricted: boolean): Promise<Record<string, number>> {
    try {
      const result = await firstValueFrom(this._client.get<Record<string, number>>(`${this.API_URL}/getTagListCount?unrestricted=${unrestricted}`));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return {};
    }
  }

  async loadCatalog(unrestricted: boolean): Promise<VideoMetadata[]> {
    try {
      const result = await firstValueFrom(this._client.get<VideoMetadata[]>(`${this.API_URL}/getAllVideos?unrestricted=${unrestricted}`));
      return result;
    } catch (error) {
      console.error('Error loading catalog', error);
      return [];
    }
  }


}
