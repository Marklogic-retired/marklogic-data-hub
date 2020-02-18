declareUpdate();

xdmp.documentInsert("/exp/doc1",
    {
      "envelope": {
        "instance": {
          "SearchFacetsEntity": {
            "searchStrNameFacet": "firstName1",
            "searchStrCityFacet": "Reims",
            "numRangeIntProp": 1,
            "numRangeLongProp": 1,
            "numRangeIntegerProp": 1.5,
            "numRangeFloatProp": 1.5,
            "numRangeDoubleProp": 1.5
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
            "searchStrCityFacet": "Raleigh",
            "numRangeIntProp": 10,
            "numRangeLongProp": 10,
            "numRangeIntegerProp": 10.5,
            "numRangeFloatProp": 10.5,
            "numRangeDoubleProp": 10.5
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
            "searchStrCityFacet": "ranchi",
            "numRangeIntProp": 2147483647,
            "numRangeLongProp": 650,
            "numRangeIntegerProp": 120.5,
            "numRangeFloatProp": 1500.00,
            "numRangeDoubleProp": 9.22337203685478e18
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
