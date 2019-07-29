import React from 'react';
import gql from "graphql-tag";
import { Query } from "react-apollo";
import EntityViewer from '../components/entity-viewer/entity-viewer';

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

const Browse: React.FC = () => {
  return (
    <Query<Data> query={GET_ALL_ENTITIES} >
      {({ loading, error, data }) => {
        if (loading) return "Loading...";
        if (error) return `Error! ${error.message}`;
  
        if (data !== undefined) {
          console.log('data response', data);
          return <EntityViewer data={data} />
        }
      }}
    </Query> 
  );
}

export default Browse;