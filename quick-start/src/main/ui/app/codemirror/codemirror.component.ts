import {
  Component,
  Input,
  OnInit,
  OnChanges,
  Output,
  ViewChild,
  ViewEncapsulation,
  EventEmitter,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import * as CodeMirror from 'codemirror';
require('./addon/mode/xquery');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/selection/mark-selection');
require('./addon/edit/matchbrackets');
require('./addon/hint/show-hint');
require('./addon/hint/marklogic-hint-suggestions');
require('./addon/hint/marklogic-hint-templates');
require('./addon/hint/marklogic-hint');
require('./addon/edit/closebrackets');

/**
 * CodeMirror component
 * Usage :
 * <codemirror [(ngModel)]="data" [config]="{...}"></ckeditor>
 */
@Component({
  selector: 'app-codemirror',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CodemirrorComponent),
      multi: true
    }
  ],
  template: `<textarea #host></textarea>`,
  styleUrls: ['./codemirror.component.scss']
})
export class CodemirrorComponent implements OnInit, OnChanges {

  @Input() config;
  @Input() error: any;

  @Output() change = new EventEmitter();
  @ViewChild('host') host;

  private _value = '';
  private _line: number = null;
  private _showLine: number = null;
  private _expression: string;
  private _errorTooltip: any = null;
  private mouseOnTip = false;

  private currentError: CodeMirror.TextMarker;

  hintOptions = {
    closeOnUnfocus: true,
    completeSingle: false
  };

  @Output() instance: CodeMirror.EditorFromTextArea = null;
  @Output() saveEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

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
    if (changes && changes.error) {
      this.setError();
    }
  }

  setError() {
    if (this.instance) {
      if (this.currentError) {
        this.currentError.clear();
        this.currentError = null;
      }
      this.instance.clearGutter('buglines');

      if (this.error) {
        const line = this.error.line - 1;
        const endChar = this.instance.getDoc().getLine(line).length;
        this.currentError = this.instance.getDoc().markText({line: line, ch: 0}, {line: line, ch: endChar}, {className: 'error-line'});
        this.instance.setGutterMarker(line, 'buglines', this.makeBugMarker(line, `${this.error.msg}\nat line ${this.error.line}, column ${this.error.column}`));
        this.instance.getDoc().setCursor({ line: line, ch: 0 });
      }
    }
  }

  private makeBugMarker(line, msg) {
    const marker = document.createElement('i');
    marker.className = 'fa fa-bug';
    marker.innerHTML = '';
    marker.addEventListener('pointerenter', () => {
      if (!this._errorTooltip) {
        this.instance.getDoc().setCursor({ line: line, ch: 0 });
        let tip = this.elt('span', null, this.elt('strong', null, null));
        tip.appendChild(document.createTextNode(msg));
        this.tempTooltip(tip, marker);
      }
    });
    return marker;
  }
  private elt(tagname: string, cls: string, el: any) : any {
    var e = document.createElement(tagname);
    if (cls) {
      e.className = cls;
    }

    if (el) {
      if (typeof el == 'string') {
        el = document.createTextNode(el);
      }
      e.appendChild(el);
    }
    return e;
  }

  private tempTooltip(content, el) {
    if (this._errorTooltip) {
      this.remove(this._errorTooltip);
    }
    var where = this.instance.cursorCoords(true, 'page');
    var tip = this._errorTooltip = this.makeTooltip(where.left + 1, where.bottom, content);

    let clear = () => {
      setTimeout(() => {
        this._errorTooltip = null;
        if (!tip.parentNode || this.mouseOnTip) {
          return;
        }
        this.instance.off('cursorActivity', clear);
        this.instance.off('blur', clear);
        this.instance.off('scroll', clear);
        this.fadeOut(tip);
        el.removeEventListener('pointerleave', clear);
      }, 500);
    }
    CodeMirror.on(tip, 'mousemove', () => {
      this.mouseOnTip = true;
    });
    CodeMirror.on(tip, 'mouseout', (e: MouseEvent) => {
      if (!CodeMirror['contains'](tip, e.relatedTarget || e.toElement)) {
        this.mouseOnTip = false;
        clear();
      }
    });

    this.instance.on('cursorActivity', clear);
    this.instance.on('blur', clear);
    this.instance.on('scroll', clear);
    el.addEventListener('pointerleave', clear);
  }

  private makeTooltip(x, y, content) {
    let node = this.elt('div', 'error-tooltip', content);
    node.style.left = x + 'px';
    node.style.top = y + 'px';
    document.body.appendChild(node);
    return node;
  }

  private remove(node) {
    var p = node && node.parentNode;
    if (p) {
      p.removeChild(node);
    }
  }

  private fadeOut(tooltip: any) {
    if (this.mouseOnTip) {
      return;
    }
    tooltip.style.opacity = '0';
    setTimeout(() => {
      this.remove(tooltip);
    }, 1100);
  }

  onKeyEvent = (instance: CodeMirror.Editor, event: KeyboardEvent) => {
    if (this.instance.state.completionActive || event.keyCode === 40 || event.keyCode === 39
        || event.keyCode === 38 || event.keyCode === 37 || event.keyCode === 13
        || event.keyCode === 27) {
      return;
    }

    this.instance['showHint'](this.hintOptions);
  };

  onKeyDown = (instance: CodeMirror.Editor, event: KeyboardEvent) => {
    // ctrl+s or command+s
    if ((event.metaKey || event.ctrlKey) && event.keyCode == 83) {
        event.preventDefault();
        this.saveEvent.emit(true);
        return;
    }
  };
  /**
   * Initialize codemirror
   */
  codemirrorInit(config) {
    // config.onKeyEvent = this.onKeyEvent;
    this.instance = CodeMirror.fromTextArea(this.host.nativeElement, config);
    this.instance.on('change', () => {
      this.updateValue(this.instance.getValue());
    });
    this.instance.on('keyup', this.onKeyEvent);
    this.instance.on('keydown', this.onKeyDown);

    setTimeout(() => {
      this.instance.refresh();
      this.setError();
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
