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
  @Input() minWidth: number = 0;
  @Input() minHeight: number = 0;
  private direction: String;
  private startX: number;
  private startY: number;
  @HostBinding('style.width.px') width: number;
  @HostBinding('style.height.px') height: number;
  @Output() sizeChange: EventEmitter<any> = new EventEmitter();

  private startWidth: number;
  private startHeight: number;

  onMousemove = (event: MouseEvent) => {
    if (this.direction) {
      let offsetX = this.startX - this.getClientX(event);
      let offsetY = this.startY - this.getClientY(event);
      switch (this.direction) {
        case 'bottom':
          this.height = this.startHeight - offsetY;
          break;
        case 'left':
          this.width = this.startWidth + offsetX;
          break;
        case 'right':
          this.width = this.startWidth - offsetX;
        case 'bottomRight':
          this.width = this.startWidth - offsetX;
          this.height = this.startHeight - offsetY;
          break;
      }
      if (this.width < this.minWidth) {
        this.width = this.minWidth;
      }

      if (this.height < this.minHeight) {
        this.height = this.minHeight;
      }

      this.sizeChange.emit({ width: this.width, height: this.height });
    }
  }

  onMouseup = (event: MouseEvent) => {
    if (this.direction) {
      this.direction = null;
      this.startX = 0;
      this.startY = 0;
    }

    window.removeEventListener('mousemove', this.onMousemove);
    window.removeEventListener('mouseup', this.onMouseup);
    window.removeEventListener('mouseleave', this.onMouseup);
  }

  constructor(private element: ElementRef) {}

  ngOnInit() {}

  onResizeStart(event: MouseEvent, direction: String) {
    this.direction = direction;
    this.startX = this.getClientX(event);
    this.startY = this.getClientY(event);
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

  private getClientX(event: MouseEvent) {
    return (<MouseEvent>event).clientX;
  }

  private getClientY(event: MouseEvent) {
    return (<MouseEvent>event).clientY;
  }

}
