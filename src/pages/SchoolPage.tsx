/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { SchoolTables } from '@app/components/tables/FPTHCMTablesWrapper/SchoolTables';
import React, { Suspense } from 'react';


const SchoolPage: React.FC = () => {
  // const { t } = useTranslation();
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>School</PageTitle>
        <SchoolTables />
      </Suspense>
    </>
  );
};

export default SchoolPage;
