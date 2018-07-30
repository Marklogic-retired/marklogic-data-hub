import { Directive, ElementRef, Input } from '@angular/core';
 
@Directive({
  selector: '[focusElement]'
})
export class FocusElementDirective {
 
  constructor(private el: ElementRef) { }

  @Input() focusElement: boolean;

  ngOnChanges(changes) {
    if (changes.focusElement.currentValue) {
      this.el.nativeElement.focus();
    }
  }
 
}