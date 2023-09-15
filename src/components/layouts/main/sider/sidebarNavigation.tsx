/* eslint-disable prettier/prettier */
import {
  AppstoreAddOutlined,
  DashboardOutlined,
  RobotOutlined
} from '@ant-design/icons';
import React from 'react';

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
        title: '🏫 Trường học',
        key: 'schools',
        url: 'system/school',
      },
      // {
      //   title: 'Người chơi',
      //   key: 'players',
      //   url: 'system/players',
      //   icon: <AimOutlined />,
      // },
      {
        title: '🎯 Nhiệm vụ',
        key: 'task',
        url: 'system/tasks',
      },
      {
        title: '🧑‍🎓 Ngành học',
        key: 'major',
        url: 'system/majors',
      },
      {
        title: '📑 Ngân hàng câu hỏi',
        key: 'questionbanks',
        url: 'system/questionbanks',
      },
      {
        title: '🎁 Phần thưởng',
        key: 'gift',
        url: 'system/gifts',
      },
    ],
  },
  {
    title: 'Quản lý trò chơi',
    key: 'game',
    icon: <RobotOutlined />,
    children: [
      {
        title: '📍 Phòng & Vị trí',
        key: 'roomLocation',
        url: 'game/rooms-location',
      },
      {
        title: '🤖 NPCs',
        key: 'npc',
        url: 'game/npcs',
      },
      {
        title: '🧸 Vật phẩm ảo',
        key: 'item',
        url: '/items',
      },
    ],
  },
];
