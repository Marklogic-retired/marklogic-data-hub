import React from "react";
import PropertyTable from "../../property-table/property-table";
import ModelingLegend from "../../modeling-legend/modeling-legend";

interface Props {
  entityTypeData: any;
  canWriteEntityModel: any;
  canReadEntityModel: any;
  updateSavedEntity: any;
}


const PropertiesTab: React.FC<Props> = (props) => {

  return (
    <div>
      <div><ModelingLegend/></div>
      <PropertyTable
        entityName={props.entityTypeData?.entityName}
        definitions={props.entityTypeData?.model.definitions}
        canReadEntityModel={props.canReadEntityModel}
        canWriteEntityModel={props.canWriteEntityModel}
        sidePanelView={true}
        updateSavedEntity={props.updateSavedEntity}
      />
    </div>
  );
};

export default PropertiesTab;