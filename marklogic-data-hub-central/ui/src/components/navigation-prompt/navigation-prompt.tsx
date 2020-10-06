import React, { useEffect, useRef, useContext } from 'react';
import { ModelingContext } from '../../util/modeling-context';

const NavigationPrompt: React.FC = () => {
  const hasUnsavedChanges = useRef(false);
  const { modelingOptions } = useContext(ModelingContext);

  useEffect(() => {
    window.addEventListener("beforeunload", onUnload);

    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

  useEffect(() => {
    hasUnsavedChanges.current = modelingOptions.isModified;
  }, [modelingOptions.isModified]);

  const onUnload = (e) => {
    e.preventDefault();
    if (hasUnsavedChanges.current) {
      return e.returnValue = 'message';
    }
  };

  return null;
};

export default NavigationPrompt;
