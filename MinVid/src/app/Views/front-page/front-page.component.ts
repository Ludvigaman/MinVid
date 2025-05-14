import { Component, OnInit } from '@angular/core';
import { FileServiceService } from '../../Services/file-service.service';
import { VideoMetadata } from '../../Models/videoMetadata';
import { Router } from '@angular/router';
import { ImageMetadata } from '../../Models/imageMetadata';

@Component({
  selector: 'app-front-page',
  standalone: false,
  templateUrl: './front-page.component.html',
  styleUrl: './front-page.component.scss'
})
export class FrontPageComponent implements OnInit {

  catalog: VideoMetadata[];
  imageCatalog: ImageMetadata[];
  thumbnails: string[] = [];
  selectedImageIndex: number | null = null;

  constructor(private videoService: FileServiceService, private router: Router){

  }

  async ngOnInit() {
    this.imageCatalog = await this.videoService.loadLatestImages(12);
    this.catalog = await this.videoService.loadLatest(12);
    if(this.catalog.length > 0){
      this.catalog.forEach(c => {
        var thumbnail = this.videoService.getThumbnailUrl(c.id);
        this.thumbnails.push(thumbnail);
      });
    }
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

  prevImage(event: MouseEvent) {
    event.stopPropagation();
    if (this.selectedImageIndex !== null && this.selectedImageIndex > 0) {
      this.selectedImageIndex--;
    }
  }

  closeImage() {
    this.selectedImageIndex = null;
  }

  get selectedImage(): ImageMetadata | null {
    return this.selectedImageIndex !== null ? this.imageCatalog[this.selectedImageIndex] : null;
  }

  getImage(iamgeId: string){
    return this.videoService.getImageUrl(iamgeId);
  }

  getThumbnail(id: string){
    return this.thumbnails.find(t => t.includes(id))
  }

  navigate(id: string){
    this.router.navigateByUrl("/video/" + id)
  }

  toTag(tag: string){
    this.router.navigateByUrl("/tags/" + tag)
  }

  capitalize(input: string){
    if (!input) return '';
    return input.toLowerCase().charAt(0).toUpperCase() + input.toLowerCase().slice(1);
  }
}
