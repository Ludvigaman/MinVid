import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoMetadata } from '../../Models/videoMetadata';
import { FileServiceService } from '../../Services/file-service.service';
import { ImageMetadata } from '../../Models/imageMetadata';
import { Comic } from '../../Models/comic';

@Component({
  selector: 'app-tag-page',
  standalone: false,
  templateUrl: './tag-page.component.html',
  styleUrl: './tag-page.component.scss'
})
export class TagPageComponent {
  
  catalog: VideoMetadata[] = [];
  imageCatalog: ImageMetadata[] = [];
  comicCatalog: Comic[] = [];
  thumbnails: string[] = [];
  tag: string;
  allTags: string[];
  showTagList = false;
  groupedTags: { [key: string]: string[] } = {};
  isVideo = true;
  isImages = false;
  isComic = false;
  selectedImageIndex: number | null = null;


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

      this.imageCatalog = await this.videoService.getImagesWithTag(tag)
      this.catalog = await this.videoService.getVideosWithTag(tag);
      this.comicCatalog = await this.videoService.searchComics([tag])

      if(this.catalog.length > 0){
        this.catalog.forEach(c => {
          var thumbnail = this.videoService.getThumbnailUrl(c.id);
          this.thumbnails.push(thumbnail);
        });
      }
    }

    if(this.catalog.length == 0 && this.comicCatalog.length > 0){
      this.isVideo = false;
      this.isComic = true;
    } else if (this.catalog.length == 0 && this.imageCatalog.length > 0){
      this.isVideo = false;
      this.isImages = true;
    }

  }

  setView(view: string){
    if(view == "images") {
      this.isVideo = false;
      this.isComic = false;
      this.isImages = true;
    } else if (view == "comics") {
      this.isVideo = false;
      this.isImages = false;
      this.isComic = true;
    } else {
      this.isComic = false;
      this.isImages = false;
      this.isVideo = true;
    }
  }

  getPageImageUrl(comicId: string, page: number){
    var url = this.videoService.getPageImageUrl(comicId, page);
    return url;
  }

  openComic(id: string){
    this.router.navigateByUrl("/comic/" + id)
  }

  createDurationString(duration: number): string {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    } else {
      return `${pad(minutes)}:${pad(seconds)}`;
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

getImage(iamgeId: string){
    return this.videoService.getImageUrl(iamgeId);
  }

  openImage(index: number): void {
    this.selectedImageIndex = index;
  }

  nextImage(event: MouseEvent) {
    event.stopPropagation(); // prevent closing modal
    if (this.selectedImageIndex !== null && this.selectedImageIndex < this.imageCatalog.length - 1) {
      this.selectedImageIndex++;
    }
  }

  toTag(tag: string){
    this.router.navigateByUrl("/tags/" + tag)
  }

  prevImage(event: MouseEvent) {
    event.stopPropagation();
    if (this.selectedImageIndex !== null && this.selectedImageIndex > 0) {
      this.selectedImageIndex--;
    }
  }

  closeImage() {
    this.selectedImageIndex = null;
  }
}
