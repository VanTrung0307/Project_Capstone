/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { AnswerTables } from '@app/components/tables/FPTHCMTablesWrapper/AnswerTables';
import React, { Suspense } from 'react';


const AnswerPage: React.FC = () => {
  // const { t } = useTranslation();
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Answer</PageTitle>
        <AnswerTables />
      </Suspense>
    </>
  );
};

export default AnswerPage;
