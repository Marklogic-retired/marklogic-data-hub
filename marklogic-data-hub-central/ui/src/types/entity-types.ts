export interface InfoProps {
  title: string;
  draft: boolean;
  version: string;
  baseUri: string;
}

export interface RelatedConceptProps {
  context: string;
  conceptExpression: string;
  conceptClass: string;
  predicate: string;
}

export interface PropertyProps {
  name: string;
  ref: string;
  related: string;
  datatype: string;
  collation: any;
}

export interface EntityProps {
  color: string;
  icon: string;
  name: string;
  primaryKey: string;
  properties: PropertyProps[];
  relatedConcepts: RelatedConceptProps[];
  relatedEntities: string[];
  info: InfoProps;
}
