import React from 'react';
import gql from "graphql-tag";
import ReactJson from 'react-json-view';
import { Query } from "react-apollo";
import Counter from '../components/test';
import exampleJson from '../assets/example';

interface Data {
  getEntityByTitle: any
};

interface Variables {
  title: string;
};


const GET_ENTITY = gql`
  query getEntityModel($title: String!) { 
    getEntityByTitle(title: $title){
      title
      baseUri
      definitions {
        name
        properties {
          name
          description
          type
        }
      }
    }
  }
  `;

const Home: React.FC = () => {
  const title = 'Race';
  return (
    <React.Fragment>
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
      <ReactJson src={exampleJson} />
    </React.Fragment>
  );
}



export default Home;