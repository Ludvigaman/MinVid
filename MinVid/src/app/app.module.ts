import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FrontPageComponent } from './Views/front-page/front-page.component';
import { VideoPageComponent } from './Views/video-page/video-page.component';
import { NavbarComponent } from './Static/navbar/navbar.component';
import { FooterComponent } from './Static/footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { UploadPageComponent } from './Views/upload-page/upload-page.component';
import { TagPageComponent } from './Views/tag-page/tag-page.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchPageComponent } from './Views/search-page/search-page.component';
import { SettingsComponent } from './Views/settings/settings.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EditComponent } from './Views/video-page/edit/edit.component';
import { ComicPageComponent } from './Views/comic-page/comic-page.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';


@NgModule({
  declarations: [
    AppComponent,
    FrontPageComponent,
    VideoPageComponent,
    NavbarComponent,
    FooterComponent,
    UploadPageComponent,
    TagPageComponent,
    SearchPageComponent,
    SettingsComponent,
    EditComponent,
    ComicPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    HttpClientModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatChipsModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

