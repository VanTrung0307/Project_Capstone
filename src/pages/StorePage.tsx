/* eslint-disable prettier/prettier */
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Tables } from '@app/components/tables/Tables/Tables';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';

const StorePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Stores Management</PageTitle>
        <Tables />
      </Suspense>
    </>
  );
};

export default StorePage;
