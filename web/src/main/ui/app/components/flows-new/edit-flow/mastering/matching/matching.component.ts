import { Component, Input, Output, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MatchOptionsUiComponent } from "./ui/match-options-ui.component";
import { MatchThresholdsUiComponent } from "./ui/match-thresholds-ui.component";
import { Matching } from "./matching.model";
import { MatchOptions } from "./match-options.model";
import { MatchThresholds } from "./match-thresholds.model";
import { EntitiesService } from '../../../../../models/entities.service';
import { Entity } from '../../../../../models';
import * as _ from "lodash";

@Component({
  selector: 'app-matching',
  template: `
  <app-match-options-ui
    [matchOptions]="matchOptions"
    [targetEntity]="targetEntity"
    [targetEntityName]="this.step.options.targetEntity"
    (createOption)="this.onCreateOption($event)"
    (updateOption)="this.onUpdateOption($event)"
    (deleteOption)="this.onDeleteOption($event)"
  ></app-match-options-ui>
  <app-match-thresholds-ui
    [matchThresholds]="matchThresholds"
    (createThreshold)="this.onCreateThreshold($event)"
    (updateThreshold)="this.onUpdateThreshold($event)"
    (deleteThreshold)="this.onDeleteThreshold($event)"
  ></app-match-thresholds-ui>
`
})
export class MatchingComponent implements OnInit {
  @ViewChild(MatchOptionsUiComponent) matchOptionsUi: MatchOptionsUiComponent;
  @ViewChild(MatchThresholdsUiComponent) matchThresholdsUi: MatchThresholdsUiComponent;

  @Input() step: any;
  @Output() saveStep = new EventEmitter();

  public stepId: string;
  public matching: Matching;
  public matchOptions: MatchOptions;
  public matchThresholds: MatchThresholds;
  public targetEntity: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private entitiesService: EntitiesService
  ) { }

  ngOnInit() {

    this.stepId = this.activatedRoute.snapshot.paramMap.get('stepId');

    this.matching = Matching.fromConfig(this.step.options.matchOptions);
    console.log('this.matching', this.matching);

    // Parse matching data and instantiate models for UI
    this.matchOptions = MatchOptions.fromMatching(this.matching);
    this.matchThresholds = MatchThresholds.fromMatching(this.matching);

    this.getEntity(this.step.options.targetEntity);

  }

  /**
   * Load target entity.
   */
  getEntity(entityName): void {
    let self = this;
    this.entitiesService.entitiesChange.subscribe(entities => {
      this.targetEntity = _.find(entities, (e: Entity) => {
        return e.name === entityName;
      });
    });
    this.entitiesService.getEntities();
  }

  onCreateOption(event): void {
    this.matchOptions.addOption(event);
    this.matchOptionsUi.renderRows();
    this.onSaveStep();
  }

  onUpdateOption(event): void {
    this.matchOptions.updateOption(event.opt, event.index);
    this.matchOptionsUi.renderRows();
    this.onSaveStep();
  }

  onDeleteOption(event): void {
    this.matchOptions.deleteOption(event);
    this.matchOptionsUi.renderRows();
    this.onSaveStep();
  }

  onCreateThreshold(event): void {
    this.matchThresholds.addThreshold(event);
    this.matchThresholdsUi.renderRows();
    this.onSaveStep();
  }

  onUpdateThreshold(event): void {
    this.matchThresholds.updateThreshold(event.thr, event.index);
    this.matchThresholdsUi.renderRows();
    this.onSaveStep();
  }

  onDeleteThreshold(event): void {
    this.matchThresholds.deleteThreshold(event);
    this.matchThresholdsUi.renderRows();
    this.onSaveStep();
  }

  onSaveStep(): void {
    this.matching = Matching.fromUI(this.matchOptions, this.matchThresholds);
    this.step.options.matchOptions = this.matching;
    this.saveStep.emit(this.step);
  }

}
