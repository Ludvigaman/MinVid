import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { VideoMetadata } from '../../Models/videoMetadata';
import { ActivatedRoute } from '@angular/router'; // To get the videoId from route params
import { FileServiceService } from '../../Services/file-service.service';

@Component({
  selector: 'app-video-page',
  standalone: false,
  templateUrl: './video-page.component.html',
  styleUrl: './video-page.component.scss'
})
export class VideoPageComponent implements OnInit {
  @ViewChild('videoPlayer') videoplayer: ElementRef;

  paused = false;
  videoMetadata: VideoMetadata;
  videoUrl: string;
  videoThumbnailUrl: string;
  videoFormat: string;

  videoLoaded = false;

  constructor(private videoService: FileServiceService, private route: ActivatedRoute){

  }

  ngOnInit(){
    const videoId = this.route.snapshot.paramMap.get('videoId') || ''; 

    if (videoId) {
      this.videoService.getVideoMetadata(videoId).subscribe((videoData: VideoMetadata) => {
        this.videoMetadata = videoData; // Set the video metadata
        this.videoThumbnailUrl = this.videoService.getThumbnailUrl(videoId);
        this.videoFormat = "video/" + this.videoMetadata.format;
        this.videoUrl = this.videoService.getVideoUrl(videoId) + `?cb=${Date.now()}`;
        this.videoLoaded = true;
      });
    }  
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

  capitalize(input: string){
    if (!input) return '';
    return input.charAt(0).toUpperCase() + input.slice(1);
  }
}
