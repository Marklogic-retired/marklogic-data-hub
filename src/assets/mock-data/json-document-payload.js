const jsonDocPayload = {
  "content": {
    "envelope": {
      "headers": {
        "sources": [
          {
            "name": "products"
          }
        ],
        "createdOn": "2019-10-08T12:31:12.107279-07:00",
        "createdBy": "admin",
        "createdUsingFile": "/Users/ban/Documents/Projects/dhf-files/store-data/products/games/board_games.csv"
      },
      "triples": [],
      "instance": {
        "info": {
          "title": "Product",
          "version": "0.0.1",
          "baseUri": "http://example.org/",
          "description": "a"
        },
        "Product": {
          "id": "1000201",
          "sku": "186305438386",
          "title": "british duffel",
          "players": "2 to 4",
          "playing_time": "45–60 minutes",
          "category": "Board Game|Strategic thought",
          "popularity_tier": "3",
          "probability_accessories": "0.3"
        }
      },
      "attachments": {
        "envelope": {
          "headers": {
            "sources": [
              {
                "name": "products"
              }
            ],
            "createdOn": "2019-10-08T12:31:12.107279-07:00",
            "createdBy": "admin",
            "createdUsingFile": "/Users/ban/Documents/Projects/dhf-files/store-data/products/games/board_games.csv"
          },
          "triples": [],
          "instance": {
            "game_id": "1000201",
            "SKU": "186305438386",
            "title": "british duffel",
            "price": "15.0",
            "description": "",
            "years_active": "0",
            "publication_date": "0",
            "players": "2 to 4",
            "age_range": "",
            "setup_time": "5–10 minutes",
            "playing_time": "45–60 minutes",
            "chance": "Medium",
            "category": "Board Game|Strategic thought",
            "has_extensions": "True",
            "has_accessories": "False",
            "has_apparel": "False",
            "popularity_tier": "3",
            "probability_apparel": "0.3",
            "probability_accessories": "0.3",
            "probability_extensions": "0.3"
          },
          "attachments": null
        }
      }
    }
  },
  "metaData": {
    "datahubCreatedOn": "2019-10-08T14:33:15.31045-07:00",
    "datahubCreatedBy": "admin",
    "datahubCreatedByStep": "entity-services-mapping",
    "datahubCreatedByJob": "4be73bd9-0d26-4f7f-b153-907796498ed3 4093eb92-a9b7-4ae2-87c5-05e4dcfdc6c5",
    "datahubCreatedInFlow": "products"
  }
}

export default jsonDocPayload;