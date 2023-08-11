/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Auth from '@app/components/layouts/AuthLayout/AuthLayout.styles';
import React, { useEffect, useState } from 'react';

export const LockForm: React.FC = () => {
  const [dateState, setDateState] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setDateState(new Date()), 10 * 1000);
    return () => clearInterval(interval);
  }, []);

  return <Auth.FormWrapper></Auth.FormWrapper>;
};
