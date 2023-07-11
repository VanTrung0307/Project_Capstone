/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { Tables } from '@app/components/tables/Tables/Tables';
import React, { Suspense } from 'react';

const PlayerProfliePage: React.FC = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Player Profile</PageTitle>
        <Tables />
      </Suspense>
    </>
  );
};

export default PlayerProfliePage;
