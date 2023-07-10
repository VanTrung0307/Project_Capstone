/* eslint-disable prettier/prettier */
import { TaskTable } from '@app/components/tables/FPTHCMTable/TaskTable';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as S from './FPTHCMTables.styles';

export const TaskTables: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card id="basic-table" title={t('Bảng Nhiệm vụ')} padding="1.25rem 1.25rem 0">
          <TaskTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
