/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { TaskEventTables } from '@app/components/tables/FPTHCMTablesWrapper/TaskEventTables';
import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';

const TaskEventPage: React.FC = () => {
  const { eventId } = useParams();

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Task</PageTitle>
        <TaskEventTables eventId={eventId}/>
      </Suspense>
    </>
  );
};

export default TaskEventPage;
