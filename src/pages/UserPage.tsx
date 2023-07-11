/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { UserTables } from '@app/components/tables/FPTHCMTablesWrapper/UserTables';
import React, { Suspense } from 'react';

const UserPage: React.FC = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>User</PageTitle>
        <UserTables />
      </Suspense>
    </>
  );
};

export default UserPage;
