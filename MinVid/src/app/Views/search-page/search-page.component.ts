import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { VideoMetadata } from '../../Models/videoMetadata';
import { FileServiceService } from '../../Services/file-service.service';
import { ImageMetadata } from '../../Models/imageMetadata';

@Component({
  selector: 'app-search-page',
  standalone: false,
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss'
})
export class SearchPageComponent {
  
  catalog: VideoMetadata[] = [];
  imageCatalog: ImageMetadata[] = [];
  thumbnails: string[] = [];
  searchString: string;
  isVideo = true;
  selectedImageIndex: number | null = null;

  constructor(private videoService: FileServiceService, private router: Router, private route: ActivatedRoute){

  }

  async ngOnInit() {
    const searchString  = this.route.snapshot.paramMap.get('searchString') || ''; 
    if(searchString == "all"){
      this.searchString = "all"

      this.catalog = await this.videoService.loadLatest(100);
      if(this.catalog.length > 0){
        this.catalog.forEach(c => {
          var thumbnail = this.videoService.getThumbnailUrl(c.id);
          this.thumbnails.push(thumbnail);
        });
      }

      this.imageCatalog = await this.videoService.loadLatestImages(100);

    } else {
      this.searchString = searchString;

      var searchArray = this.searchString
          .split(' ')
          .map(t => t.trim())
          .filter(t => t.length > 0);
  
      this.imageCatalog = await this.videoService.searchImages(searchArray);
      this.catalog = await this.videoService.search(searchArray);

      if(this.catalog.length == 0 && this.imageCatalog.length > 0){
        this.isVideo = false
      }

      if(this.catalog.length > 0){
        this.catalog.forEach(c => {
          var thumbnail = this.videoService.getThumbnailUrl(c.id);
          this.thumbnails.push(thumbnail);
        });
      }
    }
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
