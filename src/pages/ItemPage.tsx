/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { ItemTables } from '@app/components/tables/FPTHCMTablesWrapper/ItemTables';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';


const ItemPage: React.FC = () => {
  const { t } = useTranslation();
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
