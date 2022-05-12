export type ViewSettingsType = {
    load?: {
        page?: number,
        viewMode?: string,
        sortOrder?: {
            columnKey?: string,
            order?: string
        },
    },

    model?: {
        entityExpandedRows?: string[],
        propertyExpandedRows?: string[],
        sortOrder?: {
            columnKey?: string,
            order?: string
        },
    },
    curate?: {
        stepArtifact?: any,
        modelDefinition?: any,
        entityType?: string
    },
    match?: {
        rulesetExpanded?: boolean,
        editRulesetTimeline?: boolean,
        rulesetTextExpanded?: boolean,
        editThresholdTimeline?: boolean,
        thresholdTextExpanded?: boolean,
        testRadioSelection?: number,
        previewMatchedDataActivity?: {},
        previewMatchedDataValue?: number,
        rulesetData?: [],
        uriTestClicked?: boolean,
        uriTableData1?: any [],
        uriTableData2?: any [],
        inputUriState?: boolean,
        inputUri2State?: boolean
    },
    run?: {
        openFlows?: string[],
    },
};
