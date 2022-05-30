import {paginationMapping} from "@config/mapping.config";

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
        filter?: string,
        entityExpandedRows?: string[],
        propertyExpandedRows?: string[],
        sortOrder?: {
            columnKey?: string,
            order?: string
        },
        currentTab?: string
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
        uriTableData1?: any[],
        uriTableData2?: any[],
        inputUriState?: boolean,
        inputUri2State?: boolean
    },
    curateTile?: {
        activeAccordeon?: string[],
        activeTabs?: string[],
    },
    merge?: {
        strategyExpandedRows?: string[],
        strategySortOrder?: {
            columnKey?: string,
            order?: string
        }
        ruleSortOrder?: {
            columnKey?: string,
            order?: string
        }
    },
    run?: {
        openFlows?: string[],
    },
    curateMappingSourceSide?: {
        xmlTable?: {
            stepArtifactName: string,
            optionsPagesTable?: typeof paginationMapping,
            filterTable?: string,
            expandedTableKeys?: number[]
        },
        jsonTable?: {
            stepArtifactName: string,
            optionsPagesTable?: typeof paginationMapping,
            filterTable?: string,
            expandedTableKeys?: number[]
        }
    },
};
