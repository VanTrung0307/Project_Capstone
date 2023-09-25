/* eslint-disable prettier/prettier */
import { FC } from 'react';
import { BsFillCalendar2EventFill } from 'react-icons/bs';
import { FaSchool } from 'react-icons/fa';
import { PiGameControllerFill } from 'react-icons/pi';

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
    Icon: PiGameControllerFill,
  },
  {
    id: 2,
    name: 'event',
    title: 'Sự kiện',
    subname: 'Tổng số sự kiện',
    color: 'error',
    Icon: BsFillCalendar2EventFill,
  },
  {
    id: 3,
    name: 'school',
    title: 'Trường học',
    subname: 'Tổng số trường học đã tham gia',
    color: 'primary',
    Icon: FaSchool,
  },
];
