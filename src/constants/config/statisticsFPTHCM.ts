/* eslint-disable prettier/prettier */
import { GiftOutlined, ScheduleOutlined, TeamOutlined } from '@ant-design/icons';
import { FC } from 'react';

export type StatisticColor = 'primary' | 'error' | 'secondary' | 'success';

interface ConfigFPTHCMStatistic {
  id: number;
  name: string;
  subname: string;
  title: string;
  color: StatisticColor;
  Icon: FC;
}

export const fpthcm_statistics: ConfigFPTHCMStatistic[] = [
  {
    id: 1,
    name: 'player',
    title: 'Người chơi',
    subname: 'Tổng số người chơi hôm nay tham gia',
    color: 'success',
    Icon: TeamOutlined,
  },
  {
    id: 2,
    name: 'event',
    title: 'Sự kiện',
    subname: 'Tổng số sự kiện hôm nay sẽ diễn ra',
    color: 'error',
    Icon: ScheduleOutlined,
  },
  {
    id: 3,
    name: 'gift',
    title: 'Phần Quà',
    subname: 'Tổng số phần quà hôm nay',
    color: 'primary',
    Icon: GiftOutlined,
  },
];
