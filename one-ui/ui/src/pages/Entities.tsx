import React, { useState, useContext, useEffect } from 'react';
import { Collapse, Menu } from 'antd';
import styles from './Entities.module.scss';
import { RolesContext } from '../util/roles';
import axios from 'axios'
import EntityTiles from '../components/entities/entity-tiles';

const Entities: React.FC = () => {

    useEffect(() => {
        getEntityInfo();
    },[]);

    const [entitiesInfo, setEntitiesInfo] = useState<any[]>([]);
    
    //Role based access
    const roleService = useContext(RolesContext);
    const canReadOnly = roleService.canReadMappings();
    const canReadWrite = roleService.canWriteMappings();

    const getEntityInfo = async () => {
        try {
        let response = await axios.get(`/api/entities`);
        if(response.status === 200) {
            let entData:any = {};
            response.data.map(ent => {
                entData[ent.info.title] = ent
            });
            setEntitiesInfo({...entData});
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
        entitiesInfo={entitiesInfo}
        getEntityInfo={getEntityInfo}/>
        </div>
    );

}

export default Entities;