/* eslint-disable prettier/prettier */
import { message } from 'antd';
import { getPaginatedEvents } from './FPT_3DMAP_API/Event';
import { getPaginatedPlayers } from './FPT_3DMAP_API/Player';
import { getPaginatedSchools } from './FPT_3DMAP_API/School';
import { Pagination } from './table.api';
export interface fpthcmStatistic {
  id: number;
  value: number;
  unit: string;
}

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const getFPTHCMStatistics = async (): Promise<fpthcmStatistic[]> => {
  try {
    const paginatedPlayers = await getPaginatedPlayers(initialPagination);
    const playerCount = paginatedPlayers.data.length;

    const paginatedEvents = await getPaginatedEvents(initialPagination);
    const eventCount = paginatedEvents.data.length;

    const paginatedSchools = await getPaginatedSchools(initialPagination);
    const schoolCount = paginatedSchools.data.length;

    return [
      {
        id: 1,
        value: playerCount,
        unit: 'Người',
      },
      {
        id: 2,
        value: eventCount,
        unit: 'Sự kiện',
      },
      {
        id: 3,
        value: schoolCount,
        unit: 'Trường',
      },
    ];
  } catch (error) {
    message.error('Đăng nhập để xem dữ liệu');
    throw error;
  }
};
