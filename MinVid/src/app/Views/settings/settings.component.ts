import { Component } from '@angular/core';
import { FileServiceService } from '../../Services/file-service.service';
import { PasswordChangeObject } from '../../Models/passwordChangeObject';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

  scanning = false;
  result: number;
  currentPw: string = "";
  newPw: string = "";
  newPwAgain: string = "";

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

  async changePassword(){
    if(this.newPw != this.newPwAgain){
      alert("The new passwords doesn't match!")
    } else {
      var pwObj = new PasswordChangeObject();
      pwObj.currentPw = this.currentPw;
      pwObj.newPw = this.newPw;
      var res = await this.videoService.changePassword(pwObj);
      if(res){
        alert("Password sucessfully changed, logging out!")
        this.logOut();
      } else {
        alert("The current password you entered was incorrect");
      }
    }
  }

  logOut(){
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
  }
}
