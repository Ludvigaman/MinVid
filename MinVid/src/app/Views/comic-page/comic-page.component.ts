import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FileServiceService } from '../../Services/file-service.service';
import { Comic } from '../../Models/comic';

@Component({
  selector: 'app-comic-page',
  standalone: false,
  templateUrl: './comic-page.component.html',
  styleUrl: './comic-page.component.scss'
})
export class ComicPageComponent implements OnInit {

  comicMetadata: Comic;
  pageArray: number[] = [];
  isReaderOpen = false;
  currentPageIndex = 0;
  
  selectedImageUrl: string | null = null;


  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isReaderOpen) {
      this.closeReader();
    }

    if(this.selectedImageUrl != null){
      this.closeImageFullscreen();
    }
  }

  constructor(private comicService: FileServiceService, private route: ActivatedRoute, private router: Router, private dialog: MatDialog){

  }

  async ngOnInit() {
    const comicId = this.route.snapshot.paramMap.get('comicId') || ''; 

    this.comicService.getComicMetadata(comicId).then(data => {
      this.comicMetadata = data;
      const numPages = (data as any).numberOfPages;
      for (let i = 1; i <= numPages; i++) {
        this.pageArray.push(i);
      }
    });
  }

  async delete(){
    var res = confirm("Are you sure you want to delete this comic?");
    if(res){
      var res = await this.comicService.deleteComic(this.comicMetadata.id);
      if(res){ 
        alert("Comic deleted...")
      } else {
        alert("Something went wrong...")
      }
    }
  }

  getPageImageUrl(page: number){
    var url = this.comicService.getPageImageUrl(this.comicMetadata.id, page);
    return url;
  }

  openReader(index: number = 0) {
    this.isReaderOpen = true;
    this.currentPageIndex = index;

    // Scroll to the specified page after view is rendered
    setTimeout(() => {
      const pageElements = document.querySelectorAll('.readerPage');
      if (pageElements[this.currentPageIndex]) {
        pageElements[this.currentPageIndex].scrollIntoView({ behavior: 'auto' });
      }
    }, 0);
  }

  onReaderScroll(event: any) {
    const reader = event.target as HTMLElement;
    const children = Array.from(reader.querySelectorAll('.readerPage')) as HTMLElement[];

    const scrollTop = reader.scrollTop;
    let closest = 0;
    let minDiff = Number.MAX_VALUE;

    children.forEach((child, index) => {
      const diff = Math.abs(child.offsetTop - scrollTop);
      if (diff < minDiff) {
        minDiff = diff;
        closest = index;
      }
    });

    this.currentPageIndex = closest;
  }

  
  openImageFullscreen(index: number) {
    this.selectedImageUrl = this.getPageImageUrl(index);
  }

  closeImageFullscreen() {
    this.selectedImageUrl = null;
  }

  closeReader() {
    this.isReaderOpen = false;
  }

  capitalize(input: string){
    if (!input) return '';
    return input.toLowerCase().charAt(0).toUpperCase() + input.toLowerCase().slice(1);
  }

}
