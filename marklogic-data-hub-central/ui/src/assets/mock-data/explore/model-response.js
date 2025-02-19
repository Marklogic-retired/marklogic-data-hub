export const modelResponse = [{"info": {"title": "Order", "version": "0.0.1", "baseUri": "http://example.org/", "description": "a"}, "definitions": {"Order": {"primaryKey": "id", "required": [], "pii": [], "elementRangeIndex": ["quantity", "price", "discounted_price"], "rangeIndex": [], "wordLexicon": [], "properties": {"id": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "customer": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "order_date": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "ship_date": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "sku": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "product_id": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "quantity": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "price": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "discounted_price": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "title": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "description": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}}}}}, {"info": {"title": "Product", "version": "0.0.1", "baseUri": "http://example.org/"}, "definitions": {"Product": {"primaryKey": "id", "required": [], "pii": [], "elementRangeIndex": ["category", "popularity_tier"], "rangeIndex": [], "wordLexicon": [], "properties": {"id": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "sku": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "title": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "price": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "category": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "popularity_tier": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}}}}}, {"info": {"title": "Customer", "version": "0.0.1", "baseUri": "http://example.org/"}, "definitions": {"Customer": {"primaryKey": "id", "required": [], "pii": [], "elementRangeIndex": ["gender", "credit_score", "sales_region", "activity_tier"], "rangeIndex": [], "wordLexicon": [], "properties": {"id": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "first_name": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "last_name": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "gender": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint", "facetable": true}, "billing_address": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "credit_score": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}, "sales_region": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint", "facetable": true}, "activity_tier": {"datatype": "string", "collation": "http://marklogic.com/collation/codepoint"}}}}}];

export const exploreModelResponse = [
  {
    "info": {
      "title": "Customer",
      "version": "0.0.1",
      "baseUri": "http://example.com/",
      "description": "An Customer entity"
    },
    "definitions": {
      "Customer": {
        "properties": {
          "FirstName": {
            "datatype": "string",
            "collation": "http://marklogic.com/collation/codepoint"
          }
        }
      }
    }

  }
];