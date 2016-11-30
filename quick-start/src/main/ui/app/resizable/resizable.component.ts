import {ElementRef, EventEmitter, HostBinding, Input, Component, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-resizable',
  styleUrls: ['./resizable.component.scss'],
  template: `
    <ng-content></ng-content>
    <div class=grabber [ngClass]='dir' *ngFor='let dir of directions' (mousedown)='onResizeStart($event, dir)'></div>
  `
})
export class ResizableComponent implements OnInit {
  @Input() directions: Array<String>;

  private direction: String;
  private start: number;
  @HostBinding('style.width.px') width: number;
  @HostBinding('style.height.px') height: number;
  @Output() sizeChange: EventEmitter<any> = new EventEmitter();

  private startWidth: number;
  private startHeight: number;

  onMousemove = (event: MouseEvent) => {
    if (this.direction) {
      let offset = this.isHorizontalResize(this.direction) ? this.start - this.getClientX(event) : this.start - this.getClientY(event);
      switch (this.direction) {
        case 'bottom':
          this.height = this.startHeight - offset;
          break;
        case 'left':
          this.width = this.startWidth + offset;
          break;
        case 'right':
          this.width = this.startWidth - offset;
          break;
      }
      this.sizeChange.emit({width: this.width, height: this.height});
    }
  }

  onMouseup = (event: MouseEvent) => {
    if (this.direction) {
      this.direction = null;
      this.start = 0;
    }

    window.removeEventListener('mousemove', this.onMousemove);
    window.removeEventListener('mouseup', this.onMouseup);
    window.removeEventListener('mouseleave', this.onMouseup);
  }

  constructor(private element: ElementRef) {}

  ngOnInit() {}

  onResizeStart(event: MouseEvent, direction: String) {
    this.direction = direction;
    this.start = this.isHorizontalResize(this.direction) ? this.getClientX(event) : this.getClientY(event);
    this.startWidth = this.element.nativeElement.clientWidth;
    this.startHeight = this.element.nativeElement.clientHeight;

    if (event.stopPropagation) {
      event.stopPropagation();
    }
    if (event.preventDefault) {
      event.preventDefault();
    }
    event.cancelBubble = true;
    event.returnValue = false;

    window.addEventListener('mousemove', this.onMousemove);
    window.addEventListener('mouseup', this.onMouseup);
    window.addEventListener('mouseleave', this.onMouseup);
  }

  private isHorizontalResize(direction: String) {
    return direction === 'left' || direction === 'right';
  }

  private getClientX(event: MouseEvent | TouchEvent) {
    if (event instanceof TouchEvent) {
      return (<TouchEvent>event).touches[0].clientX;
    }

    return (<MouseEvent>event).clientX;
  }

  private getClientY(event: MouseEvent | TouchEvent) {
    if (event instanceof TouchEvent) {
      return (<TouchEvent>event).touches[0].clientY;
    }

    return (<MouseEvent>event).clientY;
  }

}
