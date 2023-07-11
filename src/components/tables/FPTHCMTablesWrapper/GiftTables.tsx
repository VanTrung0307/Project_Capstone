/* eslint-disable prettier/prettier */
import { GiftTable } from '@app/components/tables/FPTHCMTable/GiftTable';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as S from './FPTHCMTables.styles';

export const GiftTables: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card id="basic-table" title={t('Bảng Quà Tặng')} padding="1.25rem 1.25rem 0">
          <GiftTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
