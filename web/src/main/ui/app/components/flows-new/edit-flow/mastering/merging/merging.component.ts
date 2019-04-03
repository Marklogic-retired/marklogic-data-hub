import { Component, Input, Output, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MergeOptionsUiComponent } from "./ui/merge-options-ui.component";
import { MergeStrategiesUiComponent } from "./ui/merge-strategies-ui.component";
import { MergeCollectionsUiComponent } from "./ui/merge-collections-ui.component";
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
  <app-merge-options-ui
    [mergeOptions]="mergeOptions"
    [targetEntity]="targetEntity"
    [targetEntityName]="this.step.options.targetEntity"
    [mergeStrategies]="mergeStrategies"
    (createOption)="this.onCreateOption($event)"
    (updateOption)="this.onUpdateOption($event)"
    (deleteOption)="this.onDeleteOption($event)"
  ></app-merge-options-ui>
  <app-merge-strategies-ui
    [mergeStrategies]="mergeStrategies"
    [timestamp]="mergeTimestamp"
    (createStrategy)="this.onCreateStrategy($event)"
    (updateStrategy)="this.onUpdateStrategy($event)"
    (deleteStrategy)="this.onDeleteStrategy($event)"
    (saveTimestamp)="this.onSaveTimestamp($event)"
  ></app-merge-strategies-ui>
  <app-merge-collections-ui
    [mergeCollections]="mergeCollections"
    (createCollection)="this.onCreateCollection($event)"
    (updateCollection)="this.onUpdateCollection($event)"
    (deleteCollection)="this.onDeleteCollection($event)"
  ></app-merge-collections-ui>
`
})
export class MergingComponent implements OnInit {
  @ViewChild(MergeOptionsUiComponent) mergeOptionsUi: MergeOptionsUiComponent;
  @ViewChild(MergeStrategiesUiComponent) mergeStrategiesUi: MergeStrategiesUiComponent;
  @ViewChild(MergeCollectionsUiComponent) mergeCollectionsUi: MergeCollectionsUiComponent;

  @Input() step: any;
  @Output() saveStep = new EventEmitter();

  public stepId: string;
  public merging: Merging;
  public mergeOptions: MergeOptions;
  public mergeStrategies: MergeStrategies;
  public mergeCollections: MergeCollections;
  public targetEntity: any;
  public mergeTimestamp: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private entitiesService: EntitiesService
  ) { }

  ngOnInit() {

    this.stepId = this.activatedRoute.snapshot.paramMap.get('stepId');

    this.merging = Merging.fromConfig(this.step.options.mergeOptions);
    console.log('this.merging', this.merging);

    // Parse merging data and instantiate models for UI
    this.mergeOptions = MergeOptions.fromMerging(this.merging);
    console.log('this.mergeOptions', this.mergeOptions);

    this.mergeStrategies = MergeStrategies.fromMerging(this.merging);
    console.log('this.mergeStrategies', this.mergeStrategies);
    this.mergeTimestamp = this.merging.getTimestamp();

    this.mergeCollections = MergeCollections.fromMerging(this.merging);
    console.log('this.mergeCollections', this.mergeCollections);

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
    this.mergeOptions.addOption(event.opt);
    this.mergeOptionsUi.renderRows();
    this.onSaveStep();
  }

  onUpdateOption(event): void {
    this.mergeOptions.updateOption(event.opt, event.index);
    this.mergeOptionsUi.renderRows();
    this.onSaveStep();
  }

  onDeleteOption(event): void {
    this.mergeOptions.deleteOption(event);
    this.mergeOptionsUi.renderRows();
    this.onSaveStep();
  }

  onCreateStrategy(event): void {
    this.mergeStrategies.addStrategy(event.str);
    this.mergeStrategiesUi.renderRows();
    this.onSaveStep();
  }

  onUpdateStrategy(event): void {
    this.mergeStrategies.updateStrategy(event.str, event.index);
    this.mergeStrategiesUi.renderRows();
    this.mergeOptions.updateOptionsByStrategy(event.str);
    this.onSaveStep();
  }

  onDeleteStrategy(event): void {
    this.mergeStrategies.deleteStrategy(event);
    this.mergeStrategiesUi.renderRows();
    this.mergeOptions.deleteOptionsByStrategy(event);
    this.mergeOptionsUi.renderRows();
    this.onSaveStep();
  }

  onCreateCollection(event): void {
    this.mergeCollections.addCollection(event.coll);
    this.mergeCollectionsUi.renderRows();
    this.onSaveStep();
  }

  onUpdateCollection(event): void {
    this.mergeCollections.updateCollection(event.coll, event.index);
    this.mergeCollectionsUi.renderRows();
    this.onSaveStep();
  }

  onDeleteCollection(event): void {
    this.mergeCollections.deleteCollection(event);
    this.mergeCollectionsUi.renderRows();
    this.onSaveStep();
  }

  onSaveTimestamp(event): void {
    this.mergeTimestamp = event;
    this.onSaveStep();
  }

  onSaveStep(): void {
    this.merging = Merging.fromUI(this.mergeOptions, this.mergeStrategies, this.mergeCollections, this.mergeTimestamp);
    this.step.options.mergeOptions = this.merging;
    this.saveStep.emit(this.step);
  }

}
