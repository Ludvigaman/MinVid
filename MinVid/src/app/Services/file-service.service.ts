import { Injectable } from '@angular/core';
import { Video } from '../Models/video';

@Injectable({
  providedIn: 'root'
})
export class FileServiceService {

  constructor() { }

  loadAllVideos(): Video[] {
    var videos: Video[] = [];

    

    return videos;
  }
}
