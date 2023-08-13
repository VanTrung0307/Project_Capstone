/* eslint-disable prettier/prettier */
import {
  AimOutlined,
  CalendarOutlined,
  DashboardOutlined,
  FileDoneOutlined,
  GiftOutlined,
  InboxOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  UserOutlined
} from '@ant-design/icons';
import React from 'react';
import { IoLocationOutline, IoSchoolOutline } from 'react-icons/io5';
import { MdOutlineCategory } from 'react-icons/md';
import { RiQuestionAnswerLine } from 'react-icons/ri';

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
    title: 'Sự kiện',
    key: 'event',
    url: '/events',
    icon: <CalendarOutlined />,
  },
  {
    title: 'Học sinh',
    key: 'users',
    url: '/users',
    icon: <UserOutlined />,
  },
  {
    title: 'Trường học',
    key: 'schools',
    url: '/school',
    icon: <IoSchoolOutline />,
  },
  {
    title: 'Người chơi',
    key: 'players',
    url: '/players',
    icon: <AimOutlined />,
  },
  {
    title: 'Phòng & Vị trí',
    key: 'roomLocation',
    url: '/rooms-location',
    icon: <IoLocationOutline />,
  },
  {
    title: 'Nhiệm vụ',
    key: 'task',
    url: '/tasks',
    icon: <FileDoneOutlined />,
  },
  {
    title: 'Ngành học',
    key: 'major',
    url: '/majors',
    icon: <MdOutlineCategory />,
  },
  {
    title: 'Ngân hàng câu hỏi',
    key: 'questionbanks',
    url: '/questionbanks',
    icon: <QuestionCircleOutlined />,
  },
  {
    title: 'Ngân hàng câu trả lời',
    key: 'answers',
    url: '/answers',
    icon: <RiQuestionAnswerLine />,
  },
  {
    title: 'NPCs',
    key: 'npc',
    url: '/npcs',
    icon: <RobotOutlined />,
  },
  {
    title: 'Phần thưởng',
    key: 'gift',
    url: '/gifts',
    icon: <GiftOutlined />,
  },
  {
    title: 'Vật phẩm ảo',
    key: 'item',
    url: '/items',
    icon: <InboxOutlined />,
  },
];
