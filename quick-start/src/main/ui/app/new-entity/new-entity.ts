import { Component, Input, Inject, EventEmitter,
trigger, state, style, transition, animate } from '@angular/core';

import { SelectList } from '../select-list/select-list.component';

@Component({
  selector: 'new-entity',
  templateUrl: './new-entity.html',
  styleUrls: ['./new-entity.scss'],
  directives: [SelectList],
  animations: [
    trigger('fadeState', [
      state('hidden', style({
        opacity: 0,
        visibility: 'hidden'
      })),
      state('active', style({
        opacity: 0.48,
        visibility: 'visible'
      })),
      transition('hidden => active', animate('0.5s ease-in')),
      transition('active => hidden', animate('0.5s ease-in'))
    ]),
    trigger('growState', [
      state('hidden', style({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      })),
      state('active', style({
        top: '*',
        left: '*',
        width: '*',
        height: '*',
      })),
      transition('hidden => active', animate('0.5s ease-in')),
      transition('active => hidden', animate('0.5s ease-in'))
    ]),
  ],
})
export class NewEntity {
  finishedEvent: EventEmitter<any>;
  vizState: string = 'hidden';

  pluginFormats = [
    { label: 'Javascript', value: 'JAVASCRIPT' },
    { label: 'XQuery', value: 'XQUERY' },
  ];
  dataFormats = [
    { label: 'JSON', value: 'JSON' },
    { label: 'XML', value: 'XML' },
  ];

  entity: any = {
    inputFlows: [
      {},
    ],
    harmonizeFlows: [
      {},
    ]
  };

  constructor() {
    this.entity.pluginFormat = this.pluginFormats[0];
    this.entity.dataFormat = this.dataFormats[0];
  }

  show() {
    this.finishedEvent = new EventEmitter<boolean>(true);
    this.vizState = 'active';
    return this.finishedEvent;
  }

  hide() {
    this.vizState = 'hidden';
  }

  private create() {
    this.hide();
    this.finishedEvent.emit(this.entity);
  }

  private cancel() {
    this.hide();
    this.finishedEvent.error(false);
  }
}
