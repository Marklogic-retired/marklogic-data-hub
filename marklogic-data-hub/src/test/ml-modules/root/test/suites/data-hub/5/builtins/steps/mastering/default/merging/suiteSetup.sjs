declareUpdate();

// Inserting documents into final database
xdmp.documentInsert("/matchSummary1.json",
    {
        "matchSummary": {
            "URIsToProcess": [
                "/merge-with-doc1.json",
                "/doc2.json"
            ],
            "actionDetails": {
                "/merge-with-doc1.json": {
                    "action": "merge",
                    "uris": [
                        "/match1.json",
                        "/match2.json"
                    ]
                },
                "/doc2.json": {
                    "action": "notify",
                    "uris": [
                        "/match3.json",
                        "/match4.json"
                    ]
                }
            }
        }
    },
    {
        permissions: xdmp.defaultPermissions(),
        collections: ["datahubMasteringMatchSummary"],
        metadata: {
            // add 1 hr to ensure this is selected first
            "datahubCreatedOn": fn.currentDateTime().add(xs.dayTimeDuration('P0DT1H'))
        }
    });

xdmp.documentInsert("/matchSummary2.json",
    {
        "matchSummary": {
            "URIsToProcess": [
                "/notify-with-doc1.json",
                "/doc2.json"
            ],
            "actionDetails": {
                "/notify-with-doc1.json": {
                    "action": "notify",
                    "uris": [
                        "/match1.json",
                        "/match2.json"
                    ]
                },
                "/doc2.json": {
                    "action": "merge",
                    "uris": [
                        "/match3.json",
                        "/match4.json"
                    ]
                }
            }
        }
    },
    {
        permissions: xdmp.defaultPermissions(),
        collections: ["datahubMasteringMatchSummary"],
        metadata: {
            "datahubCreatedOn": fn.currentDateTime()
        }
    });

xdmp.documentInsert('/match1.json',
    {
        envelope: { instance: { minimalDoc: 'value'}}
    },
    {
    permissions: xdmp.defaultPermissions(),
    collections: ["test-doc"],
    metadata: {
        "datahubCreatedOn": fn.currentDateTime()
    }
});

xdmp.documentInsert('/match2.json',
    {
        envelope: { instance: { minimalDoc: 'value'}}
    },
    {
        permissions: xdmp.defaultPermissions(),
        collections: ["test-doc"],
        metadata: {
            "datahubCreatedOn": fn.currentDateTime()
        }
    })