import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Video } from '../../Models/video';

@Component({
  selector: 'app-video-page',
  standalone: false,
  templateUrl: './video-page.component.html',
  styleUrl: './video-page.component.scss'
})
export class VideoPageComponent implements OnInit {
  @ViewChild('videoPlayer') videoplayer: ElementRef;

  paused = false;
  video: Video;

  constructor(){

  }

  ngOnInit(){
    this.video = new Video("Test", "/assets/videos/af169eb7-0707-453a-a02b-d7e5d2f8eefc.mp4", "Denna videon ør najs!",["TestTag", "AnotherTag"]);
  }

  play() {
    if(this.paused){
      this.videoplayer?.nativeElement.play();
      this.paused = false;
    } else {
      this.videoplayer?.nativeElement.pause();
      this.paused = true;
    }
  }
}
