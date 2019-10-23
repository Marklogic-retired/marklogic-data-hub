import React, { useContext } from 'react';
import { Alert, Spin } from 'antd';
import { AuthContext } from '../../util/auth-context';

const AsyncLoader: React.FC = () => {
  const { user, clearErrorMessage } = useContext(AuthContext);

  return (
    <>
    { user.error.type === 'ALERT' ? 
      <Alert 
        style={{ textAlign: "center" }} 
        message={user.error.title}  
        description={user.error.message} 
        type="error" 
        closable 
        onClose={() => clearErrorMessage()}
      /> 
      :
      <Spin tip="Loading..." style={{ margin: '100px auto', width: '100%'}} />
    }
    </>
  )
}

export default AsyncLoader;