/* eslint-disable prettier/prettier */
import { QuestionBankTable } from '@app/components/tables/FPTHCMTable/QuestionBankTable';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as S from './FPTHCMTables.styles';

export const QuestionBankTables: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card id="basic-table" title={t('Bảng Ngân hàng câu hỏi')} padding="1.25rem 1.25rem 0">
          <QuestionBankTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
