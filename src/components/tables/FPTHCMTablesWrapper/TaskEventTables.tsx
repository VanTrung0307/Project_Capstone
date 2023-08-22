/* eslint-disable prettier/prettier */
import { Event, Pagination, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import React, { useEffect, useState } from 'react';
import { TaskEventTable } from '../FPTHCMTable/TaskEventTable';
import * as S from './FPTHCMTables.styles';
import { useNavigate } from 'react-router';

type TaskTablesProps = {
  eventId?: string;
};

export const TaskEventTables: React.FC<TaskTablesProps> = ({ eventId }) => {
  const [event, setEvent] = useState<Event | undefined>(undefined);

  useEffect(() => {
    if (eventId) {
      const pagination: Pagination = { current: 1, pageSize: 10 };

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

  const navigate = useNavigate();

  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Breadcrumbs>
          <span className="link" onClick={() => navigate('/events')}>
            Bảng Sự Kiện
          </span>
          &emsp;
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
              <h1 style={{ fontWeight: 'bold' }}>{event ? `Nhiệm vụ của sự kiện: ${event.name}` : ''}</h1>
            </div>
          </div>
          <TaskEventTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
