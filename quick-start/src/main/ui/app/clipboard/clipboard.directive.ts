import { Directive, ElementRef, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import * as Clipboard from 'clipboard';

const _Clipboard: any = Clipboard;

@Directive({
  selector: '[appClipboard]'
})
export class ClipboardDirective implements OnInit, OnDestroy {
  clipboard: Clipboard;

  @Input() appClipboard: ElementRef;

  @Input() cbContent: string;

  @Output() onSuccess = new EventEmitter<boolean>();

  @Output() onError = new EventEmitter<boolean>();

  constructor(private elmRef: ElementRef) { }

  ngOnInit() {
    let option: Clipboard.Options;
    option = !!this.appClipboard ? { target: () => <any>this.appClipboard } : { text: () => this.cbContent };
    this.clipboard = new _Clipboard(this.elmRef.nativeElement, option);
    this.clipboard.on('success', (e) => this.onSuccess.emit(true));
    this.clipboard.on('error', (e) => this.onError.emit(true));
  }

  ngOnDestroy() {
    if (!!this.clipboard) {
      this.clipboard.destroy();
    }
  }
}
