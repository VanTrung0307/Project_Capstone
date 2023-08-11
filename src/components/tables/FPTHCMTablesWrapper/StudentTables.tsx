/* eslint-disable prettier/prettier */
import { Pagination, School, getPaginatedSchools } from '@app/api/FPT_3DMAP_API/School';
import React, { useEffect, useState } from 'react';
import { StudentTable } from '../FPTHCMTable/StudentTable';
import * as S from './FPTHCMTables.styles';

type StudentTablesProps = {
  schoolId?: string;
};

export const StudentTables: React.FC<StudentTablesProps> = ({ schoolId }) => {
  const [school, setSchool] = useState<School | undefined>(undefined);

  useEffect(() => {
    if (schoolId) {
      const pagination: Pagination = { current: 1, pageSize: 5 };

      getPaginatedSchools(pagination)
        .then((response) => {
          const schoolData = response.data.find((school) => school.id === schoolId);
          setSchool(schoolData);
        })
        .catch((error) => {
          console.error('Error fetching paginated events:', error);
        });
    }
  }, [schoolId]);

  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card id="basic-table" padding="1.25rem 1.25rem 0">
          <div style={{ width: '700px' }}>
            <div style={{ overflowWrap: 'break-word' }}>
              <h1 style={{ fontWeight: 'bold' }}>
                {school?.name ? `Danh sách học sinh của ${school.name}` : 'Bảng học sinh'}
              </h1>
            </div>
          </div>
          <StudentTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
