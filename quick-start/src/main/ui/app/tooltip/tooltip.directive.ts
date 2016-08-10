import {
  Directive, Input, HostListener, DynamicComponentLoader,
  ApplicationRef, Injector, ElementRef,
  ComponentRef, Provider, ReflectiveInjector, ViewContainerRef, TemplateRef
} from '@angular/core';
import {TooltipOptions} from './tooltip-options.class';
import {TooltipContainerComponent} from './tooltip-container.component';

/* tslint:disable */
@Directive({selector: '[tooltip], [tooltipHtml]'})
/* tslint:enable */
export class TooltipDirective {
  /* tslint:disable */
  @Input('tooltip') public content:string;
  @Input('tooltipHtml') public htmlContent:string | TemplateRef<any>;
  @Input('tooltipPlacement') public placement:string = 'right';
  @Input('tooltipIsOpen') public isOpen:boolean;
  @Input('tooltipEnable') public enable:boolean = true;
  @Input('tooltipAnimation') public animation:boolean = true;
  @Input('tooltipAppendToBody') public appendToBody:boolean;
  @Input('tooltipClass') public popupClass:string;
  @Input('tooltipContext') public tooltipContext:any;
  /* tslint:enable */

  public viewContainerRef:ViewContainerRef;
  public loader:DynamicComponentLoader;
  private appVcRef: ViewContainerRef;

  private visible:boolean = false;
  private tooltip:Promise<ComponentRef<any>>;

  public constructor(
    viewContainerRef:ViewContainerRef,
    loader:DynamicComponentLoader,
    private app:ApplicationRef,
    injector: Injector) {
    this.viewContainerRef = viewContainerRef;
    this.loader = loader;
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
      new Provider(TooltipOptions, {useValue: options})
    ]);

    this.tooltip = this.loader
      .loadNextToLocation(TooltipContainerComponent, this.appVcRef, binding)
      .then((componentRef:ComponentRef<any>) => {
        return componentRef;
      });
  }

  // params event, target
  @HostListener('focusout', ['$event', '$target'])
  @HostListener('mouseleave', ['$event', '$target'])
  public hide():void {
    if (!this.visible) {
      return;
    }
    this.visible = false;
    this.tooltip.then((componentRef:ComponentRef<any>) => {
      componentRef.destroy();
      return componentRef;
    });
  }
}
