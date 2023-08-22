/* eslint-disable prettier/prettier */
import { Event, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import { Pagination, School, getPaginatedSchools } from '@app/api/FPT_3DMAP_API/School';
import React, { useEffect, useState } from 'react';
import { EventStudentTable } from '../FPTHCMTable/EventStudentTable';
import * as S from './FPTHCMTables.styles';
import { useNavigate } from 'react-router';

type StudentTablesProps = {
  schoolId?: string;
  eventId?: string;
};

export const EventStudentTables: React.FC<StudentTablesProps> = ({ schoolId, eventId }) => {
  const [school, setSchool] = useState<School | undefined>(undefined);
  const [event, setEvent] = useState<Event | undefined>(undefined);

  useEffect(() => {
    if (schoolId && eventId) {
      const pagination: Pagination = { current: 1, pageSize: 10 };

      getPaginatedSchools(pagination)
        .then((response) => {
          const schoolData = response.data.find((school) => school.id === schoolId);
          setSchool(schoolData);
        })
        .catch((error) => {
          console.error('Error fetching paginated events:', error);
        });

      getPaginatedEvents(pagination)
        .then((response) => {
          const eventData = response.data.find((event) => event.id === eventId);
          setEvent(eventData);
        })
        .catch((error) => {
          console.error('Error fetching paginated events:', error);
        });
    }
  }, [schoolId, eventId]);

  const navigate = useNavigate();

  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Breadcrumbs>
          <span className="link" onClick={() => navigate('/events')}>
            Bảng Sự Kiện
          </span>
          &emsp;<span>➤➤</span>
          &emsp;
          <span className="event" onClick={() => navigate(`/schools/${eventId}`)}>
            {event ? event.name : ''}{' '}
          </span>
          &emsp;<span>➤➤</span>
          &emsp;<span className="student">{school ? school.name : ''} </span>
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
              .event {
                cursor: pointer;
                color: white;
                text-decoration: none;
                white-space: nowrap;
                width: 15em;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .event:hover {
                color: #339CFD;
              }
              .student {
                color: #339CFD;
              }
            `}
          </style>
        </S.Breadcrumbs>

        <S.Card id="basic-table" padding="1.25rem 1.25rem 0">
          <div style={{ width: '400px' }}>
            <div style={{ overflowWrap: 'break-word' }}>
              <h1 style={{ fontWeight: 'bold' }}>Danh sách học sinh {school && event ? school.name : ''}</h1>
            </div>
          </div>
          <EventStudentTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
