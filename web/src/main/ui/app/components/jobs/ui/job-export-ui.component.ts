import {Component, EventEmitter, HostListener, Input, Output, Inject} from "@angular/core";
import {MdlDialogReference, MdlDialogService} from '@angular-mdl/core';

@Component({
  selector: 'app-job-export-ui',
  templateUrl: './job-export-ui.component.html'
})
export class JobExportUiComponent {
  @Input() jobIds: string[];
  @Output() exportClicked = new EventEmitter();

  question: string;

  constructor(
    public dialog: MdlDialogReference,
    private dialogService: MdlDialogService,
    @Inject('jobIds') jobIds: string[]
  ) {

    this.jobIds = jobIds;
    this.question = "Export and download ";
    if (jobIds.length === 0) {
      this.question += "all jobs and their traces?";
    } else if (this.jobIds.length === 1) {
      this.question += "1 job and its traces?";
    } else {
      this.question += this.jobIds.length + " jobs and their traces?";
    }
  }

  @HostListener('keydown.esc')
  public onEsc(): void {
    this.dialog.hide();
  }

  public export(): void {
    this.dialog.hide();
    this.exportClicked.emit();
  }

  public cancel(): void {
    this.dialog.hide();
  }

  public alert(msg: string): void {
    this.dialogService.alert(msg);
  }
  
}
