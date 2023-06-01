/* eslint-disable prettier/prettier */
import { ScheduleOutlined, ShoppingOutlined, TeamOutlined } from '@ant-design/icons';
import { FC } from 'react';

export type StatisticColor = 'primary' | 'error' | 'secondary' | 'success';

interface ConfigXavaloStatistic {
  id: number;
  name: string;
  title: string;
  color: StatisticColor;
  Icon: FC;
}

export const xavalo_statistics: ConfigXavaloStatistic[] = [
  {
    id: 1,
    name: 'player',
    title: 'Người chơi',
    color: 'success',
    Icon: TeamOutlined,
  },
  {
    id: 2,
    name: 'event',
    title: 'Sự kiện',
    color: 'error',
    Icon: ScheduleOutlined,
  },
  {
    id: 3,
    name: 'order',
    title: 'Đơn hàng',
    color: 'primary',
    Icon: ShoppingOutlined,
  },
];
