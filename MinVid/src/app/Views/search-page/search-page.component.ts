import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { VideoMetadata } from '../../Models/videoMetadata';
import { FileServiceService } from '../../Services/file-service.service';
import { ImageMetadata } from '../../Models/imageMetadata';
import { Comic } from '../../Models/comic';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-page',
  standalone: false,
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss'
})
export class SearchPageComponent implements OnInit, OnDestroy{
  
  catalog: VideoMetadata[] = [];
  imageCatalog: ImageMetadata[] = [];
  comicCatalog: Comic[] = [];
  shortsCatalog: VideoMetadata[] = [];
  thumbnails: string[] = [];
  searchString: string;
  isVideo = true;
  isComic = false;
  isImages = false;
  isShorts = false;

  selectedShortIndex: number | null = null;
  selectedImageIndex: number | null = null;

  videoPages: number[] = [];
  imagePages: number[] = [];
  comicPages: number[] = [];
  shortsPages: number[] = [];

  currentPageComic = 1;
  currentPageVideo = 1;
  currentPageImage = 1;
  currentPageShorts = 1;

  visiblePageNumbersComic: number[] = [];
  visiblePageNumbersVideo: number[] = [];
  visiblePageNumbersImage: number[] = [];
  visiblePageNumbersShorts: number[] = [];

  routerSub!: Subscription;

  constructor(private videoService: FileServiceService, private router: Router, private route: ActivatedRoute){

  }

  async ngOnInit() {

    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        document.body.style.overflow = ''; // Restore scroll on navigation
      }
    });

    const searchString  = this.route.snapshot.paramMap.get('searchString') || ''; 
    if(searchString == "all"){

      const videoPages = Math.ceil(await this.videoService.getTotalVideoCount() / 16);
      this.videoPages = Array.from({ length: videoPages }, (_, i) => i + 1);

      const imagePages = Math.ceil(await this.videoService.getTotalImageCount() / 16);
      this.imagePages = Array.from({ length: imagePages }, (_, i) => i + 1);

      const comicPages = Math.ceil(await this.videoService.getTotalComicCount() / 16);
      this.comicPages = Array.from({ length: comicPages }, (_, i) => i + 1);

      const shortsPages = Math.ceil(await this.videoService.getTotalShortsCount() / 16);
      this.shortsPages = Array.from({ length: shortsPages }, (_, i) => i + 1);

      this.updateAllVisiblePageNumbers();

      this.searchString = "all"

      this.catalog = await this.videoService.loadLatest(1);

      if(this.catalog.length > 0){
        this.catalog.forEach(c => {
          var thumbnail = this.videoService.getThumbnailUrl(c.id);
          this.thumbnails.push(thumbnail);
        });
      }

      this.shortsCatalog = await this.videoService.loadLatestShorts(1);

      if(this.shortsCatalog.length > 0){
        this.shortsCatalog.forEach(c => {
          var thumbnail = this.videoService.getThumbnailUrl(c.id);
          this.thumbnails.push(thumbnail);
        });
      }

      this.imageCatalog = await this.videoService.loadLatestImages(1);
      this.comicCatalog = await this.videoService.getCatalog(1);

    } else {
      this.searchString = searchString;

      var searchArray = this.searchString
          .split(' ')
          .map(t => t.trim())
          .filter(t => t.length > 0);
  
      this.imageCatalog = (await this.videoService.searchImages(searchArray)).reverse();
      this.comicCatalog = (await this.videoService.searchComics(searchArray)).reverse();
      
      this.catalog = await this.videoService.search(searchArray);

      if(this.catalog.length > 0){
        this.catalog.forEach(c => {
          var thumbnail = this.videoService.getThumbnailUrl(c.id);
          this.thumbnails.push(thumbnail);
        });
      }

      this.shortsCatalog = await this.videoService.searchShorts(searchArray);

      if(this.shortsCatalog.length > 0){
        this.shortsCatalog.forEach(c => {
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
    } else if (this.imageCatalog.length == 0 && this.shortsCatalog.length > 0){
      this.isVideo = false;
      this.isShorts = true;
    }
  }

  ngOnDestroy() {
    document.body.style.overflow = ''; // Restore scroll on destroy
    this.routerSub?.unsubscribe();
  }

  async goToVideoPage(page: number) {
    if (page === -1 || page === this.currentPageVideo) return;

    this.currentPageVideo = page;
    this.updateAllVisiblePageNumbers();

    this.catalog = await this.videoService.loadLatest(page);

    this.thumbnails = this.catalog.map(c => this.videoService.getThumbnailUrl(c.id));
  }

  async goToShortsPage(page: number) {
    if (page === -1 || page === this.currentPageShorts) return;

    this.currentPageShorts = page;
    this.updateAllVisiblePageNumbers();

    this.shortsCatalog = await this.videoService.loadLatestShorts(page);

    this.thumbnails = this.catalog.map(c => this.videoService.getThumbnailUrl(c.id));
  }

  async goToImagePage(page: number) {
    if (page === -1 || page === this.currentPageImage) return;

    this.currentPageImage = page;
    this.updateAllVisiblePageNumbers();

    this.imageCatalog = await this.videoService.loadLatestImages(page);
  }

  async goToComicPage(page: number) {
    if (page === -1 || page === this.currentPageComic) return;

    this.currentPageComic = page;
    this.updateAllVisiblePageNumbers();

    this.comicCatalog = await this.videoService.getCatalog(page);
  }

  updateAllVisiblePageNumbers() {
    this.visiblePageNumbersVideo = this.getVisiblePages(this.videoPages.length, this.currentPageVideo);
    this.visiblePageNumbersImage = this.getVisiblePages(this.imagePages.length, this.currentPageImage);
    this.visiblePageNumbersComic = this.getVisiblePages(this.comicPages.length, this.currentPageComic);
    this.visiblePageNumbersShorts = this.getVisiblePages(this.shortsPages.length, this.currentPageShorts);
  }

  private getVisiblePages(totalPages: number, currentPage: number): number[] {
    if (totalPages <= 10) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const range: number[] = [];
    range.push(1);

    if (currentPage > 4) {
      range.push(-1); // -1 represents "..."
    }

    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (currentPage < totalPages - 3) {
      range.push(-1); // -1 represents "..."
    }

    range.push(totalPages);

    return range;
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
      this.isShorts = false;
    } else if (view == "comics") {
      this.isVideo = false;
      this.isImages = false;
      this.isComic = true;
      this.isShorts = false;
    } else if (view == "shorts") {
      this.isVideo = false;
      this.isImages = false;
      this.isComic = false;
      this.isShorts = true;
    } else {
      this.isComic = false;
      this.isImages = false;
      this.isVideo = true;
      this.isShorts = false;
    }
  }

  getImage(iamgeId: string){
    return this.videoService.getImageUrl(iamgeId);
  }

  getVideo(videoId: string){
    return this.videoService.getVideoUrl(videoId) + `?cb=${Date.now()}`;
  }

  openImage(index: number): void {
    this.selectedImageIndex = index;
    document.body.style.overflow = 'hidden';
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
    document.body.style.overflow = '';
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
}
