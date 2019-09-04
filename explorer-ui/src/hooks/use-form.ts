import { useState } from 'react';

const useForm = (initialValues: any, callback: any) => {

  const [values, setValues] = useState(initialValues);

  const handleSubmit = (event) => {
    if (event) event.preventDefault();
      callback();
  };

  const handleChange = (event) => {
    event.persist();
    setValues(values => ({ ...values, [event.target.id]: event.target.value }));
  };

  return {
    handleChange,
    handleSubmit,
    values,
  }
};

export default useForm;