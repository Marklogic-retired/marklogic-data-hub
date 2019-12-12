import {NgModule} from '@angular/core';
import {ThemeComponent} from './theme.component';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {MdlModule} from '@angular-mdl/core';
import {MdlPopoverModule} from '@angular-mdl/popover';
import {MdlSelectModule} from '@angular-mdl/select';
import {BsDropdownModule, TooltipModule, PopoverModule} from 'ngx-bootstrap';
import {MaterialModule} from './material.module';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        MdlModule,
        MdlPopoverModule,
        MdlSelectModule,
        BsDropdownModule.forRoot(),
        TooltipModule.forRoot(),
        PopoverModule.forRoot(),
        MaterialModule
    ],
    declarations: [ThemeComponent],
    exports: [
        ThemeComponent,
        BrowserModule,
        FormsModule,
        MdlModule,
        MdlPopoverModule,
        MdlSelectModule,
        BsDropdownModule,
        TooltipModule,
        PopoverModule,
        MaterialModule
    ]
})
export class ThemeModule {
}
