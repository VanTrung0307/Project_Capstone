/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { FPTHCMTables } from '@app/components/tables/FPTHCMTablesWrapper/FPTHCMTables';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';


const GiftPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Gift</PageTitle>
        <FPTHCMTables />
      </Suspense>
    </>
  );
};

export default GiftPage;
