/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { ItemTables } from '@app/components/tables/FPTHCMTablesWrapper/ItemTables';
import React, { Suspense } from 'react';

const ItemPage: React.FC = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Item</PageTitle>
        <ItemTables />
      </Suspense>
    </>
  );
};

export default ItemPage;
