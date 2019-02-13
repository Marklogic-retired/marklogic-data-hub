import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Mapping } from "../mapping.model";
import * as _ from 'lodash';

@Component({
  selector: 'app-new-map-ui',
  templateUrl: './new-map-ui.component.html',
  styleUrls: ['./new-map-ui.component.scss']
})
export class NewMapUiComponent {

  mapName: string = '';
  mapDesc: string = '';

  @Input() mappings: Array<Mapping>;

  @Output() create = new EventEmitter();
  @Output() cancel = new EventEmitter();

  @HostListener('keydown.esc')
  public onEsc(): void {
    this.cancel.emit(event);
  }

  nameEmpty() {
    let result = true;
    if (this.mapName) {
      result = this.mapName.length === 0;
    }
    return result;
  }

  nameDuplicate() {
    let result;
    if (this.mappings && this.mapName) {
      let name = this.mapName;
      result =  _.findIndex(this.mappings, function(m) { return m.name === name; });
    }
    return result > -1;
  }

  onCreate() {
    if (!this.nameEmpty() && !this.nameDuplicate()) {
      this.create.emit({mapName: this.mapName, mapDesc: this.mapDesc});
    }
  }

  onCancel() {
    this.cancel.emit(event);
  }

}
