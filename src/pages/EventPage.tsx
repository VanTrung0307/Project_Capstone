/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { EventTables } from '@app/components/tables/FPTHCMTablesWrapper/EventTables';
import React, { Suspense } from 'react';


const EventPage: React.FC = () => {
  // const { t } = useTranslation();
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Event</PageTitle>
        <EventTables />
      </Suspense>
    </>
  );
};

export default EventPage;
