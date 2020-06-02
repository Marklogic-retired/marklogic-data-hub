import React from 'react';
import { Modal } from 'antd';

import { ConfirmationType } from '../../types/modeling-types';

type Props = {
  isVisible: boolean;
  type: ConfirmationType;
  boldTextArray: string[];
  toggleModal: (isVisible: boolean) => void;
  confirmAction: () => void;
};

const ConfirmationModal: React.FC<Props> = (props) => {

  return (
    <Modal
      visible={props.isVisible} 
      closable={true}
      title="Confirmation" 
      cancelText="No"
      cancelButtonProps={{ id: 'confirm-modal-no'}}
      onCancel={() => props.toggleModal(false)} 
      okText="Yes"
      onOk={() => props.confirmAction()}
      okButtonProps={{ id: 'confirm-modal-yes'}}
      maskClosable={false}
    >
      {  props.type === ConfirmationType.identifer && (
        <>
          <p>Each entity type is allowed a maximum of one identifier. The current identifier is <b>{props.boldTextArray[0]}</b>.
          Choosing a different identifier could affect custom applications and other code that uses <b>{props.boldTextArray[0]}</b> for searching.</p>
          
          <p>Are you sure you want to change the identifier from <b>{props.boldTextArray[0]}</b> to <b>{props.boldTextArray[1]}</b>?</p>
        </>
        )
      }
    </Modal>
  )
}

export default ConfirmationModal;