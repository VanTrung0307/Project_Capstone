/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { StudentTables } from '@app/components/tables/FPTHCMTablesWrapper/StudentTables';
import React, { Suspense } from 'react';


const StudentPage: React.FC = () => {
  // const { t } = useTranslation();
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Student</PageTitle>
        <StudentTables />
      </Suspense>
    </>
  );
};

export default StudentPage;
