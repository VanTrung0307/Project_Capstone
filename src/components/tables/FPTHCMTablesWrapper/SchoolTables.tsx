/* eslint-disable prettier/prettier */
import { SchoolTable } from '@app/components/tables/FPTHCMTable/SchoolTable';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as S from './FPTHCMTables.styles';
import { Event, Pagination, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';

type SchoolTablesProps = {
  eventId?: string;
};

export const SchoolTables: React.FC<SchoolTablesProps> = ({ eventId }) => {
  const { t } = useTranslation();
  const [event, setEvent] = useState<Event | undefined>(undefined);

  useEffect(() => {
    if (eventId) {
      const pagination: Pagination = { current: 1, pageSize: 5 };

      getPaginatedEvents(pagination)
        .then((response) => {
          const eventData = response.data.find((event) => event.id === eventId);
          setEvent(eventData);
        })
        .catch((error) => {
          console.error('Error fetching paginated events:', error);
        });
    }
  }, [eventId]);

  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card id="basic-table" padding="1.25rem 1.25rem 0">
          <div style={{ width: '700px' }}>
            <div style={{ overflowWrap: 'break-word' }}>
              <h1 style={{ fontWeight: 'bold' }}>
                {event?.name ? `Danh sách trường của sự kiện: ${event.name}` : 'Bảng Trường Trung Học Phổ Thông'}
              </h1>
            </div>
          </div>
          <SchoolTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
