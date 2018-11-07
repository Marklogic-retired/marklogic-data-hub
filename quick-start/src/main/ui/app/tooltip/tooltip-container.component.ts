/* tslint:disable */
import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, TemplateRef
} from '@angular/core';

import { positionService } from './position';
import { TooltipOptions } from './tooltip-options.class';

@Component({
  selector: 'tooltip-container',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <app-tooltip-container-ui
    [isTemplate]="isTemplate"
    [classMap]="classMap"
    [top]="top"
    [left]="left"
    [display]="display"
    [context]="context"
    [content]="content"
    [htmlContent]="htmlContent"
  ></app-tooltip-container-ui>`
})
export class TooltipContainerComponent implements AfterViewInit {
  public classMap:any;
  public top:string = '-1000px';
  public left:string = '-1000px';
  public display:string = 'block';
  public content:string;
  public htmlContent:string | TemplateRef<any>;
  public context:any;
  private placement:string;
  private popupClass:string;
  private animation:boolean;
  private isOpen:boolean;
  private appendToBody:boolean = true;
  private hostEl:ElementRef;

  private element:ElementRef;
  private cdr:ChangeDetectorRef;

  public constructor(element:ElementRef,
                     cdr:ChangeDetectorRef,
                     @Inject(TooltipOptions) options:TooltipOptions) {
    this.element = element;
    this.cdr = cdr;
    Object.assign(this, options);
    this.classMap = {'in': false, 'fade': false};
    this.classMap[options.placement] = true;
    this.classMap['tooltip-' + options.placement] = true;
  }

  public ngAfterViewInit():void {
    let p = positionService
      .positionElements(
        this.hostEl.nativeElement,
        this.element.nativeElement.children[0].children[0],
        this.placement, this.appendToBody);
    this.top = p.top + 'px';
    this.left = p.left + 'px';
    this.classMap.in = true;
    if (this.animation) {
      this.classMap.fade = true;
    }

    if (this.popupClass) {
      this.classMap[this.popupClass] = true;
    }

    this.cdr.detectChanges();
  }

  public get isTemplate():boolean {
    return this.htmlContent instanceof TemplateRef;
  }
}
/* tslint:enable */
