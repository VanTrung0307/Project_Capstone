/* eslint-disable prettier/prettier */
import { RoomAndLocationTable } from '@app/components/tables/FPTHCMTable/RoomAndLocationTable';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as S from './FPTHCMTables.styles';

export const RoomAndLocationTables: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card id="basic-table" title={t('Bảng Vị trí & Phòng')} padding="1.25rem 1.25rem 0">
          <RoomAndLocationTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
