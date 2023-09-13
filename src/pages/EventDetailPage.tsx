/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { EventDetails } from '@app/components/tables/FPTHCMTablesWrapper/EventDetails';
import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';


const EventDetailPage: React.FC = () => {
  const { eventId } = useParams();
  
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>EventDetail</PageTitle>
        <EventDetails eventId={eventId}/>
      </Suspense>
    </>
  );
};

export default EventDetailPage;
