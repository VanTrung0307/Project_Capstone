/* eslint-disable prettier/prettier */
import { RankTable } from '@app/components/tables/FPTHCMTable/RankTable';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as S from './FPTHCMTables.styles';

export const RankTables: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card id="basic-table" title={t('Bảng Xếp hạng')} padding="1.25rem 1.25rem 0">
          <RankTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
