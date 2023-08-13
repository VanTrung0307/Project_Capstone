/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { SchoolEventTables } from '@app/components/tables/FPTHCMTablesWrapper/SchoolEventTables';
import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';


const SchoolEventPage: React.FC = () => {
  const { eventId } = useParams();
  
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>SchoolEvent</PageTitle>
        <SchoolEventTables eventId={eventId}/>
      </Suspense>
    </>
  );
};

export default SchoolEventPage;
