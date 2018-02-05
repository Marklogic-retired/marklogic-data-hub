import { Component } from '@angular/core';

@Component({
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent {

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

  harm: any = {
    "info": {
      "title": "OrderLine",
      "version": "0.0.6",
      "baseUri": "http://marklogic.com/sample-data/order",
      "description" : "This OrderLine is a flat model for mapping superstore data."
    },
    "definitions": {
      "OrderLine": {
        "properties": {
          "orderId": {
            "datatype": "string"
          },
          "orderDate": {
            "datatype": "date"
          },
          "lineItemId": {
            "datatype":"integer"
          },
          "quantity": {
            "datatype": "integer"
          },
          "productName": {
            "datatype": "string"
          }
        },
        "primaryKey":"lineItemId"
      }
    }
  };
  harmKeys = Object.keys(
    this.harm.definitions[this.harm.info.title].properties
  );
  harmPrimary = this.harm.definitions[this.harm.info.title].primaryKey;

  constructor() {}

  overEvent(index, event) {
    console.log(index, event);
  }

}
