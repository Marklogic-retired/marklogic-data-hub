import React from 'react';
import gql from "graphql-tag";
import { Query } from "react-apollo";
import Counter from '../components/test';

interface Data {
  getEntityByTitle: {
    title: string,
    baseUri: string,
    entityDefinitions: Array<{ name: string, properties: any }>;
  }
};

interface Variables {
  title: string;
};


const GET_ENTITY = gql`
  query getEntityModel($title: String!) { 
    getEntityByTitle(title: $title){
      title
      baseUri
      entityDefinitions {
        name
        properties {
          name
          description
          datatype
        }
      }
    }
  }
  `;

const Home: React.FC = () => {
  const title = 'Race';
  return (
    <div>
      Home View
      <Counter initial={10}/>
      <Query<Data, Variables> query={GET_ENTITY} variables={{ title }}>
        {({ loading, error, data }) => {
          if (loading) return "Loading...";
          if (error) return `Error! ${error.message}`;
    
          if (data !== undefined) {
            console.log('data response', data);
            return (
              <div>
                <h1>{data.getEntityByTitle.title}</h1>
              </div>
            );
          }
        }}
      </Query> 
    </div>
  );
}



export default Home;