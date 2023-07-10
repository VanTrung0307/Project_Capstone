/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { PlayerTables } from '@app/components/tables/FPTHCMTablesWrapper/PlayerTables';
import React, { Suspense } from 'react';


const PlayerPage: React.FC = () => {
  // const { t } = useTranslation();
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Player</PageTitle>
        <PlayerTables />
      </Suspense>
    </>
  );
};

export default PlayerPage;
