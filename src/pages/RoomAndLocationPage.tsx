/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { RoomAndLocationTables } from '@app/components/tables/FPTHCMTablesWrapper/RoomAndLocationTables';
import React, { Suspense } from 'react';


const RoomAndLocationPage: React.FC = () => {
  // const { t } = useTranslation();
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>Room and Location</PageTitle>
        <RoomAndLocationTables />
      </Suspense>
    </>
  );
};

export default RoomAndLocationPage;
