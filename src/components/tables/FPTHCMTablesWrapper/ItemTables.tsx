/* eslint-disable prettier/prettier */
import { ItemTable } from '@app/components/tables/FPTHCMTable/ItemTable';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as S from './FPTHCMTables.styles';

export const ItemTables: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card id="basic-table" title={t('Bảng Vật phẩm ảo')} padding="1.25rem 1.25rem 0">
          <ItemTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
