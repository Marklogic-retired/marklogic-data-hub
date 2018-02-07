import { Component } from '@angular/core';

import { Entity } from '../entities';
import { EntitiesService } from '../entities/entities.service';

import * as _ from 'lodash';

@Component({
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent {

  public entities: Array<Entity>;
  public entitiesLoaded: boolean = false;
  private entityProps: Array<string> = [];
  private entityType: Array<string> = [];
  private entityPrimaryKey: string = "";

  getEntities(): void {
    this.entitiesService.entitiesChange.subscribe(entities => {
      let en;
      let self = this;

      this.entitiesLoaded = true;
      this.entities = entities;
      en = this.entities[0];

      // load entity for use by UI
      _.forEach(en.definition.properties, function(prop, key) {
        self.entityProps.push(prop.name);
        self.entityType.push(prop.datatype);
      });
      this.entityPrimaryKey = en.definition.primaryKey;
    });
    this.entitiesService.getEntities();
  }

  src: any = {
    "Row_ID": "1",
    "Order_ID": "3",
    "Order_Date": "10/13/10",
    "Order_Priority": "Low",
    "Order_Quantity": "6",
    "Sales": "261.54",
    "Discount": "0.04",
    "Ship_Mode": "Regular Air",
    "Profit": "-213.25",
    "Unit_Price": "38.94",
    "Shipping_Cost": "35",
    "Customer_Name": "Muhammed MacIntyre",
    "Province": "Nunavut",
    "Region": "Nunavut",
    "Customer_Segment": "Small Business",
    "Product_Category": "Office Supplies",
    "Product_Sub-Category": "Storage & Organization",
    "Product_Name": "Eldon Base for stackable storage shelf, platinum",
    "Product_Container": "Large Box",
    "Product_Base_Margin": "0.8",
    "Ship_Date": "10/20/10"
  };
  srcKeys = Object.keys(this.src);

  constructor(
    private entitiesService: EntitiesService) {
    this.getEntities();
  }
  overEvent(index, event) {
    console.log(index, event);
  }

}
