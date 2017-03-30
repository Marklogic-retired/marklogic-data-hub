import { Component, Input, Output, OnInit,
  OnChanges, ViewChild, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { MdlTextFieldComponent } from '@angular-mdl/core';

@Component({
  selector: 'app-folder-browser',
  templateUrl: './folder-browser.tpl.html',
  styleUrls: ['./folder-browser.styles.scss'],
})
export class FolderBrowserComponent implements OnInit, OnChanges {
  @Input() startPath: string = '.';
  @Output() folderChosen = new EventEmitter();
  @Input() absoluteOnly: boolean = false;

  @ViewChild(MdlTextFieldComponent) inputPath: MdlTextFieldComponent;

  currentPath: string = null;
  isLoading: boolean = false;
  folders: any[] = null;

  constructor(private http: Http) {}

  ngOnInit() {
    this.getFolders(this.startPath);
    this.inputPath.registerOnChange((value: string) => {
      this.currentPath = value;
      this.changedPath();
    });
  }

  ngOnChanges(changes: any) {
    if (changes.startPath) {
      this.getFolders(changes.startPath.currentValue);
    }
  }

  changedPath() {
    this.getFolders(this.currentPath);
  }

  getFolders(path: string): void {
    if (path) {
      this.isLoading = true;
      this.http.get(`/api/utils/searchPath?path=${encodeURIComponent(path)}&absolute=${this.absoluteOnly}`)
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

  entryClicked(entry: any): void {
    this.getFolders(entry.path);
  }

  private extractData(res: Response) {
    return res.json();
  }
}
