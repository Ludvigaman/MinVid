import { Component, Inject } from '@angular/core';
import { VideoMetadata } from '../../../Models/videoMetadata';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VideoPageComponent } from '../video-page.component';
import { FileServiceService } from '../../../Services/file-service.service';

@Component({
  selector: 'app-edit',
  standalone: false,
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent {

  title: string;
  description: string;
  tags: string[];
  tagString: string;
  newVideoMetadata: VideoMetadata;
  selectedFile: File | null = null;
  
  constructor(public dialogRef: MatDialogRef<VideoPageComponent>, @Inject(MAT_DIALOG_DATA) public data: VideoMetadata, private videoService: FileServiceService) 
  { 
    this.newVideoMetadata = data;
    this.title = data.title;
    this.description = data.description;
    this.tags = data.tags;
    this.tagString = this.tags.join(", ");
  }

  onNoClick() {
    this.dialogRef.close();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async saveThumbnail(){
    if(this.selectedFile){
      var ok = confirm("Are you sure you want to overwrite / upload this thumbnail?")
      if(ok){
        const formData = new FormData();
        formData.append('thumbnail', this.selectedFile);

        var res = await this.videoService.uploadThumbnail(formData, this.newVideoMetadata.id);
        if(res){
          alert("Thumbnail uploaded sucessfully!")
        } else {
          alert("Something went wrong...");
        }
      }
    } else {
      alert("No file selected...")
    }
  }

  submit() {
    
    if(this.title == "" || this.title == undefined) {
      alert('Please enter a title.');
      return;
    } else if(this.description == "" || this.description == undefined){
      alert('Please enter a description.');
      return;
    } else if(this.tagString == "" || this.tagString == undefined){
      alert('Please enter at least one tag.');
      return;
    }

    this.newVideoMetadata.title = this.title;
    this.newVideoMetadata.description = this.description;
    this.newVideoMetadata.tags = this.tagString.split(',').map(t => t.trim());

    this.dialogRef.close(this.newVideoMetadata)

  }

}
