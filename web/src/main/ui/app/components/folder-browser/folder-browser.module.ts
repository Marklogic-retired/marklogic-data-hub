import {NgModule} from "@angular/core";
import {FolderBrowserUiComponent} from "./ui";
import {FolderBrowserComponent} from "./folder-browser.component";
import {CommonModule} from "@angular/common";
import {MdlModule} from "@angular-mdl/core";
import {MaterialModule} from "../theme/material.module";

@NgModule({
  declarations: [
    FolderBrowserUiComponent,
    FolderBrowserComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    MdlModule
  ],
  exports: [
    FolderBrowserComponent
  ]
})
export class FolderBrowserModule {
}
