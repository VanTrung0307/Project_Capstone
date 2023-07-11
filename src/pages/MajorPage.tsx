/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { MajorTables } from '@app/components/tables/FPTHCMTablesWrapper/MajorTables';
import React, { Suspense } from 'react';

const MajorPage: React.FC = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Major</PageTitle>
        <MajorTables />
      </Suspense>
    </>
  );
};

export default MajorPage;
