/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { QuestionBankTables } from '@app/components/tables/FPTHCMTablesWrapper/QuestionBankTables';
import React, { Suspense } from 'react';

const QuestionBankPage: React.FC = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>QuestionBank</PageTitle>
        <QuestionBankTables />
      </Suspense>
    </>
  );
};

export default QuestionBankPage;
