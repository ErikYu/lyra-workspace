# NgxDatasheet

This library was generated with [Angular CLI](https://github.com/angular/angular-cli)

### Usage
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
  <nd-ngx-datasheet></nd-ngx-datasheet>
  ```
