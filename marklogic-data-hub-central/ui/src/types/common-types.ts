export enum ConfirmationType {
  Identifer = "identifier",
  DeleteEntity = "deleteEntity",
  DeleteEntityRelationshipWarn = "deleteEntityRelationshipWarn",
  DeleteEntityRelationshipOutstandingEditWarn = "deleteEntityRelationshipOutstandingEditWarn",
  DeleteEntityNoRelationshipOutstandingEditWarn = "deleteEntityNoRelationshipOutstandingEditWarn",
  DeleteEntityStepWarn = "deleteEntityStepWarn",
  DeleteEntityWithForeignKeyReferences = "deleteEntityWithForeignKeyReferences",
  DeleteEntityPropertyWithForeignKeyReferences = "deleteEntityPropertyWithForeignKeyReferences",
  DeletePropertyWarn = "deletePropertyWarn",
  DeletePropertyStepWarn = "deletePropertyStepWarn",
  ModuleNotFound = "moduleNotFound",
  MissingParameterFunction = "missingParameterFunction",
  SaveEntity = "saveEntity",
  SaveAll = "saveAllEntity",
  RevertEntity = "revertEntity",
  RevertAll = "revertAllEntity",
  NavigationWarn = "navigationWarn",
  DeleteStep = "deleteStep",
  AddStepToFlow = "addStepToFlow",
  DiscardChanges = "discardChanges",
  PublishAll = "publishAllEntity",
  RevertChanges = "revertEntityChanges",
  PropertyName = "propertyName",
  DeleteConceptClass = "deleteConceptClass",
  DeleteConceptClassWithRelatedEntityTypes = "deleteConceptClassWithRelatedEntityTypes",
  DeleteNotificationRow = "deleteNotificationRow"
}

declare global {
  interface Window {
    pendo: any,
    usePendo: any,
    graphVisApi: any,
    graphVisExploreApi: any
  }
}
