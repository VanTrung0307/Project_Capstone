/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { HistoryPlayerTables } from '@app/components/tables/FPTHCMTablesWrapper/HistoryPlayerTables';
import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';

const PlayerPage: React.FC = () => {
  // const { t } = useTranslation();
  const { playerId } = useParams();
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>History Player</PageTitle>
        <HistoryPlayerTables playerId={playerId} />
      </Suspense>
    </>
  );
};

export default PlayerPage;
