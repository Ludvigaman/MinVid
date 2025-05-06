import { Component } from '@angular/core';
import { AuthServiceService } from '../../Services/auth-service.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  _authService: AuthServiceService

  constructor(authService: AuthServiceService){
    this._authService = authService;
  }

  logOut(){
    this._authService.logOut();
  }

}
