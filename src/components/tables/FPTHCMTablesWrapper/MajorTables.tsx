/* eslint-disable prettier/prettier */
import { MajorTable } from '@app/components/tables/FPTHCMTable/MajorTable';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as S from './FPTHCMTables.styles';

export const MajorTables: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card id="basic-table" title={t('Bảng Ngành đào tạo')} padding="1.25rem 1.25rem 0">
          <MajorTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
