import React from "react";
import PropertyTable from "../../property-table/property-table";

interface Props {
  entityTypeData: any;
  canWriteEntityModel: any;
  canReadEntityModel: any;
}

const PropertiesTab: React.FC<Props> = (props) => {

  return (
    <PropertyTable
      entityName={props.entityTypeData?.entityName}
      definitions={props.entityTypeData?.model.definitions}
      canReadEntityModel={props.canReadEntityModel}
      canWriteEntityModel={props.canWriteEntityModel}
      sidePanelView={true}
    />
  );
};

export default PropertiesTab;