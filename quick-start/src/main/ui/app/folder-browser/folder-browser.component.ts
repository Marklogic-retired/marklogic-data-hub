import { Component, Input, Output, OnInit,
  OnChanges, ViewChild, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { MdlTextFieldComponent } from 'angular2-mdl';

@Component({
  selector: 'folder-browser',
  templateUrl: './folder-browser.tpl.html',
  inputs: ['startPath'],
  styleUrls: ['./folder-browser.styles.scss'],
})
export class FolderBrowser implements OnInit, OnChanges {
  @Input() startPath: string = '.';
  @Output() folderChosen = new EventEmitter();

  @ViewChild(MdlTextFieldComponent) inputPath: MdlTextFieldComponent;

  currentPath: string = null;
  isLoading: boolean = false;
  folders: any[] = null;

  constructor(private http: Http) {}

  ngOnInit() {
    this.getFolders(this.startPath);
    this.inputPath.registerOnChange(value => {
      this.currentPath = value;
      this.changedPath();
    });
  }

  ngOnChanges(changes) {
    if (changes.startPath) {
      this.getFolders(changes.startPath.currentValue);
    }
  }

  changedPath() {
    this.getFolders(this.currentPath);
  }

  getFolders(path) {
    if (path) {
      this.isLoading = true;
      return this.http.get('/api/utils/searchPath?path=' + encodeURIComponent(path))
      .map(this.extractData)
      .subscribe(resp => {
        this.folders = resp.folders;
        this.currentPath = resp.currentPath;
        this.folderChosen.next(this.currentPath);
      },
      error => {
        console.log(error);
      },
      () => {
        this.isLoading = false;
      });
    }
  }

  entryClicked(entry) {
    this.getFolders(entry.path);
  }

  private extractData(res: Response) {
    return res.json();
  }
}
