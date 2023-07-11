/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { QuestionBankTables } from '@app/components/tables/FPTHCMTablesWrapper/QuestionBankTables';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';


const QuestionBankPage: React.FC = () => {
  const { t } = useTranslation();
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
