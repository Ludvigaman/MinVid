import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { VideoMetadata } from '../../Models/videoMetadata';
import { FileServiceService } from '../../Services/file-service.service';
import { ImageMetadata } from '../../Models/imageMetadata';
import { Comic } from '../../Models/comic';

@Component({
  selector: 'app-search-page',
  standalone: false,
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss'
})
export class SearchPageComponent {
  
  catalog: VideoMetadata[] = [];
  imageCatalog: ImageMetadata[] = [];
  comicCatalog: Comic[] = [];
  thumbnails: string[] = [];
  searchString: string;
  isVideo = true;
  isComic = false;
  isImages = false;
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
      this.comicCatalog = await this.videoService.getCatalog(100);

    } else {
      this.searchString = searchString;

      var searchArray = this.searchString
          .split(' ')
          .map(t => t.trim())
          .filter(t => t.length > 0);
  
      this.imageCatalog = await this.videoService.searchImages(searchArray);
      this.catalog = await this.videoService.search(searchArray);
      this.comicCatalog = await this.videoService.searchComics(searchArray);

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

  getPageImageUrl(comicId: string, page: number){
    var url = this.videoService.getPageImageUrl(comicId, page);
    return url;
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

  openComic(id: string){
    this.router.navigateByUrl("/comic/" + id)
  }

  capitalize(input: string){
    if (!input) return '';
    return input.toLowerCase().charAt(0).toUpperCase() + input.toLowerCase().slice(1);
  }

  async deleteImage(id: string){
    var res = confirm("Are you sure you want to delete this image?")
    if(res){
      var deleteRes = await this.videoService.deleteImage(id);
      if(deleteRes){
        alert("Image deleted sucessfully")
        this.closeImage();
      } else {
        alert("Could not delete image...")
      }
    }
  }
}
