import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  input: string = '';

  constructor(private router: Router, private route: ActivatedRoute){}

  search(){
    const value = this.input?.trim();

    if(!value){
      this.router.navigate(['/search', 'all']);
    } else {
      this.router.navigate(['/search', value]);
    }
  }

  navigate(url: string){
    if (this.router.url === '/' + url) {
      return;
    }
    this.router.navigateByUrl(url);
  }
}