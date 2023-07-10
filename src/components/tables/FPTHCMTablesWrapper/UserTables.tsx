/* eslint-disable prettier/prettier */
import { UserTable } from '@app/components/tables/FPTHCMTable/UserTable';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as S from './FPTHCMTables.styles';

export const UserTables: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card id="basic-table" title={t('Bảng Học sinh đã đăng ký')} padding="1.25rem 1.25rem 0">
          <UserTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
