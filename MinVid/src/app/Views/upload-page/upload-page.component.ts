import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Guid } from 'guid-typescript';
import { VideoMetadata } from '../../Models/videoMetadata';
import { ConfigServiceService } from '../../Services/config-service.service';
import { FileServiceService } from '../../Services/file-service.service';
import { ImageMetadata } from '../../Models/imageMetadata';
import { Comic } from '../../Models/comic';

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
  selectedFiles: File[] = [];

  isUploading = false
  isUploadingImage = false;

  comicTitle: string = '';
  comicDescription: string = '';
  comicArtist: string = '';
  selectedComicZipFile: File | null = null;
  isUploadingComic = false;
  
  isShort: boolean;
  isVideo = true;
  isComic = false;
  isImage = false;

  _url: string;

  constructor(private http: HttpClient, private config: ConfigServiceService, private videoService: FileServiceService){
    this.config.getConfig().subscribe(config => {
      this._url = config.API_URL;
    })
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    if (input.files.length === 1) {
      const file = input.files[0];
      this.selectedFile = file;
    } else {
      const files = Array.from(input.files);
      this.selectedFiles = files;
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
      format: this.selectedFile.name.split('.').pop() || 'mp4',
      duration: 0,
      isShort: this.isShort
    };

    console.log(metadata);

    const formData = new FormData();
    formData.append('videoFile', this.selectedFile);
    formData.append('metadataJson', JSON.stringify(metadata));

    this.isUploading = true;
    var res = await this.videoService.uploadVideo(formData)
    console.log('Upload success', res);

    if(this.isShort == false || this.isShort == undefined){
      var goTo = confirm("Upload sucessful, go to video?")
      if(goTo){
        window.location.href = "/video/" + res.id;
      } 
    }

    if(this.isShort == true){
      console.log('Upload success', res);
      alert("Upload sucessful!")
    }

    this.isUploading = false;
    this.selectedFile = null;
  }

  switchMode(mode: string){
    this.selectedFile = null;
    this.title = "";
    this.description = "";
    this.tagsString = "";

    if(mode == "image") {
      this.isVideo = false;
      this.isComic = false;
      this.isImage = true;
    } else if (mode == "comics") {
      this.isVideo = false;
      this.isImage = false;
      this.isComic = true;
    } else {
      this.isComic = false;
      this.isImage = false;
      this.isVideo = true;
    }
  }

  async uploadImage() {
    const files: File[] =
      this.selectedFiles.length > 0
        ? this.selectedFiles
        : this.selectedFile
          ? [this.selectedFile]
          : [];

    if (files.length === 0) {
      alert('Please select an image file.');
      return;
    }

    if (!this.tagsString) {
      alert('Please enter at least one tag.');
      return;
    }

    this.isUploadingImage = true;

    try {
      for (const file of files) {
        const metadata: ImageMetadata = {
          id: 'no-id',
          tags: this.tagsString.split(',').map(t => t.trim()),
          format: file.name.split('.').pop() || 'jpg'
        };

        const formData = new FormData();
        formData.append('imageFile', file);
        formData.append('metadataJson', JSON.stringify(metadata));

        const res = await this.videoService.uploadImage(formData);
        console.log('Upload success:', file.name, res);
      }

      alert('Upload successful!');
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed.');
    } finally {
      this.isUploadingImage = false;
      this.selectedFile = null;
      this.selectedFiles = [];
    }
  }


  onComicZipSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedComicZipFile = input.files[0];
    }
  }

  async uploadComicZip(): Promise<void> {
    if (!this.selectedComicZipFile || !this.comicTitle || !this.comicArtist) {
      alert("Please fill out all fields and select a zip file.");
      return;
    }

    const tags = this.tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    const metadata = new Comic(
      '', // ID is assigned server-side
      this.comicTitle,
      this.comicDescription,
      this.comicArtist,
      0, // numberOfPages is determined by server
      tags
    );

    this.isUploadingComic = true;

    try {
      const formData = new FormData();
      formData.append("metadataJson", JSON.stringify(metadata));
      formData.append("zipFile", this.selectedComicZipFile);

      const result = await this.videoService.uploadComicZip(metadata, this.selectedComicZipFile);
      console.log("Comic uploaded successfully. ID:", result);
      var goTo = confirm("Upload sucessful, go to comic?")
      if(goTo){
        window.location.href = "/comic/" + result;
      } 
    } catch (error) {
      console.error("Error uploading comic:", error);
    } finally {
      this.isUploadingComic = false;
    }
  }

  


}
