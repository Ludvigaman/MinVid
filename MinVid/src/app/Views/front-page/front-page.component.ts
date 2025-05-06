import { Component, OnInit } from '@angular/core';
import { FileServiceService } from '../../Services/file-service.service';
import { VideoMetadata } from '../../Models/videoMetadata';

@Component({
  selector: 'app-front-page',
  standalone: false,
  templateUrl: './front-page.component.html',
  styleUrl: './front-page.component.scss'
})
export class FrontPageComponent implements OnInit {

  catalog: VideoMetadata[];
  thumbnails: string[] = [];

  constructor(private videoService: FileServiceService){

  }

  async ngOnInit() {
    this.catalog = await this.videoService.loadLatest();
    if(this.catalog.length > 0){
      this.catalog.forEach(c => {
        console.log(c)
        var thumbnail = this.videoService.getThumbnailUrl(c.id);
        console.log(this.videoService.getThumbnailUrl(c.id))
        this.thumbnails.push(thumbnail);
      });
  
      console.log(this.thumbnails)
    }

  }
}
