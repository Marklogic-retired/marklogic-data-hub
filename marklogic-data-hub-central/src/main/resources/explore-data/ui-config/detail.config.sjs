const detailConfig  = {  

    // Detail view
    detail: {
      entities: {
        ENTITY1: {
          "heading": {
            "title": {
              "path": "uri"
            }
          },

          "info": {
            "title": "ENTITY1 Info",
            "items": [
              {
                "component": "DataTableValue",
                "config": {
                  "id": "uri",
                  "title": "URI",
                  "arrayPath": "uri"
                }
              }
            ]
          },

          "relationships": {},

          "imageGallery": {},

          "timeline": {}
        },
        
        ENTITY2: {
          "heading": {
            "title": {
              "path": "uri"
            }
          },

          "info": {
            "title": "ENTITY1 Info",
            "items": [
              {
                "component": "DataTableValue",
                "config": {
                  "id": "uri",
                  "title": "URI",
                  "arrayPath": "uri"
                }
              }
            ]
          },

          "relationships": {},

          "imageGallery": {},

          "timeline": {}
        }
      }
    }
  
}
  
module.exports = detailConfig;
