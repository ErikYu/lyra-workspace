# ngx-datasheet
A web-canvas-rxjs-angular-based spreadsheet.

## DEMO
[erikyu.github.io/ngx-datasheet/](https://erikyu.github.io/ngx-datasheet/)

## Usage
- `npm install --save @angular/cdk ngx-datasheet`
- add `@import url("~ngx-datasheet/style.css");` on your `src/styles.css`
- import `NgxDatasheetModule` to your AppModule
  ```ts
  @NgModule({
    declarations: [
      AppComponent
    ],
    imports: [
      BrowserModule,
      NgxDatasheetModule,  // import module
    ],
    providers: [],
    bootstrap: [AppComponent]
  })
  ```
- simple example
  ```angular2html
  <nd-ngx-datasheet [ndData]="data" (ndDataChange)="onChange($event)"></nd-ngx-datasheet>
  ```
  
## Development
Suggest yarn when develop
- `yarn install`
- `yarn start`
