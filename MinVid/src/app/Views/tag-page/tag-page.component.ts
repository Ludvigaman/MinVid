import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoMetadata } from '../../Models/videoMetadata';
import { FileServiceService } from '../../Services/file-service.service';

@Component({
  selector: 'app-tag-page',
  standalone: false,
  templateUrl: './tag-page.component.html',
  styleUrl: './tag-page.component.scss'
})
export class TagPageComponent {
  
  catalog: VideoMetadata[] = [];
  thumbnails: string[] = [];
  tag: string;
  allTags: string[];
  showTagList = false;
  groupedTags: { [key: string]: string[] } = {};

  alphabeticalSort = (a: { key: string }, b: { key: string }) => {
    return a.key.localeCompare(b.key);
  };

  constructor(private videoService: FileServiceService, private router: Router, private route: ActivatedRoute){

  }

  async ngOnInit() {
    const tag  = this.route.snapshot.paramMap.get('tag') || ''; 

    if(tag == "all"){
      this.tag = "all"
      this.showTagList = true;
      
      this.allTags = await this.videoService.getTagList();

      this.groupedTags = this.allTags.reduce((groups, tag) => {
        const key = tag.trim().charAt(0).toUpperCase();
        if (!groups[key]) groups[key] = [];
        groups[key].push(tag);
        return groups;
      }, {} as { [key: string]: string[] });
  
      for (const key in this.groupedTags) {
        this.groupedTags[key].sort((a, b) => a.localeCompare(b));
      }

    } else {
      this.tag = tag;

      this.catalog = await this.videoService.getVideosWithTag(tag);
      if(this.catalog.length > 0){
        this.catalog.forEach(c => {
          var thumbnail = this.videoService.getThumbnailUrl(c.id);
          this.thumbnails.push(thumbnail);
        });
      }
    }

  }

  navigateToTag(tag: string) {
    window.location.href = "/tags/" + tag;
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
