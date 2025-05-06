import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrontPageComponent } from './Views/front-page/front-page.component';
import { LoginPageComponent } from './Views/login-page/login-page.component';
import { UploadPageComponent } from './Views/upload-page/upload-page.component';
import { VideoPageComponent } from './Views/video-page/video-page.component';

const routes: Routes = [
  {path: "", component: FrontPageComponent},
  {path: "login", component: LoginPageComponent},
  {path: "upload", component: UploadPageComponent},
  {path: "video/:videoId", component: VideoPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
