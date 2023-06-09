/* eslint-disable prettier/prettier */
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Tables } from '@app/components/tables/Tables/Tables';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';

const DataTablesPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>{t('common.dataTables')}</PageTitle>
        <Tables />
      </Suspense>
    </>
  );
};

export default DataTablesPage;
