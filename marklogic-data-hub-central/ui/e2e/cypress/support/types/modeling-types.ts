export enum ConfirmationType {
  Identifer = 'identifier',
  DeleteEntity = 'deleteEntity',
  DeleteEntityRelationshipWarn = 'deleteEntityRelationshipWarn',
  DeleteEntityRelationshipOutstandingEditWarn = 'deleteEntityRelationshipOutstandingEditWarn',
  DeleteEntityNoRelationshipOutstandingEditWarn = 'deleteEntityNoRelationshipOutstandingEditWarn',
  DeleteEntityStepWarn = 'deleteEntityStepWarn',
  DeletePropertyWarn = 'deletePropertyWarn',
  DeletePropertyStepWarn = 'deletePropertyStepWarn',
  SaveEntity = 'saveEntity',
  SaveAll = 'saveAllEntity',
  RevertEntity = 'revertEntity',
  RevertAll = 'revertAllEntity',
  NavigationWarn = 'navigationWarn',
  discardChanges = 'discardChanges'
}