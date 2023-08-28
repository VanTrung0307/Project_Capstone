/* eslint-disable prettier/prettier */
import { EventSchool, getPaginatedEventSchools } from '@app/api/FPT_3DMAP_API/EventSchool';
import { Pagination } from '@app/api/FPT_3DMAP_API/School';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { EventStudentTable } from '../FPTHCMTable/EventStudentTable';
import * as S from './FPTHCMTables.styles';

type StudentTablesProps = {
  schoolId?: string;
};

export const EventStudentTables: React.FC<StudentTablesProps> = ({ schoolId }) => {
  const [school, setSchool] = useState<EventSchool | undefined>(undefined);

  useEffect(() => {
    if (schoolId) {
      console.log(schoolId);
      const pagination: Pagination = { current: 1, pageSize: 100 };

      getPaginatedEventSchools(pagination)
        .then((response) => {
          const schoolData = response.data.find((school) => school.id === schoolId);
          console.log(response.data);
          setSchool(schoolData);
        })
        
        .catch((error) => {
          console.error('Error fetching paginated events:', error);
        });
    }
  }, [schoolId]);

  const navigate = useNavigate();

  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Breadcrumbs>
          <span className="link" onClick={() => navigate('/events')}>
            Bảng Sự Kiện
          </span>
          &emsp;<span>➤➤</span>
          &emsp;<span className="student">{school ? school.schoolName : ''} </span>
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
              <h1 style={{ fontWeight: 'bold' }}>Danh sách học sinh {school ? school.schoolName : ''}</h1>
            </div>
          </div>
          <EventStudentTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
