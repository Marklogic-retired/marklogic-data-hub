import { Component, Input, Output, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
// import { MergeOptionsUiComponent } from "./ui/merge-options-ui.component";
// import { MergeStrategiesUiComponent } from "./ui/merge-strategies-ui.component";
// import { MergeCollectionsUiComponent } from "./ui/merge-collections-ui.component";
import { Merging } from "./merging.model";
import { MergeOptions } from "./merge-options.model";
import { MergeStrategies } from "./merge-strategies.model";
import { MergeCollections } from "./merge-collections.model";
import { EntitiesService } from '../../../../../models/entities.service';
import { Entity } from '../../../../../models';
import * as _ from "lodash";

@Component({
  selector: 'app-merging',
  template: `
  <h1>Merging Component</h1>
`
})
export class MergingComponent implements OnInit {
  // @ViewChild(MergeOptionsUiComponent) mergeOptionsUi: MergeOptionsUiComponent;
  // @ViewChild(MergeStrategiesUiComponent) mergeStrategiesUi: MergeStrategiesUiComponent;
  // @ViewChild(MergeCollectionsUiComponent) mergeCollectionsUi: MergeCollectionsUiComponent;

  @Input() step: any;
  @Output() saveStep = new EventEmitter();

  public stepId: string;
  public merging: Merging;
  public mergeOptions: MergeOptions;
  public mergeStrategies: MergeStrategies;
  public mergeCollections: MergeCollections;
  public targetEntity: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private entitiesService: EntitiesService
  ) { }

  ngOnInit() {

    this.stepId = this.activatedRoute.snapshot.paramMap.get('stepId');

    this.merging = Merging.fromConfig(this.step.config.mergeOptions);
    console.log('this.merging', this.merging);

    // Parse merging data and instantiate models for UI
    this.mergeOptions = MergeOptions.fromMerging(this.merging);
    console.log('this.mergeOptions', this.mergeOptions);
    this.mergeStrategies = MergeStrategies.fromMerging(this.merging);
    console.log('this.mergeStrategies', this.mergeStrategies);
    this.mergeCollections = MergeCollections.fromMerging(this.merging);
    console.log('this.mergeCollections', this.mergeCollections);

    this.getEntity(this.step.config.targetEntity);

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

  // onCreateOption(event): void {
  //   this.matchOptions.addOption(event);
  //   this.matchOptionsUi.renderRows();
  //   this.onSaveStep();
  // }

  // onUpdateOption(event): void {
  //   this.matchOptions.updateOption(event, event.index);
  //   this.matchOptionsUi.renderRows();
  //   this.onSaveStep();
  // }

  // onDeleteOption(event): void {
  //   this.matchOptions.deleteOption(event);
  //   this.matchOptionsUi.renderRows();
  //   this.onSaveStep();
  // }

  // onCreateThreshold(event): void {
  //   this.matchThresholds.addThreshold(event);
  //   this.matchThresholdsUi.renderRows();
  //   this.onSaveStep();
  // }

  // onUpdateThreshold(event): void {
  //   this.matchThresholds.updateThreshold(event, event.index);
  //   this.matchThresholdsUi.renderRows();
  //   this.onSaveStep();
  // }

  // onDeleteThreshold(event): void {
  //   this.matchThresholds.deleteThreshold(event);
  //   this.matchThresholdsUi.renderRows();
  //   this.onSaveStep();
  // }

  // onSaveStep(): void {
  //   this.matching = Matching.fromUI(this.matchOptions, this.matchThresholds);
  //   this.step.config.matchOptions = this.matching;
  //   this.saveStep.emit(this.step);
  // }

}
