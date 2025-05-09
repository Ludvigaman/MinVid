import { Component, OnInit } from '@angular/core';
import { FileServiceService } from './Services/file-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'MinVid';
  isLoggedin = false;
  pwFailed = false;
  password = "";

  constructor(private videoService: FileServiceService){

  }

  async ngOnInit(){
    var pw = sessionStorage.getItem("login");
    if(pw != null){
      var res = await this.videoService.login(pw);
      if(res){
        this.isLoggedin = true;
      } else {
        this.isLoggedin = false;
      }
    }
  }

  async login(){
    this.pwFailed = false;
    var res = await this.videoService.login(this.password);
    console.log(res);
    if(res == true){
      sessionStorage.setItem("login", this.password);
      this.isLoggedin = true;
    } else {
      sessionStorage.clear();
      localStorage.clear();
      this.pwFailed = true;
      this.isLoggedin = false;
    }
  }
}
