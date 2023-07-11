/* eslint-disable prettier/prettier */
import { SchoolTable } from '@app/components/tables/FPTHCMTable/SchoolTable';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as S from './FPTHCMTables.styles';

export const SchoolTables: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card id="basic-table" title={t('Bảng Trường Trung Học Phổ Thông')} padding="1.25rem 1.25rem 0">
          <SchoolTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
