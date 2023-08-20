/* eslint-disable prettier/prettier */
import { Event, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import { Pagination, School, getPaginatedSchools } from '@app/api/FPT_3DMAP_API/School';
import React, { useEffect, useState } from 'react';
import { EventStudentTable } from '../FPTHCMTable/EventStudentTable';
import * as S from './FPTHCMTables.styles';

type StudentTablesProps = {
  schoolId?: string;
  eventId?: string
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

  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card id="basic-table" padding="1.25rem 1.25rem 0">
          <div style={{ width: '700px' }}>
            <div style={{ overflowWrap: 'break-word' }}>
              <h1 style={{ fontWeight: 'bold' }}>
                Danh sách học sinh {school && event ? school.name : ''}
              </h1>
            </div>
          </div>
          <EventStudentTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
