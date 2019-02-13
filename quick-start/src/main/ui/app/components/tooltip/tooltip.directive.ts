/* tslint:disable */
import {
  ApplicationRef, ComponentRef, Directive, HostListener, Injector, Input, ReflectiveInjector, TemplateRef, ViewContainerRef
} from '@angular/core';

import { TooltipContainerComponent } from './tooltip-container.component';
import { TooltipOptions } from './tooltip-options.class';
import { ComponentsHelper } from './components-helper.service';

@Directive({selector: '[tooltip], [tooltipHtml]'})
export class TooltipDirective {
  @Input('tooltip') public content:string;
  @Input('tooltipHtml') public htmlContent:string | TemplateRef<any>;
  @Input('tooltipPlacement') public placement:string = 'right';
  @Input('tooltipIsOpen') public isOpen:boolean;
  @Input('tooltipEnable') public enable:boolean = true;
  @Input('tooltipAnimation') public animation:boolean = true;
  @Input('tooltipAppendToBody') public appendToBody:boolean;
  @Input('tooltipClass') public popupClass:string;
  @Input('tooltipContext') public tooltipContext:any;

  public viewContainerRef:ViewContainerRef;
  public componentsHelper:ComponentsHelper;
  private appVcRef: ViewContainerRef;

  private visible:boolean = false;
  private tooltip:ComponentRef<any>;

  public constructor(
    viewContainerRef:ViewContainerRef,
    private app: ApplicationRef,
    componentsHelper:ComponentsHelper,
    injector: Injector) {

    this.viewContainerRef = viewContainerRef;
    this.componentsHelper = componentsHelper;
    this.appVcRef = injector.get(app.componentTypes[0]).vcRef;

  }

  // todo: filter triggers
  // params: event, target
  @HostListener('focusin', ['$event', '$target'])
  @HostListener('mouseenter', ['$event', '$target'])
  public show():void {
    if (this.visible || !this.enable) {
      return;
    }
    this.visible = true;
    let options = new TooltipOptions({
      content: this.content,
      htmlContent: this.htmlContent,
      placement: this.placement,
      animation: this.animation,
      hostEl: this.viewContainerRef.element,
      popupClass: this.popupClass,
      context: this.tooltipContext
    });

    let binding = ReflectiveInjector.resolve([
      {provide: TooltipOptions, useValue: options}
    ]);

    this.tooltip = this.componentsHelper
      .appendNextToLocation(TooltipContainerComponent, this.appVcRef, binding);
  }

  // params event, target
  @HostListener('focusout', ['$event', '$target'])
  @HostListener('mouseleave', ['$event', '$target'])
  public hide():void {
    if (!this.visible) {
      return;
    }
    this.visible = false;
    this.tooltip.destroy();
  }
}
/* tslint:enable */
