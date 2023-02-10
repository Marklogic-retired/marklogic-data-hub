import {EntityProps, PropertyProps, InfoProps, RelatedConceptProps} from "types/entity-types";

interface BaseEntityProps {
  filter: number;
  amount: number;
}

interface EntityIndicatorDataProps {
  max: number;
  entities: {
    [entityName:string] : BaseEntityProps
  };
}

const mockInfoProps : InfoProps = {
  title: "Person",
  draft: false,
  version: "0.0.1",
  baseUri: "http://example.com/"
};

const mockRelatedConceptProps : RelatedConceptProps = {
  context: "category",
  conceptExpression: "sem:iri(\"http://www.example.com/Category/\" || fn:replace(fn:string(.),'\\s+', ''))",
  conceptClass: "ShoeType",
  predicate: "isCategory"
};

const mockPropertyProps: PropertyProps = {
  name: "firstname",
  ref: "",
  related: "",
  datatype: "string",
  collation: "http://marklogic.com/collation//S2"
};

const mockBaseEntityProps : BaseEntityProps = {
  filter: 2,
  amount: 5
};

const mockBaseEntityPropsNoFilter : BaseEntityProps = {
  filter: 0,
  amount: 5
};

export const mockEntitiesProps : EntityProps[] = [{
  color: "#EEEFF1",
  icon: "FaShapes",
  name: "Person",
  primaryKey: "firstname",
  properties: [mockPropertyProps],
  relatedConcepts: [mockRelatedConceptProps],
  relatedEntities: [""],
  info: mockInfoProps
}];

export const mockEntityIndicatorData : EntityIndicatorDataProps = {
  max: 10,
  entities: {"Person": mockBaseEntityProps}
};

export const mockEntityIndicatorDataNoFilter : EntityIndicatorDataProps = {
  max: 10,
  entities: {"Person": mockBaseEntityPropsNoFilter}
};