import React, { FunctionComponent, useState } from 'react';
import { Button } from 'antd';
// React Hooks with TypeScript
// our components props accept a number for the initial value
// defaults to 0 if no initial value
const Counter:FunctionComponent<{ initial?: number }> = ({ initial = 0 }) => {
  // since we pass a number here, clicks is going to be a number.
  // setClicks is a function that accepts either a number or a function returning
  // a number
  const [clicks, setClicks] = useState(initial);
  return <>
    <p>Clicks: {clicks}</p>
    <Button type="primary" onClick={() => setClicks(clicks+1)}>+</Button>
    <Button type="danger" onClick={() => setClicks(clicks-1)}>-</Button>
  </>
}

export default Counter;