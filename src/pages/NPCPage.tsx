/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { NPCTables } from '@app/components/tables/FPTHCMTablesWrapper/NPCTables';
import React, { Suspense } from 'react';


const NPCPage: React.FC = () => {
  // const { t } = useTranslation();
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Player</PageTitle>
        <NPCTables />
      </Suspense>
    </>
  );
};

export default NPCPage;
