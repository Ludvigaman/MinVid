import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { VideoMetadata } from '../../Models/videoMetadata';
import { ActivatedRoute, Router } from '@angular/router'; // To get the videoId from route params
import { FileServiceService } from '../../Services/file-service.service';
import { MatDialog } from '@angular/material/dialog';
import { EditComponent } from './edit/edit.component';

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

  recommendedVideos: VideoMetadata[];
  recommendedThumbnails: string[];

  unrestricted: boolean = false;

  videoLoaded = false;

  constructor(private videoService: FileServiceService, private route: ActivatedRoute, private router: Router, private dialog: MatDialog){

  }

  async ngOnInit(){
    const videoId = this.route.snapshot.paramMap.get('videoId') || ''; 
    this.unrestricted = (localStorage.getItem("unrestricted") == "true")


    if (videoId) {
      this.videoService.getVideoMetadata(videoId).subscribe((videoData: VideoMetadata) => {
        if(videoData == null){
          window.location.href="/"
        }
        this.videoMetadata = videoData; // Set the video metadata
        this.videoThumbnailUrl = this.videoService.getThumbnailUrl(videoId);
        this.videoFormat = "video/" + this.videoMetadata.format;
        this.videoUrl = this.videoService.getVideoUrl(videoId) + `?cb=${Date.now()}`;
        this.videoLoaded = true;
      });

      this.recommendedVideos = await this.videoService.getRecommended(videoId, this.unrestricted);

      this.recommendedThumbnails = [];
      this.recommendedVideos.forEach(v => {
        var thumb = this.videoService.getThumbnailUrl(v.id);
        this.recommendedThumbnails.push(thumb);
      })
    }  
  }

  async edit(){
    const dialogRef = this.dialog.open(EditComponent, {
      data: this.videoMetadata,
      width: "80%"
    });

    dialogRef.afterClosed().subscribe(async (result: VideoMetadata) => {
      var res = await this.videoService.updateVideoMetadata(result);
      if(res){
        alert("Changes saved sucessfully...");
      } 
    });
  }

  getRecThumbnail(videoId: string){
    return this.recommendedThumbnails.find(t => t.includes(videoId));
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
    return input.toLowerCase().charAt(0).toUpperCase() + input.toLowerCase().slice(1);
  }

  navigate(id: string){
    window.location.href = "/video/" + id;
  }

  async delete(id: string){
    var res = confirm("Are you sure you want to delete this video?");
    if(res){
      var res = await this.videoService.delete(id);
      if(res){
        alert("Video sucessfully deleted...");
        window.location.href="/"
      }
    }
  }
}
