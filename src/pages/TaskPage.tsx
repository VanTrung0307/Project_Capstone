/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { TaskTables } from '@app/components/tables/FPTHCMTablesWrapper/TaskTables';
import React, { Suspense } from 'react';

const TaskPage: React.FC = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Task</PageTitle>
        <TaskTables />
      </Suspense>
    </>
  );
};

export default TaskPage;
