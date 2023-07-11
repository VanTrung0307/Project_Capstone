/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { GiftTables } from '@app/components/tables/FPTHCMTablesWrapper/GiftTables';
import React, { Suspense } from 'react';

const GiftPage: React.FC = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Gift</PageTitle>
        <GiftTables />
      </Suspense>
    </>
  );
};

export default GiftPage;
