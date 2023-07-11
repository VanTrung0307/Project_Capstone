/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { RankTables } from '@app/components/tables/FPTHCMTablesWrapper/RankTables';
import React, { Suspense } from 'react';

const RankPage: React.FC = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Rank</PageTitle>
        <RankTables />
      </Suspense>
    </>
  );
};

export default RankPage;
