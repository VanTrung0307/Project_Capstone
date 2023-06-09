/* eslint-disable prettier/prettier */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TreeTable } from '../TreeTable/TreeTable';
import { XavalorTable } from '@app/components/tables/XavalorTable/XavalorTable';
import { EditableTable } from '../editableTable/EditableTable';
import * as S from './XavalorTables.styles';

export const XavalorTables: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <S.XavalorTablesWrapper>
        <S.Card id="basic-table" title={t('Player Table')} padding="1.25rem 1.25rem 0">
          <XavalorTable />
        </S.Card>
      </S.XavalorTablesWrapper>
    </>
  );
};
