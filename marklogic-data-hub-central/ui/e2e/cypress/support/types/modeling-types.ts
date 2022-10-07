export enum ConfirmationType {
  Identifer = "identifier",
  DeleteEntity = "deleteEntity",
  DeleteEntityRelationshipWarn = "deleteEntityRelationshipWarn",
  DeleteEntityRelationshipOutstandingEditWarn = "deleteEntityRelationshipOutstandingEditWarn",
  DeleteEntityNoRelationshipOutstandingEditWarn = "deleteEntityNoRelationshipOutstandingEditWarn",
  DeleteEntityStepWarn = "deleteEntityStepWarn",
  DeletePropertyWarn = "deletePropertyWarn",
  DeletePropertyStepWarn = "deletePropertyStepWarn",
  RevertEntity = "revertEntity",
  NavigationWarn = "navigationWarn",
  discardChanges = "discardChanges",
  PublishAll = "publishAllEntity",
  RevertChanges = "revertEntityChanges",
  PropertyName = "propertyName",
  DeleteConceptClass = "deleteConceptClass",
  DeleteConceptClassWithRelatedEntityTypes = "deleteConceptClassWithRelatedEntityTypes"
}
