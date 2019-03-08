import { Component, Input, Output, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MatchOptionsUiComponent } from "./ui/match-options-ui.component";
import { MatchThresholdsUiComponent } from "./ui/match-thresholds-ui.component";
import { Matching } from "../../models/matching.model";
import { MatchOptions } from "../../models/match-options.model";
import { MatchThresholds } from "../../models/match-thresholds.model";

@Component({
  selector: 'app-matching',
  template: `
  <app-match-options-ui
    [matchOptions]="matchOptions"
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

  constructor(
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {

    this.stepId = this.activatedRoute.snapshot.paramMap.get('stepId');

    this.matching = Matching.fromConfig(this.step.config.matchOptions);

    // Parse matching data and instantiate models for UI
    this.matchOptions = MatchOptions.fromMatching(this.matching);
    this.matchThresholds = MatchThresholds.fromMatching(this.matching);

  }

  onCreateOption(event): void {
    console.log('createOption', event);
    this.matchOptions.addOption(event);
    this.matchOptionsUi.renderRows();
    this.onSaveStep();
  }

  onUpdateOption(event): void {
    console.log('saveOption', event);
    this.matchOptions.updateOption(event, event.index);
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
    this.matchThresholds.updateThreshold(event, event.index);
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
    this.step.config.matchOptions = this.matching;
    this.saveStep.emit(this.step);
  }

}
