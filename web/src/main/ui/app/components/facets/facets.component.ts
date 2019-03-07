import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'app-facets',
  templateUrl: './facets.component.html',
  styleUrls: ['./facets.component.scss']
})
export class FacetsComponent implements OnInit {

  @Input() shouldNegate: boolean = false;
  @Input() shouldShowMore: boolean = false;

  @Input() activeFacets: any;
  @Output() activeFacetsChange: EventEmitter<any> = new EventEmitter<any>();


  @Input() facets: any;

  constructor() { }

  ngOnInit() {
  }

  isVisible(facet: any) {
    let active = this.activeFacets[facet.__key];
    return !(active && active.values && active.values.length > 0) && (facet.facetValues && facet.facetValues.length > 0);
  }

  initActiveFacets() {
    if (!this.activeFacets) {
      this.activeFacets = {};
    }
  }

  toggle(name: string, value: any) {
    this.initActiveFacets();

    if (this.isFacetActive(name, value)) {
      this.clearFacet(name, value);
    } else {
      this.selectFacet(name, value);
    }
  }

  getCollapsedIcon(name: string) {
    if (this.isToggleCollapsed(name)) {
      return 'fa-angle-left';
    }
    return 'fa-angle-down';
  }

  isToggleCollapsed(name: string) {
    return localStorage.getItem('facet-collapsed-' + name) === 'true';
  }

  toggleCollapsed(name: string) {
    localStorage.setItem('facet-collapsed-' + name, (!this.isToggleCollapsed(name)).toString());
  }

  selectFacet(name: string, value: any) {
    let facet = this.activeFacets[name] || { values: [] };
    facet.values.push(value);
    this.activeFacets[name] = facet;
    this.activeFacets = _.cloneDeep(this.activeFacets);
    this.activeFacetsChange.emit(this.activeFacets);
  }

  isFacetActive(name: string, value: any) {
    const active = this.activeFacets[name];
    return !!active && (active.values.indexOf(value) >= 0);
  }

  clearFacet(name: string, value: any) {
    const active = this.activeFacets[name];

    active.values = _.filter(active.values, (facetValueObject) => {
      return facetValueObject !== value;
    });

    if (!active.values.length) {
      delete this.activeFacets[name];
    }

    this.activeFacets = _.cloneDeep(this.activeFacets);
    this.activeFacetsChange.emit(this.activeFacets);
  }

  negate(o: any) {
    this.initActiveFacets();
  }

  showMore(o: any) {
    this.initActiveFacets();
  }

}
