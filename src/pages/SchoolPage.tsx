/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { SchoolTables } from '@app/components/tables/FPTHCMTablesWrapper/SchoolTables';
import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';


const SchoolPage: React.FC = () => {
  // const { t } = useTranslation();
  const { eventId } = useParams();
  
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>School</PageTitle>
        <SchoolTables eventId={eventId}/>
      </Suspense>
    </>
  );
};

export default SchoolPage;
