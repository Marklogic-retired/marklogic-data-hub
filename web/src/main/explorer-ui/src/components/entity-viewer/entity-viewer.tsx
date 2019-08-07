import React from 'react';
import styles from './entity-viewer.module.scss';

type Props = { data: any };

const EntityViewer:React.FC<Props> = ({ data = null }) => {

  const renderEntities = data && data.getAllEntities.map((entity: any, index: number) => {

    const renderDefinitions = data && entity.definitions.map((definition: any, index: number) => {

      const renderProperties = data && definition.properties.map((property: any, index: number) => {

        const renderItems = property.item && (
          <div className={styles.itemContainer}>
            <h4>Item</h4>
            {property.item.name && (
              <h6 id={`item-name-${property.item.name}`}>name: {property.item.name}</h6>
            )}
            {property.item.type && (
              <h6 id={`item-type-${property.item.type}`}>type: {property.item.type}</h6>
            )}
            {property.item.refPath && (
              <h6 id={`item-ref-${property.item.refPath}`}>ref: {property.item.refPath}</h6>
            )}
          </div>
        );

        return (
          <div className={styles.propertyContainer} key={property.name}>
            <h3>Property</h3>
            {property.name && (
              <h5 id={`property-name-${property.name}`}>Name: {property.name}</h5>
            )}
            {property.type && (
              <h6 id={`property-type-${property.type}`}>Type: {property.type}</h6>
            )}
            {property.collation && (
              <h6 id={`property-collation-${property.collation}`}>Collation: {property.collation}</h6>
            )}
            {property.ref && (
              <h6 id={`property-ref-${property.ref}`}>Ref: {property.ref}</h6>
            )}
            {renderItems}
          </div>
        )
      });

      return (
        <div className={styles.definitionContainer} key={definition.name}>
          <h2>Definition</h2>
          {definition.name && (
            <h3 id={`definition-name-${definition.name}`}>Name: {definition.name}</h3>
          )}
          {definition.idField && (
            <h4 id={`definition-id-${definition.idField}`}>Id: {definition.idField}</h4>
          )}
          {definition.primaryKey && (
            <h4 id={`definition-primary-key-${definition.primaryKey}`}>Primary Key: {definition.primaryKey}</h4>
          )}
          {renderProperties}
        </div>
      )
    });

    return (
      <div className={styles.entityContainer} key={index}>
        <h1>Entity</h1>
        {entity.title && (
          <h1 id={`entity-title-${entity.title}`}>Title: {entity.title}</h1>
        )}
        {entity.idField && (
          <h2 id={`entity-id-${entity.idField}`}>Id: {entity.idField}</h2>
        )}
        {entity.baseUri && (
          <h2 id={`entity-baseuri-${entity.baseUri}`}>BaseUri: {entity.baseUri}</h2>
        )}
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

export default EntityViewer;