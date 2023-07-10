/* eslint-disable prettier/prettier */
import { FPTHCMTable } from '@app/components/tables/FPTHCMTable/FPTHCMTable';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as S from './FPTHCMTables.styles';

export const FPTHCMTables: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card id="basic-table" title={t('Player Table')} padding="1.25rem 1.25rem 0">
          <FPTHCMTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
