/* eslint-disable prettier/prettier */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StudentTable } from '../FPTHCMTable/StudentTable';
import * as S from './FPTHCMTables.styles';

export const StudentTables: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card id="basic-table" title={t('Bảng Học Sinh')} padding="1.25rem 1.25rem 0">
          <StudentTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
