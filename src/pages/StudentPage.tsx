/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { StudentTables } from '@app/components/tables/FPTHCMTablesWrapper/StudentTables';
import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';


const StudentPage: React.FC = () => {
  const { schoolId } = useParams();

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Student</PageTitle>
        <StudentTables schoolId={schoolId}/>
      </Suspense>
    </>
  );
};

export default StudentPage;
