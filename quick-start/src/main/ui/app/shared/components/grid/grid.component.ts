import {
  OnInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  Renderer,
} from '@angular/core';

@Component({
  selector: '[gm-grid]',
  template: '<ng-content></ng-content>',
  styleUrls: ['./grid.component.scss']
})
export class GridManiaComponent {}

@Component({
  selector: 'gm-divider,[gm-divider]',
  template: '<ng-content></ng-content>'
})
export class DividerComponent implements OnDestroy, OnInit {
  protected resizing = false;
  protected documentColumnResizeListener: any;
  protected documentColumnResizeEndListener: any;
  protected draggerPosX: number;
  protected draggerPosY: number;
  protected draggerWidth: number;
  protected draggerHeight: number;
  protected previousCursor: any;
  protected horizontal = false;

  protected container: any;
  protected prev: any;
  protected next: any;

  @HostListener('mousedown', ['$event']) onMousedown(event: MouseEvent) {
    if (event.target === this.container && event.button === 0 && !event.ctrlKey) {
      if (this.resizing) {
        this.onMouseUp(event);
        return;
      }

      this.resizing = true;

      this.draggerWidth = this.container.offsetWidth;
      this.draggerHeight = this.container.offsetHeight;
      this.draggerPosX = this.container.getBoundingClientRect().left + document.body.scrollLeft + this.draggerWidth - event.pageX;
      this.draggerPosY = this.container.getBoundingClientRect().top + document.body.scrollTop + this.draggerHeight - event.pageY;
      this.previousCursor = document.body.style['cursor'];
      document.body.style['cursor'] = this.horizontal ? 'col-resize' : 'row-resize';
    }
  }

  constructor(protected el: ElementRef, protected renderer: Renderer) {}

  ngOnInit() {
    this.container = this.el.nativeElement;
    this.prev = this.container.previousElementSibling;
    this.next = this.container.nextElementSibling;
    this.horizontal = this.prev.hasAttribute('gm-col');

    this.documentColumnResizeListener = this.renderer.listenGlobal('body', 'mousemove', (event) => {
      if (this.resizing) {
        if (this.horizontal) {
          this.onHorizontalResize(event);
        } else {
          this.onVerticalResize(event);
        }
      }
    });

    this.documentColumnResizeEndListener = this.renderer.listenGlobal('body', 'mouseup', this.onMouseUp);
  }

  onMouseUp = (event) => {
    if (this.resizing) {
      this.resizing = false;
      document.body.style['cursor'] = this.previousCursor;
    }
  }

  onHorizontalResize(event) {
    const totalWidth = this.prev.offsetWidth + this.next.offsetWidth;

    const leftPercentage = (
      (
        (event.pageX - this.prev.getBoundingClientRect().left + document.body.scrollLeft) +
        (this.draggerPosX - this.draggerWidth / 2)
      ) / totalWidth
    );
    const rightPercentage = 1 - leftPercentage;

    this.prev.style['flex'] = leftPercentage.toString();
    this.next.style['flex'] = rightPercentage.toString();
  }

  onVerticalResize(event) {
    const totalHeight = this.prev.offsetHeight + this.next.offsetHeight;

    const topPercentage = (
      (
        (event.pageY - this.prev.getBoundingClientRect().top + document.body.scrollTop) +
        (this.draggerPosY - this.draggerHeight / 2)
      ) / totalHeight
    );
    const bottomPercentage = 1 - topPercentage;

    this.prev.style['flex'] = topPercentage.toString();
    this.next.style['flex'] = bottomPercentage.toString();
  }

  ngOnDestroy() {
    if (this.documentColumnResizeListener) {
      this.documentColumnResizeListener();
    }
    if (this.documentColumnResizeEndListener) {
      this.documentColumnResizeEndListener();
    }
  }
}
