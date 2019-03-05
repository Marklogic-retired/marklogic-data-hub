import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MatchingUiComponent } from "./ui/matching-ui.component";
import { MatchOptionsUiComponent } from "./ui/match-options-ui.component";
import { MatchThresholdsUiComponent } from "./ui/match-thresholds-ui.component";
import { matchingData } from "../../models/matching.data";
import { Matching } from "../../models/matching.model";
import { MatchOptions } from "../../models/match-options.model";
import { MatchThresholds } from "../../models/match-thresholds.model";

@Component({
  selector: 'app-matching',
  template: `
  <app-matching-ui
    [matchOptions]="matchOptions"
    [matchThresholds]="matchThresholds"
    (createOption)="this.createOption($event)"
    (saveOption)="this.saveOption($event)"
    (deleteOption)="this.deleteOption($event)"
    (createThreshold)="this.createThreshold($event)"
    (saveThreshold)="this.saveThreshold($event)"
    (deleteThreshold)="this.deleteThreshold($event)"
  ></app-matching-ui>
`
})
export class MatchingComponent implements OnInit {

  @ViewChild(MatchingUiComponent) matchingUi: MatchingUiComponent;

  public stepId: string;
  public matchOptions: MatchOptions;
  public matchThresholds: MatchThresholds;

  constructor(
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {

    this.stepId = this.activatedRoute.snapshot.paramMap.get('stepId');
    console.log('stepId:', this.stepId);

    // TODO Retrieve matching data from the backend based on stepId
    let matching = Matching.fromConfig(matchingData);
    console.log(matching);

    // Parse matching data and instantiate models for UI
    this.matchOptions = MatchOptions.fromMatching(matching);
    console.log(this.matchOptions);

    this.matchThresholds = MatchThresholds.fromJSON(matching);
    console.log(this.matchThresholds);
  }

  createOption(event): void {
    console.log('createOption', event);
    this.matchOptions.addOption(event);
    this.matchingUi.renderRows();
  }

  saveOption(event): void {
    console.log('saveOption', event);
    this.matchOptions.updateOption(event, event.index);
    this.matchingUi.renderRows();
  }

  deleteOption(index): void {
    this.matchOptions.deleteOption(index);
    console.log('deleteOption');
    this.matchingUi.renderRows();
  }

  createThreshold(event): void {
    this.matchThresholds.addThreshold(event);
    console.log('createThreshold', this.matchThresholds);
    this.matchingUi.renderRowsThresholds();
  }

  saveThreshold(event): void {
    this.matchThresholds.updateThreshold(event, event.index);
    console.log('saveThreshold', this.matchThresholds);
    this.matchingUi.renderRowsThresholds();
  }

  deleteThreshold(index): void {
    this.matchThresholds.deleteThreshold(index);
    console.log('deleteThreshold', this.matchThresholds);
    this.matchingUi.renderRowsThresholds();
  }
}
