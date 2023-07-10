/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { FPTHCMTables } from '@app/components/tables/FPTHCMTablesWrapper/FPTHCMTables';
import React, { Suspense } from 'react';


const PlayerPage: React.FC = () => {
  // const { t } = useTranslation();
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Player</PageTitle>
        <FPTHCMTables />
      </Suspense>
    </>
  );
};

export default PlayerPage;
