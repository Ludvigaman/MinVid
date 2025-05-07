import { Component, OnInit } from '@angular/core';
import { FileServiceService } from '../../Services/file-service.service';
import { VideoMetadata } from '../../Models/videoMetadata';
import { Router } from '@angular/router';

@Component({
  selector: 'app-front-page',
  standalone: false,
  templateUrl: './front-page.component.html',
  styleUrl: './front-page.component.scss'
})
export class FrontPageComponent implements OnInit {

  catalog: VideoMetadata[];
  thumbnails: string[] = [];

  constructor(private videoService: FileServiceService, private router: Router){

  }

  async ngOnInit() {
    this.catalog = await this.videoService.loadLatest();
    if(this.catalog.length > 0){
      this.catalog.forEach(c => {
        var thumbnail = this.videoService.getThumbnailUrl(c.id);
        this.thumbnails.push(thumbnail);
      });
    }
  }

  getThumbnail(id: string){
    return this.thumbnails.find(t => t.includes(id))
  }

  navigate(id: string){
    this.router.navigateByUrl("/video/" + id)
  }

  capitalize(input: string){
    if (!input) return '';
    return input.toLowerCase().charAt(0).toUpperCase() + input.toLowerCase().slice(1);
  }
}
