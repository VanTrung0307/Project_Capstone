/* eslint-disable prettier/prettier */
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as S from './FPTHCMTables.styles';

export const PlayerTables: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card id="basic-table" title={t('Bảng Học sinh đã thành người chơi')} padding="1.25rem 1.25rem 0">
          {/* <PlayerTable /> */}
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
