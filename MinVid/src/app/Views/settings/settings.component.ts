import { Component } from '@angular/core';
import { FileServiceService } from '../../Services/file-service.service';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

  scanning = false;
  result: number;

  constructor(private videoService: FileServiceService){
    
  }

  async scan(){
    console.log("Library scan triggered...")
    this.scanning = true;
    var result = await this.videoService.scanLibrary();
    if(result.length >= 0){
      this.result = result.length;
    }
    console.log(result)
    this.scanning = false;
  }

  logOut(){
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
  }
}
