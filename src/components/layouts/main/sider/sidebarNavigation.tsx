/* eslint-disable prettier/prettier */
import {
  AimOutlined,
  BlockOutlined,
  CalendarOutlined,
  DashboardOutlined,
  FileDoneOutlined,
  FormOutlined,
  GiftOutlined,
  HomeOutlined,
  InboxOutlined,
  LayoutOutlined,
  LineChartOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  ShopOutlined,
  TableOutlined,
  TrophyOutlined,
  UserOutlined,
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
  // {
  //   title: 'common.apps',
  //   key: 'apps',
  //   icon: <HomeOutlined />,
  //   children: [
  //     {
  //       title: 'common.feed',
  //       key: 'feed',
  //       url: '/apps/feed',
  //     },
  //     {
  //       title: 'common.kanban',
  //       key: 'kanban',
  //       url: '/apps/kanban',
  //     },
  //   ],
  // },
  // {
  //   title: 'common.authPages',
  //   key: 'auth',
  //   icon: <UserOutlined />,
  //   children: [
  //     {
  //       title: 'common.login',
  //       key: 'login',
  //       url: '/auth/login',
  //     },
  //     {
  //       title: 'common.signUp',
  //       key: 'singUp',
  //       url: '/auth/sign-up',
  //     },
  //     {
  //       title: 'common.lock',
  //       key: 'lock',
  //       url: '/auth/lock',
  //     },
  //     {
  //       title: 'common.forgotPass',
  //       key: 'forgotPass',
  //       url: '/auth/forgot-password',
  //     },
  //     {
  //       title: 'common.securityCode',
  //       key: 'securityCode',
  //       url: '/auth/security-code',
  //     },
  //     {
  //       title: 'common.newPassword',
  //       key: 'newPass',
  //       url: '/auth/new-password',
  //     },
  //   ],
  // },
  // {
  //   title: 'common.forms',
  //   key: 'forms',
  //   icon: <FormOutlined />,
  //   children: [
  //     {
  //       title: 'common.advancedForms',
  //       key: 'advanced-forms',
  //       url: '/forms/advanced-forms',
  //     },
  //   ],
  // },
  // {
  //   title: 'common.dataTables',
  //   key: 'dataTables',
  //   url: '/data-tables',
  //   icon: <TableOutlined />,
  // },
  // {
  //   title: 'Users',
  //   key: 'users',
  //   url: '/users',
  //   icon: <UserOutlined />,
  // },
  // {
  //   title: 'Players',
  //   key: 'players',
  //   url: '/players',
  //   icon: <AimOutlined />,
  // },
  // {
  //   title: 'Schools',
  //   key: 'schools',
  //   url: '/schools',
  //   icon: <IoSchoolOutline />,
  // },
  // {
  //   title: 'Student',
  //   key: 'student',
  //   url: '/students',
  //   icon: <IoSchoolOutline />,
  // },
  // {
  //   title: 'Rooms And Locations',
  //   key: 'roomLocation',
  //   url: '/rooms-location',
  //   icon: <IoLocationOutline />,
  // },
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
    url: '/schools',
    icon: <IoSchoolOutline />,
  },
  {
    title: 'Người chơi',
    key: 'players',
    url: '/players',
    icon: <AimOutlined />,
  },
  {
    title: 'Bảng xếp hạng',
    key: 'rank',
    url: '/ranks',
    icon: <TrophyOutlined />,
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
  {
    title: 'Bảng xếp hạng',
    key: 'rank',
    url: '/ranks',
    icon: <TrophyOutlined />,
  },
  // {
  //   title: 'Stores',
  //   key: 'store',
  //   url: '/stores',
  //   icon: <ShopOutlined />,
  // },
  // {
  //   title: 'common.charts',
  //   key: 'charts',
  //   url: '/charts',
  //   icon: <LineChartOutlined />,
  // },
  // {
  //   title: 'common.pages',
  //   key: 'pages',
  //   icon: <LayoutOutlined />,
  //   children: [
  //     {
  //       title: 'common.profilePage',
  //       key: 'profile',
  //       url: '/profile',
  //     },
  //     {
  //       title: 'common.serverError',
  //       key: 'serverError',
  //       url: '/server-error',
  //     },
  //     {
  //       title: 'common.clientError',
  //       key: '404Error',
  //       url: '/404',
  //     },
  //   ],
  // },
  // {
  //   title: 'common.ui',
  //   key: 'ui',
  //   icon: <BlockOutlined />,
  //   children: [
  //     {
  //       title: 'common.alert',
  //       key: 'alert',
  //       url: '/ui-components/alert',
  //     },
  //     {
  //       title: 'common.avatar',
  //       key: 'avatar',
  //       url: '/ui-components/avatar',
  //     },
  //     {
  //       title: 'common.autocomplete',
  //       key: 'auto-complete',
  //       url: '/ui-components/auto-complete',
  //     },
  //     {
  //       title: 'common.badge',
  //       key: 'badge',
  //       url: '/ui-components/badge',
  //     },
  //     {
  //       title: 'common.breadcrumbs',
  //       key: 'breadcrumbs',
  //       url: '/ui-components/breadcrumbs',
  //     },
  //     {
  //       title: 'common.button',
  //       key: 'button',
  //       url: '/ui-components/button',
  //     },
  //     {
  //       title: 'common.checkbox',
  //       key: 'checkbox',
  //       url: '/ui-components/checkbox',
  //     },
  //     {
  //       title: 'common.collapse',
  //       key: 'collapse',
  //       url: '/ui-components/collapse',
  //     },
  //     {
  //       title: 'common.dateTimePicker',
  //       key: 'dateTimePicker',
  //       url: '/ui-components/date-time-picker',
  //     },
  //     {
  //       title: 'common.dropdown',
  //       key: 'dropdown',
  //       url: '/ui-components/dropdown',
  //     },
  //     {
  //       title: 'common.input',
  //       key: 'input',
  //       url: '/ui-components/input',
  //     },
  //     {
  //       title: 'common.modal',
  //       key: 'modal',
  //       url: '/ui-components/modal',
  //     },
  //     {
  //       title: 'common.notification',
  //       key: 'notification',
  //       url: '/ui-components/notification',
  //     },
  //     {
  //       title: 'common.pagination',
  //       key: 'pagination',
  //       url: '/ui-components/pagination',
  //     },
  //     {
  //       title: 'common.popconfirm',
  //       key: 'popconfirm',
  //       url: '/ui-components/popconfirm',
  //     },
  //     {
  //       title: 'common.popover',
  //       key: 'popover',
  //       url: '/ui-components/popover',
  //     },
  //     {
  //       title: 'common.progress',
  //       key: 'progress',
  //       url: '/ui-components/progress',
  //     },
  //     {
  //       title: 'common.radio',
  //       key: 'radio',
  //       url: '/ui-components/radio',
  //     },
  //     {
  //       title: 'common.rate',
  //       key: 'rate',
  //       url: '/ui-components/rate',
  //     },
  //     {
  //       title: 'common.result',
  //       key: 'result',
  //       url: '/ui-components/result',
  //     },
  //     {
  //       title: 'common.select',
  //       key: 'select',
  //       url: '/ui-components/select',
  //     },
  //     {
  //       title: 'common.skeleton',
  //       key: 'skeleton',
  //       url: '/ui-components/skeleton',
  //     },
  //     {
  //       title: 'common.spinner',
  //       key: 'spinner',
  //       url: '/ui-components/spinner',
  //     },
  //     {
  //       title: 'common.steps',
  //       key: 'steps',
  //       url: '/ui-components/steps',
  //     },
  //     {
  //       title: 'common.switch',
  //       key: 'switch',
  //       url: '/ui-components/switch',
  //     },
  //     {
  //       title: 'common.tabs',
  //       key: 'tabs',
  //       url: '/ui-components/tabs',
  //     },
  //     {
  //       title: 'common.upload',
  //       key: 'upload',
  //       url: '/ui-components/upload',
  //     },
  //   ],
  // },
];
