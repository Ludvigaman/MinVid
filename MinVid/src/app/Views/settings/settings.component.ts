import { Component, OnInit } from '@angular/core';
import { FileServiceService } from '../../Services/file-service.service';
import { PasswordChangeObject } from '../../Models/passwordChangeObject';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {

  scanning = false;
  result: number;
  currentPw: string = "";
  newPw: string = "";
  newPwAgain: string = "";

  unrestricted = false;

  constructor(private videoService: FileServiceService){
    
  }

  ngOnInit(): void {
    if(localStorage.getItem("unrestricted") == "true"){
      this.unrestricted = true;
    }
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

  async showAll(){
    localStorage.setItem("unrestricted", "true");
    this.unrestricted = true;
  }

  async hideAll(){
    localStorage.removeItem("unrestricted");
    this.unrestricted = false;
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
