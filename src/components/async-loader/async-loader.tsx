import React, { useContext } from 'react';
import { Alert, Spin } from 'antd';
import { AuthContext } from '../../util/auth-context';
import { SearchContext } from '../../util/search-context';

const AsyncLoader: React.FC = () => {
  const { user, clearErrorMessage } = useContext(AuthContext);
  const { resetSearchOptions } = useContext(SearchContext);

  const onClose = () => {
    clearErrorMessage();
    resetSearchOptions();
  }

  return (
    <>
    { user.error.type === 'ALERT' ? 
      <Alert 
        style={{ textAlign: "center" }} 
        message={user.error.title}  
        description={user.error.message} 
        type="error" 
        closable 
        onClose={onClose}
      /> 
      :
      <Spin tip="Loading..." style={{ margin: '100px auto', width: '100%'}} />
    }
    </>
  )
}

export default AsyncLoader;