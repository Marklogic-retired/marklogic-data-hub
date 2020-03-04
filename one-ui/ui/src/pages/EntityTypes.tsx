import React, { useState, useContext, useEffect } from 'react';
import { Collapse, Menu } from 'antd';
import styles from './EntityTypes.module.scss';
import { RolesContext } from '../util/roles';
import axios from 'axios'
import EntityTiles from '../components/entities/entity-tiles';

const EntityTypes: React.FC = () => {

    useEffect(() => {
        getEntityModels();
    },[]);

    const [entityModels, setEntityModels] = useState<any[]>([]);
    
    //Role based access
    const roleService = useContext(RolesContext);
    const canReadOnly = roleService.canReadMappings();
    const canReadWrite = roleService.canWriteMappings();

    const getEntityModels = async () => {
        try {
        let response = await axios.get(`/api/entities`);
        if(response.status === 200) {
            let entModels:any = {};
            response.data.map(ent => {
                entModels[ent.info.title] = ent
            });
            setEntityModels({...entModels});
        }
            
              console.log('GET Entities Info API Called successfully!');
             
          } catch (error) {
              let message = error;
              console.log('Error while fetching entities Info', message);
          }

    }
    

    return (
        <div className={styles.entityContainer}>
        
        <EntityTiles
        canReadWrite={canReadWrite}
        canReadOnly={canReadOnly}
        entityModels={entityModels}
        getEntityModels={getEntityModels}/>
        </div>
    );

}

export default EntityTypes;