/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { EventStudentTables } from '@app/components/tables/FPTHCMTablesWrapper/EventStudentTables';
import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';

const EventStudentPage: React.FC = () => {
  const { schoolId } = useParams();

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Student</PageTitle>
        <EventStudentTables schoolId={schoolId}/>
      </Suspense>
    </>
  );
};

export default EventStudentPage;
