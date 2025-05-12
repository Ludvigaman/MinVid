import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Guid } from 'guid-typescript';
import { VideoMetadata } from '../../Models/videoMetadata';
import { ConfigServiceService } from '../../Services/config-service.service';
import { FileServiceService } from '../../Services/file-service.service';

@Component({
  selector: 'app-upload-page',
  standalone: false,
  templateUrl: './upload-page.component.html',
  styleUrl: './upload-page.component.scss'
})
export class UploadPageComponent {

  title: string = '';
  description: string = '';
  tagsString: string = '';
  selectedFile: File | null = null;
  isUploading = false

  _url: string;

  constructor(private http: HttpClient, private config: ConfigServiceService, private videoService: FileServiceService){
    this.config.getConfig().subscribe(config => {
      this._url = config.API_URL;
    })
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }
  
  async upload() {
    if (!this.selectedFile) {
      alert('Please select a video file.');
      return;
    } else if(this.title == "" || this.title == undefined) {
      alert('Please enter a title.');
      return;
    } else if(this.description == "" || this.description == undefined){
      alert('Please enter a description.');
      return;
    } else if(this.tagsString == "" || this.tagsString == undefined){
      alert('Please enter at least one tag.');
      return;
    }

    var metadata: VideoMetadata = {
      id: 'no-id',
      title: this.title,
      description: this.description,
      uploadDate: new Date(),
      tags: this.tagsString.split(',').map(t => t.trim()),
      format: this.selectedFile.name.split('.').pop() || 'mp4'
    };

    const formData = new FormData();
    formData.append('videoFile', this.selectedFile);
    formData.append('metadataJson', JSON.stringify(metadata));

    this.isUploading = true;
    var res = await this.videoService.uploadVideo(formData)
    console.log('Upload success', res);
    window.location.href = "/video/" + res.id;
  }

}
