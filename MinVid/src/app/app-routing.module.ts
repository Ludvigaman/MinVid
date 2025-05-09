import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrontPageComponent } from './Views/front-page/front-page.component';
import { UploadPageComponent } from './Views/upload-page/upload-page.component';
import { VideoPageComponent } from './Views/video-page/video-page.component';
import { TagPageComponent } from './Views/tag-page/tag-page.component';
import { SearchPageComponent } from './Views/search-page/search-page.component';
import { SettingsComponent } from './Views/settings/settings.component';

const routes: Routes = [
  {path: "", component: FrontPageComponent},
  {path: "upload", component: UploadPageComponent},
  {path: "video/:videoId", component: VideoPageComponent},
  {path: "tags/:tag", component: TagPageComponent},
  {path: "search/:searchString", component: SearchPageComponent},
  {path: "settings", component: SettingsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
