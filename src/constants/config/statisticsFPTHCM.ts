/* eslint-disable prettier/prettier */
import { BankOutlined, ScheduleOutlined, TeamOutlined } from '@ant-design/icons';
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
    subname: 'Tổng số người chơi đã tham gia',
    color: 'success',
    Icon: TeamOutlined,
  },
  {
    id: 2,
    name: 'event',
    title: 'Sự kiện',
    subname: 'Tổng số sự kiện',
    color: 'error',
    Icon: ScheduleOutlined,
  },
  {
    id: 3,
    name: 'school',
    title: 'Trường học',
    subname: 'Tổng số trường học đã tham gia',
    color: 'primary',
    Icon: BankOutlined,
  },
];
