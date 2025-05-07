import { Component } from '@angular/core';
import { FileServiceService } from '../../Services/file-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  input: string;
  
  constructor(private router: Router){

  }

  search(){
    window.location.href = "search/" + this.input;
  }

  logOut(){
    sessionStorage.clear();
    location.reload();
  }

}
