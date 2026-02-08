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
  loading = false;
  password = "";
  rememberLogin = false;

  constructor(private videoService: FileServiceService){}

  async ngOnInit(){
    var sessionPW = sessionStorage.getItem("login");
    if(sessionPW != null){
      var sessionRes = await this.videoService.login(sessionPW);
      if(sessionRes){
        this.isLoggedin = true;
      } else {
        this.isLoggedin = false;
      }
    }

    var localPW = localStorage.getItem("login");
    if(localPW != null){
      var localRes = await this.videoService.login(localPW);
      if(localRes){
        this.isLoggedin = true;
      } else {
        this.isLoggedin = false;
      }
    }
  }

  async login(){
    this.pwFailed = false;
    this.loading = true;
    var res = await this.videoService.login(this.password);
    this.loading = false;

    if(res == true){
      if(this.rememberLogin){
        localStorage.setItem("login", this.password);
      } else {
        sessionStorage.setItem("login", this.password);
      }
      this.isLoggedin = true;
    } else {
      sessionStorage.clear();
      this.pwFailed = true;
      this.isLoggedin = false;
    }
  }
}
