/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { TaskTables } from '@app/components/tables/FPTHCMTablesWrapper/TaskTables';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';


const TaskPage: React.FC = () => {
  const { t } = useTranslation();
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
