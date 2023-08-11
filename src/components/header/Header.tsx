/* eslint-disable prettier/prettier */
import React from 'react';
import { DesktopHeader } from './layouts/DesktopHeader';
import { MobileHeader } from './layouts/MobileHeader';
import { useResponsive } from '@app/hooks/useResponsive';

interface HeaderProps {
  toggleSider: () => void;
  isSiderOpened: boolean;
  isTwoColumnsLayout: boolean;
  isLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({ toggleSider, isSiderOpened, isTwoColumnsLayout, isLoggedIn }) => {
  const { isTablet } = useResponsive();

  return isTablet ? (
    <DesktopHeader isTwoColumnsLayout={isTwoColumnsLayout} isLoggedIn={isLoggedIn} />
  ) : (
    <MobileHeader toggleSider={toggleSider} isSiderOpened={isSiderOpened} />
  );
};
