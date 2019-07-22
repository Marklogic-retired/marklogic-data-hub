import React from 'react';
import gql from "graphql-tag";
import { Query } from "react-apollo";
import LoginForm from '../components/test-login';

interface Data {
  getAllEntities: Array<any>
};

const GET_ALL_ENTITIES = gql`
  query { 
    getAllEntities {
      title
      idField
      baseUri
      triple {
        subject
      }
      definitions{
        idField
        name
        primaryKey
        properties {
          name
          type
          collation
          ref
          item {
            name
            type
            refPath
          }
        }
      }
    }
  }
  `;

const Example: React.FC = () => {
  return (
    <div>
      <LoginForm/>
      <Query<Data> query={GET_ALL_ENTITIES} >
        {({ loading, error, data }) => {
          if (loading) return "Loading...";
          if (error) return `Error! ${error.message}`;
    
          if (data !== undefined) {
            console.log('data response', data);
            const renderEntities = data.getAllEntities.map((entity: any, index: number) => {

              const renderDefinitions = entity.definitions.map((definition: any, index: number) => {

                const renderProperties = definition.properties.map((property: any, index: number) => {

                  const renderItems = property.item && (
                    <div className="item-container">
                      <h4>Item</h4>
                      {property.item.name &&
                      <h6 className="item-name">name: {property.item.name}</h6>}
                      {property.item.type &&
                      <h6 className="item-type">type: {property.item.type}</h6>}
                      {property.item.refPath &&
                      <h6 className="item-ref">ref: {property.item.refPath}</h6>}
                    </div>
                  );

                  return (
                    <div className="property-container" key={index}>
                      <h3>Property</h3>
                      {property.name &&
                      <h5 className="property-name">Name: {property.name}</h5>}
                      {property.type &&
                      <h6 className="property-id">Type: {property.type}</h6>}
                      {property.collation &&
                      <h6 className="primaryKey">Collation: {property.collation}</h6>}
                      {property.ref &&
                      <h6 className="primaryKey">Ref: {property.ref}</h6>}
                      {renderItems}
                    </div>
                  )
                });

                return (
                  <div className="definition-container" key={index}>
                    <h2>Definition</h2>
                    {definition.name &&
                    <h3 className="def-name">Name: {definition.name}</h3>}
                    {definition.idField &&
                    <h4 className="def-id">Id: {definition.idField}</h4>}
                    {definition.primaryKey &&
                    <h4 className="primaryKey">Primary Key: {definition.primaryKey}</h4>}
                    {renderProperties}
                  </div>
                )
              });

              return (
                <div className="entity-container" key={index}>
                  <h1>Entity</h1>
                  {entity.title &&
                  <h1 className="entity-title">Title: {entity.title}</h1>}
                  {entity.idField &&
                  <h2 className="entity-id">Id: {entity.idField}</h2>}
                  {entity.baseUri &&
                  <h2 className="baseUri">BaseUri: {entity.baseUri}</h2>}
                  {renderDefinitions}
                </div>
              )
            });

            return (
              <>
                {renderEntities}
              </>
            );
          }
        }}
      </Query> 
    </div>
  );
}

export default Example;