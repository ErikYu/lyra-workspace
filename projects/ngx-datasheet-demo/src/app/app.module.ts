import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgxDatasheetModule } from '../../../ngx-datasheet/src/lib/ngx-datasheet.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxDatasheetModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
