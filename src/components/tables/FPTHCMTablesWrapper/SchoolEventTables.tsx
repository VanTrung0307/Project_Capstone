/* eslint-disable prettier/prettier */
import { Event, Pagination, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import React, { useEffect, useState } from 'react';
import { SchoolEventTable } from '../FPTHCMTable/SchoolEventTable';
import * as S from './FPTHCMTables.styles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

type SchoolTablesProps = {
  eventId?: string;
};

export const SchoolEventTables: React.FC<SchoolTablesProps> = ({ eventId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | undefined>(undefined);

  useEffect(() => {
    if (eventId) {
      const pagination: Pagination = { current: 1, pageSize: 10 };

      getPaginatedEvents(pagination)
        .then((response) => {
          console.log('API Response:', response);
          const eventData = response.data.find((event) => event.id === eventId);
          setEvent(eventData);
        })
        .catch((error) => {
          console.error('Error fetching paginated events:', error);
        });
    }
  }, [eventId]);

  console.log('eventname', event ? event.name : '');
  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Breadcrumbs>
          <span className="link" onClick={() => navigate('/events')}>
            {t('Bảng Sự Kiện')}
          </span>&emsp;
          <span>➤➤</span>&emsp;<span className="current">{event ? event.name : ''} </span>
          <style>
            {`
            .link {
              cursor: pointer;
              color: white;
              text-decoration: none;
              transition: color 0.3s;
            }
    
            .link:hover {
              color: #339CFD;
            }
            .current {
              color: #339CFD;
            }
           `}
          </style>
        </S.Breadcrumbs>

        <S.Card id="basic-table" padding="1.25rem 1.25rem 0">
          <div style={{ width: '400px', marginBottom: '30px' }}>
            <div style={{ overflowWrap: 'break-word' }}>
              <h1 style={{ fontWeight: 'bold' }}>{event ? `Danh sách trường của sự kiện: ${event.name}` : ''}</h1>
            </div>
          </div>
          <SchoolEventTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
