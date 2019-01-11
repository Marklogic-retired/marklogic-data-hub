import {
  AfterViewInit,
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
export class CodemirrorComponent implements AfterViewInit, OnInit, OnChanges {

  @Input() config;
  @Input() error: any;

  @Output() change = new EventEmitter();

  @Output() cmChange = new EventEmitter();

  _history: any = null;
  @Output() historyChange = new EventEmitter();
  @Input()
  get history() {
    if (this.instance) {
      return this.instance.getDoc()['history'];
    }

    return this._history;
  }
  set history(val) {
    if (!val) {
      return;
    }
    this._history = val;

    if (this.instance) {
      let doc = this.instance.getDoc();
      if (doc['history'] !== this._history) {
        if (this._history.generation) {
          doc['history'] = this._history;
        } else {
          doc.setHistory(this._history);
        }
      }
    }
    this.historyChange.emit(this._history);
  }

  _dirty: boolean = false;
  @Output() dirtyChange = new EventEmitter();
  @Input()
  get dirty() {
    return this._dirty;
  }
  set dirty(val) {
    this._dirty = val;
    this.dirtyChange.emit(this._dirty);
  }

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

  instance: CodeMirror.EditorFromTextArea = null;
  @Output() saveEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Constructor
   */
  constructor() {}

  get value(): any { return this._value; };

  ngOnInit() {
  }

  ngOnChanges(changes: any) {
    if (changes && changes.error) {
      this.setError();
    }
  }

  ngAfterViewInit() {
    this.cmChange.emit(this);
  }

  setError() {
    if (this.instance) {
      if (this.currentError) {
        this.currentError.clear();
        this.currentError = null;
      }
      this.instance.clearGutter('buglines');

      if (this.error && this.error.line) {
        const line = this.error.line - 2;
        const endChar = this.instance.getDoc().getLine(line).length;
        this.currentError = this.instance.getDoc().markText({line: line, ch: 0}, {line: line, ch: endChar}, {className: 'error-line'});
        this.instance.setGutterMarker(line, 'buglines', this.makeBugMarker(line, `${this.error.msg}\nat line ${this.error.line - 1}, column ${this.error.column}`));
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
    if (event.keyCode >= 65 && event.keyCode <= 90 || event.keyCode === 189) {
      this.instance['showHint'](this.hintOptions);
    }
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
  codemirrorInit(value: string) {
    let config = this.config || {};
    this.host.nativeElement.value = value;
    this.instance = CodeMirror.fromTextArea(this.host.nativeElement, config);
    this.instance.on('change', () => {
      this.updateValue(this.instance.getValue());
    });
    this.instance.on('keyup', this.onKeyEvent);
    this.instance.on('keydown', this.onKeyDown);

    let doc = this.instance.getDoc();
    if (this._history && doc['history'] !== this._history) {
      if (this._history.generation) {
        doc['history'] = this._history;
      } else {
        doc.setHistory(this._history);
      }
    }
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

  refresh() {
    setTimeout(() => {
      this.instance.refresh();
    }, 250);
  }

  /**
   * Value update process
   */
  updateValue(value) {
    let doc = this.instance.getDoc();
    this.dirty = !doc.isClean();
    this.onChange(value);
    this.historyChange.emit(this.history);
    this.onTouched();
    this.change.emit(value);
  }

  /**
   * Implements ControlValueAccessor
   */
  writeValue(value) {
    if (value) {
      this._value = value;
      if (this.instance) {
        this.instance.setValue(this._value);
      } else {
        this.codemirrorInit(this._value);
      }
      this.onChange(value);
    }
  }

  onChange(_) {}
  onTouched() {}
  registerOnChange(fn) { this.onChange = fn; }
  registerOnTouched(fn) { this.onTouched = fn; }
}
