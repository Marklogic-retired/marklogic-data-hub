import React from "react";
import PropertyTable from "../../property-table/property-table";
import ModelingLegend from "../../modeling-legend/modeling-legend";

interface Props {
  entityTypeData: any;
  dataModel: any;
  canWriteEntityModel: any;
  canReadEntityModel: any;
  updateSavedEntity: any;
}


const PropertiesTab: React.FC<Props> = (props) => {
  const {entityTypeData, dataModel, canWriteEntityModel, canReadEntityModel, updateSavedEntity} = props;

  return (
    <div className={`divPropertyTable`}>
      <div><ModelingLegend/></div>
      <PropertyTable
        entityName={entityTypeData?.entityName}
        definitions={entityTypeData?.model.definitions}
        canReadEntityModel={canReadEntityModel}
        canWriteEntityModel={canWriteEntityModel}
        sidePanelView={true}
        updateSavedEntity={updateSavedEntity}
        dataModel={dataModel}
      />
    </div>
  );
};

export default PropertiesTab;
