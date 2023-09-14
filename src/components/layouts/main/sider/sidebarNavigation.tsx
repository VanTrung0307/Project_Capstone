/* eslint-disable prettier/prettier */
import {
  AimOutlined,
  AppstoreAddOutlined,
  DashboardOutlined,
  FileDoneOutlined,
  GiftOutlined,
  QuestionCircleOutlined,
  RobotOutlined
} from '@ant-design/icons';
import React from 'react';
import { IoSchoolOutline } from 'react-icons/io5';
import { MdOutlineCategory } from 'react-icons/md';

export interface SidebarNavigationItem {
  title: string;
  key: string;
  url?: string;
  children?: SidebarNavigationItem[];
  icon?: React.ReactNode;
}

export const sidebarNavigation: SidebarNavigationItem[] = [
  {
    title: 'Trang chủ',
    key: 'fpthcm-dashboard',
    url: '/',
    icon: <DashboardOutlined />,
  },
  {
    title: 'Quản lý hệ thống',
    key: 'system',
    icon: <AppstoreAddOutlined />,
    children: [
      // {
      //   title: 'Sự kiện',
      //   key: 'event',
      //   url: 'system/events',
      //   icon: <CalendarOutlined />,
      // },
      {
        title: 'Trường học',
        key: 'schools',
        url: 'system/school',
        icon: <IoSchoolOutline />,
      },
      {
        title: 'Người chơi',
        key: 'players',
        url: 'system/players',
        icon: <AimOutlined />,
      },
      {
        title: 'Nhiệm vụ',
        key: 'task',
        url: 'system/tasks',
        icon: <FileDoneOutlined />,
      },
      {
        title: 'Ngành học',
        key: 'major',
        url: 'system/majors',
        icon: <MdOutlineCategory />,
      },
      {
        title: 'Ngân hàng câu hỏi',
        key: 'questionbanks',
        url: 'system/questionbanks',
        icon: <QuestionCircleOutlined />,
      },
      {
        title: 'Phần thưởng',
        key: 'gift',
        url: 'system/gifts',
        icon: <GiftOutlined />,
      },
    ],
  },
  {
    title: 'Quản lý trò chơi',
    key: 'game',
    icon: <RobotOutlined />,
    children: [
      {
        title: 'Phòng & Vị trí',
        key: 'roomLocation',
        url: 'game/rooms-location',
      },
      {
        title: 'NPCs',
        key: 'npc',
        url: 'game/npcs',
      },
      {
        title: 'Vật phẩm ảo',
        key: 'item',
        url: '/items',
      },
    ],
  },
];
