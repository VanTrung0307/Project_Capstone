/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { XavalorTables } from '@app/components/tables/XavalorTablesWrapper/XavalorTables';
import React, { Suspense } from 'react';


const PlayerPage: React.FC = () => {
  // const { t } = useTranslation();
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Player</PageTitle>
        <XavalorTables />
      </Suspense>
    </>
  );
};

export default PlayerPage;
