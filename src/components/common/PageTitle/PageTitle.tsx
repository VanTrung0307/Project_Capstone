/* eslint-disable prettier/prettier */
import { WithChildrenProps } from '@app/types/generalTypes';
import React from 'react';
import { Helmet } from 'react-helmet-async';

export const PageTitle: React.FC<WithChildrenProps> = () => {
  return (
    <Helmet>
      <title>FPT_HCM Adventures Admin</title>
    </Helmet>
  );
};
