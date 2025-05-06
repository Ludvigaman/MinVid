import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FrontPageComponent } from './Views/front-page/front-page.component';
import { VideoPageComponent } from './Views/video-page/video-page.component';
import { NavbarComponent } from './Static/navbar/navbar.component';
import { FooterComponent } from './Static/footer/footer.component';
import { LoginPageComponent } from './Views/login-page/login-page.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { UploadPageComponent } from './Views/upload-page/upload-page.component';
import { TagPageComponent } from './Views/tag-page/tag-page.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    FrontPageComponent,
    VideoPageComponent,
    NavbarComponent,
    FooterComponent,
    LoginPageComponent,
    UploadPageComponent,
    TagPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

