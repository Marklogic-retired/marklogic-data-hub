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
        previewNonMatchedDataActivity?: {},
        previewNonMatchedDataValue?: number,
        rulesetData?: [],
        rulesetNonMatchedData?: [],
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
    }
    curateEntityTable?: {
        optionsPagesTable?: typeof paginationMapping,
        filterMainTable?: {},
        expandedTableKeys?: {},
        entityProperties?: any[],
        mainTableCollapsed?: {},
        columnOptions?: any,
        lowerEntityColumns?: any,
        entityColumns?:any,
        pageSizeTable?: {},
        pageNumberTable?: {},
        selectedValues?:string[],
    },
    monitorStepsFlowsTable: {
        expandedTableKeys: [],
        filteredColumns?:[],
        columnOptions?:any,
        pageSizeTable?: number,
        pageNumberTable?: number,
        sortColumnName: string,
        sortColumn: string
    },
    explore?: {
        graphView?:{
            relationshipLabels?: boolean,
            concepts?: boolean,
            physicsAnimation?: boolean,
        },
        resultsTable?: {
            expandedTableKeys: Array<any>,
            expandedNestedTableKeys: Array<any>,
        },
        snippetView?: {
            expandedItems: Array<any>,
        },
    }
};