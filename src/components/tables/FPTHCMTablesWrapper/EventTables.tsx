/* eslint-disable prettier/prettier */
import { EventTable } from '@app/components/tables/FPTHCMTable/EventTable';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as S from './FPTHCMTables.styles';

export const EventTables: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Breadcrumbs>
          <span className="link">
            {t('Bảng Sự Kiện')}
          </span>
          <style>
            {`
    .link {
      color: #339CFD;
    }
  `}
          </style>
        </S.Breadcrumbs>

        <S.Card id="basic-table" title={t('Bảng Sự Kiện')} padding="1.25rem 1.25rem 0">
          <EventTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
