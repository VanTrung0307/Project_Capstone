/* eslint-disable prettier/prettier */
import { AnswerTable } from '@app/components/tables/FPTHCMTable/AnswerTable';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as S from './FPTHCMTables.styles';

export const AnswerTables: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card id="basic-table" title={t('Bảng câu trả lời')} padding="1.25rem 1.25rem 0">
          <AnswerTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
