import { Component, OnDestroy, OnInit } from '@angular/core';
import { FileServiceService } from '../../Services/file-service.service';
import { VideoMetadata } from '../../Models/videoMetadata';
import { NavigationStart, Router } from '@angular/router';
import { ImageMetadata } from '../../Models/imageMetadata';
import { Comic } from '../../Models/comic';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-front-page',
  standalone: false,
  templateUrl: './front-page.component.html',
  styleUrl: './front-page.component.scss'
})
export class FrontPageComponent implements OnInit, OnDestroy {

  catalog: VideoMetadata[];
  shortsCatalog: VideoMetadata[];
  imageCatalog: ImageMetadata[];
  comicCatalog: Comic[] = [];
  thumbnails: string[] = [];
  selectedImageIndex: number | null = null;
  selectedShortIndex: number | null = null;
  routerSub!: Subscription;

  allTags: string[];
  topTags: string[];
  allTagsCount: Record<string, number>;
  groupedTags: { [key: string]: string[] } = {};

  unrestricted: boolean = false;

  alphabeticalSort = (a: { key: string }, b: { key: string }) => {
    return a.key.localeCompare(b.key);
  };

  constructor(private videoService: FileServiceService, private router: Router){

  }

  async ngOnInit() {

    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        document.body.style.overflow = '';
      }
    });

    this.unrestricted = (localStorage.getItem("unrestricted") == "true")

    this.imageCatalog = await this.videoService.loadLatestImages(1, this.unrestricted);
    this.comicCatalog = await this.videoService.getCatalog(1, this.unrestricted);
    this.catalog = await this.videoService.loadLatest(1, this.unrestricted);
    this.shortsCatalog = await this.videoService.loadLatestShorts(1, this.unrestricted);
    
    if(this.catalog.length > 0){
      this.catalog.forEach(c => {
        var thumbnail = this.videoService.getThumbnailUrl(c.id);
        this.thumbnails.push(thumbnail);
      });
    }

    if(this.shortsCatalog.length > 0){
      this.shortsCatalog.forEach(c => {
        var thumbnail = this.videoService.getThumbnailUrl(c.id);
        this.thumbnails.push(thumbnail);
      });
    }

    this.allTags = await this.videoService.getTagList(this.unrestricted);
    this.allTagsCount = await this.videoService.getTagListCount(this.unrestricted);

    this.topTags = [...this.allTags]
      .sort((a, b) => this.getTagCount(b) - this.getTagCount(a))
      .slice(0, 10);

  }

  getTagCount(tag: string): number {
    return this.allTagsCount?.[tag] ?? 0;
  }

  navigateToTag(tag: string) {
    window.location.href = "/tags/" + tag;
  }


  ngOnDestroy() {
    document.body.style.overflow = ''; // Restore scroll on destroy
    this.routerSub?.unsubscribe();
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

  // Images

  openImage(index: number): void {
    this.selectedImageIndex = index;
    document.body.style.overflow = 'hidden';
  }

  getVideo(videoId: string){
    return this.videoService.getVideoUrl(videoId) + `?cb=${Date.now()}`;
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
    document.body.style.overflow = '';
  }

  // Shorts

  openShort(index: number): void {
    this.selectedShortIndex = index;
    document.body.style.overflow = 'hidden';
  }

  nextShort(event: MouseEvent) {
    event.stopPropagation(); // prevent closing modal
    if (this.selectedShortIndex !== null && this.selectedShortIndex < this.shortsCatalog.length - 1) {
      this.selectedShortIndex++;
    }
  }

  prevShort(event: MouseEvent) {
    event.stopPropagation();
    if (this.selectedShortIndex !== null && this.selectedShortIndex > 0) {
      this.selectedShortIndex--;
    }
  }

  async closeShort() {
    this.selectedShortIndex = null;
    document.body.style.overflow = '';
  }

  // Comics

  openComic(id: string){
    this.router.navigateByUrl("/comic/" + id)
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

  async deleteShort(id: string){
    var res = confirm("Are you sure you want to delete this short?")
    if(res){
      var deleteRes = await this.videoService.delete(id);
      if(deleteRes){
        alert("Short deleted sucessfully")
        this.closeShort();
        location.reload();
      } else {
        alert("Could not delete short...")
      }
    }
  }

  getPageImageUrl(comicId: string, page: number){
    var url = this.videoService.getPageImageUrl(comicId, page);
    return url;
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
