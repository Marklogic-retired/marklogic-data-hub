/* tslint:disable */
import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, TemplateRef
} from '@angular/core';

import { positionService } from './position';
import { TooltipOptions } from './tooltip-options.class';

@Component({
  selector: 'tooltip-container',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="tooltip" role="tooltip"
     [ngStyle]="{top: top, left: left, display: display}"
     [ngClass]="classMap">
      <div class="tooltip-arrow"></div>
      <div class="tooltip-inner"
           *ngIf="htmlContent && !isTemplate"
           innerHtml="{{htmlContent}}">
      </div>
      <div class="tooltip-inner"
           *ngIf="htmlContent && isTemplate">
        <ng-template [ngTemplateOutlet]="htmlContent"
                  [ngTemplateOutletContext]="{model: context}">
        </ng-template>
      </div>
      <div class="tooltip-inner"
           *ngIf="content">
        {{content}}
      </div>
    </div>`
})
export class TooltipContainerComponent implements AfterViewInit {
  public classMap:any;
  public top:string = '-1000px';
  public left:string = '-1000px';
  public display:string = 'block';
  public content:string;
  public htmlContent:string | TemplateRef<any>;
  private placement:string;
  private popupClass:string;
  private animation:boolean;
  private isOpen:boolean;
  private appendToBody:boolean = true;
  private hostEl:ElementRef;
  private context:any;

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
        this.element.nativeElement.children[0],
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
