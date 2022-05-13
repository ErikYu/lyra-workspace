import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { HttpClientModule } from '@angular/common/http';

import { LyraSheetModule } from '@lyra-sheet/angular';

@NgModule({
  declarations: [AppComponent, NxWelcomeComponent],
  imports: [BrowserModule, HttpClientModule, LyraSheetModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
