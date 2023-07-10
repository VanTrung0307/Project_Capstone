/* eslint-disable prettier/prettier */
import { NPCTable } from '@app/components/tables/FPTHCMTable/NPCTable';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as S from './FPTHCMTables.styles';

export const NPCTables: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card id="basic-table" title={t('Bảng NPC')} padding="1.25rem 1.25rem 0">
          <NPCTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
