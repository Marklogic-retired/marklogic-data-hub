import React, { useContext } from 'react';
import { Alert } from 'antd';
import { UserContext } from '../../util/user-context';
import { SearchContext } from '../../util/search-context';
import { MLSpin } from '@marklogic/design-system';

const AsyncLoader: React.FC = () => {
  const { user, clearErrorMessage } = useContext(UserContext);
  const { resetSearchOptions } = useContext(SearchContext);

  const onClose = () => {
    clearErrorMessage();
    resetSearchOptions();
  };

  return (
    <>
    { user.error.type === 'ALERT' ? 
      <Alert 
        style={{ textAlign: "center" }} 
        message={user.error.title}  
        description={user.error.message} 
        type="error" 
        data-cy="alert-error-message"
        closable 
        onClose={onClose}
      /> 
      :
      <MLSpin data-testid="spinner" tip="Loading..." style={{ margin: '100px auto', width: '100%'}} />
    }
    </>
  );
};

export default AsyncLoader;
