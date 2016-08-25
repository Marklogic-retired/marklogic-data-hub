// Imports
import {
  Component,
  Input,
  Output,
  ElementRef,
  ViewChild,
  EventEmitter,
  Provider,
  forwardRef,
  ViewEncapsulation
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import * as CodeMirror from 'codemirror';
require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');

// Control Value accessor provider
const CODEMIRROR_CONTROL_VALUE_ACCESSOR = new Provider(
  NG_VALUE_ACCESSOR,
  {
    useExisting: forwardRef(() => Codemirror),
    multi: true
  }
);

/**
 * CodeMirror component
 * Usage :
 * <codemirror [(ngModel)]="data" [config]="{...}"></ckeditor>
 */
@Component({
  selector: 'codemirror',
  encapsulation: ViewEncapsulation.None,
  providers: [CODEMIRROR_CONTROL_VALUE_ACCESSOR],
  template: `<textarea #host></textarea>`,
  styleUrls: [
    './codemirror.style.css'
  ],
})
export class Codemirror {

  @Input() config: any;

  @Output() change = new EventEmitter();
  // editor;
  @ViewChild('host') host: any;

  _value: string = '';
  @Output() instance: any = null;

  /**
   * Constructor
   */
  constructor() {}

  get value(): any { return this._value; };
  @Input() set value(v) {
    if (v !== this._value) {
      this._value = v;
      this._onChangeCallback(v);
    }
  }

  /**
   * On component destroy
   */
  ngOnDestroy() {}

  /**
   * On component view init
   */
  ngAfterViewInit() {
    this.config = this.config || {};
    this.codemirrorInit(this.config);
  }

  /**
   * Initialize codemirror
   */
  codemirrorInit(config: any) {
    this.instance = CodeMirror.fromTextArea(this.host.nativeElement, config);
    this.instance.on('change', () => {
      this.updateValue(this.instance.getValue());
    });
  }

  /**
   * Value update process
   */
  updateValue(value: any) {
    this.value = value;
    this.onChange(value);
    this.onTouched();
    this.change.emit(value);
  }

  /**
   * Implements ControlValueAccessor
   */
  writeValue(value: any) {
    this._value = value;
    if (this.instance) {
      this.instance.setValue(value || '');
    }
  }
  onChange(_: any) {}
  onTouched() {}
  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }
  _onChangeCallback(_: any) {}
  _onTouchedCallback() {}
}
