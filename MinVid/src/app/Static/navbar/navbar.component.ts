import { Component } from '@angular/core';
import { FileServiceService } from '../../Services/file-service.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  input: string;
  
  constructor(private router: Router, private route: ActivatedRoute){

  }

  search(){
    if(this.input == undefined || this.input == "" || this.input == " ") {
      window.location.href = "search/all";
    } else {
      window.location.href = "search/" + this.input;
    }
  }

  navigate(url: string){
    var path = window.location.pathname.split("/");
    console.log(path, url)
    if(url.includes(path[1])){
      window.location.href = url;
    } else {
      this.router.navigateByUrl(url)
    }
  }

}
