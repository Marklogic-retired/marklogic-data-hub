declareUpdate();

xdmp.documentInsert("/exp/doc1",
    {
      "envelope": {
        "instance": {
          "SearchFacetsEntity": {
            "searchStrNameFacet": "firstName1",
            "searchStrCityFacet": "Reims"
          }
        }
      }
    },
    {
      permissions: xdmp.defaultPermissions(),
      collections: "doc1",
      metadata: {
        "datahubCreatedInFlow": "my-flow-1",
        "datahubCreatedByStep": "my-step-1"
      }
    });

xdmp.documentInsert("/exp/doc2",
    {
      "envelope": {
        "instance": {
          "SearchFacetsEntity": {
            "searchStrNameFacet": "firstName2",
            "searchStrCityFacet": "Raleigh"
          }
        }
      }
    },
    {
      permissions: xdmp.defaultPermissions(),
      collections: "doc2",
      metadata: {
        "datahubCreatedInFlow": "my-flow-2",
        "datahubCreatedByStep": "my-step-2"
      }
    });

xdmp.documentInsert("/exp/doc3",
    {
      "envelope": {
        "instance": {
          "SearchFacetsEntity": {
            "searchStrNameFacet": "firstName3",
            "searchStrCityFacet": "ranchi"
          }
        }
      }
    },
    {
      permissions: xdmp.defaultPermissions(),
      collections: "doc3",
      metadata: {
        "datahubCreatedInFlow": "my-flow-3",
        "datahubCreatedByStep": "my-step-3"
      }
    });
