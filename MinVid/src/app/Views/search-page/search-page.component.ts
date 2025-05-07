import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { VideoMetadata } from '../../Models/videoMetadata';
import { FileServiceService } from '../../Services/file-service.service';

@Component({
  selector: 'app-search-page',
  standalone: false,
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss'
})
export class SearchPageComponent {
  catalog: VideoMetadata[] = [];
  thumbnails: string[] = [];
  searchString: string;

  constructor(private videoService: FileServiceService, private router: Router, private route: ActivatedRoute){

  }

  async ngOnInit() {
    const searchString  = this.route.snapshot.paramMap.get('searchString') || ''; 
    this.searchString = searchString;

    var searchArray = this.searchString
        .split(' ')
        .map(t => t.trim())
        .filter(t => t.length > 0);

    this.catalog = await this.videoService.search(searchArray);
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
