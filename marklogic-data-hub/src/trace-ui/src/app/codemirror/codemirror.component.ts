import {
  Component,
  Input,
  OnInit,
  OnChanges,
  Output,
  ViewChild,
  EventEmitter,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import * as CodeMirror from 'codemirror';
require('codemirror/mode/xquery/xquery');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/selection/mark-selection');

/**
 * CodeMirror component
 * Usage :
 * <codemirror [(ngModel)]="data" [config]="{...}"></ckeditor>
 */
@Component({
  selector: 'app-codemirror',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CodemirrorComponent),
      multi: true
    }
  ],
  template: `<textarea #host></textarea>`,
  styles: [`
    :host {
      display: block;
    }

    ::v-deep .CodeMirror {
      height: auto;
    }
  `]
})
export class CodemirrorComponent implements OnInit, OnChanges {

  @Input() config;

  @Output() change = new EventEmitter();
  @ViewChild('host') host;

  private _value = '';
  private _line: number = null;
  private _showLine: number = null;
  private _expression: string;

  private currentStatement: CodeMirror.TextMarker;

  @Output() instance: CodeMirror.EditorFromTextArea = null;

  /**
   * Constructor
   */
  constructor() {}

  get value(): any { return this._value; };

  ngOnInit() {
    this.config = this.config || {};
    this.codemirrorInit(this.config);
  }

  ngOnChanges(changes: any) {
  }

  /**
   * Initialize codemirror
   */
  codemirrorInit(config) {
    this.instance = CodeMirror.fromTextArea(this.host.nativeElement, config);
    this.instance.on('change', () => {
      this.updateValue(this.instance.getValue());
    });
    setTimeout(() => {
      this.instance.refresh();
    }, 250);

    if (config.events) {
      Object.keys(config.events).map((key) => {
        this.instance.on(key, config.events[key]);
      });
    }
  }

  /**
   * Value update process
   */
  updateValue(value) {

    this.onChange(value);
    this.onTouched();
    this.change.emit(value);
  }

  /**
   * Implements ControlValueAccessor
   */
  writeValue(value) {
    this._value = value || '';
    if (this.instance) {
      this.instance.setValue(this._value);
      this.onChange(value);
    }
  }

  onChange(_) {}
  onTouched() {}
  registerOnChange(fn) { this.onChange = fn; }
  registerOnTouched(fn) { this.onTouched = fn; }
}
