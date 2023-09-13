/* eslint-disable prettier/prettier */
import { useResponsive } from 'hooks/useResponsive';
import React, { useMemo } from 'react';
import { SiderLogo } from '../SiderLogo';
import SiderMenu from '../SiderMenu/SiderMenu';
import * as S from './MainSider.styles';
import Overlay from '@app/components/common/Overlay';

interface MainSiderProps {
  isCollapsed: boolean;
  setCollapsed: (isCollapsed: boolean) => void;
}

const MainSider: React.FC<MainSiderProps> = ({ isCollapsed, setCollapsed, ...props }) => {
  const { isDesktop, tabletOnly } = useResponsive();

  const isCollapsible = useMemo(() => isDesktop && tabletOnly, [isDesktop, tabletOnly]);

  const toggleSider = () => setCollapsed(!isCollapsed);

  return (
    <>
      <S.Sider
        trigger={null}
        collapsed={(isDesktop || tabletOnly) && isCollapsed}
        collapsedWidth={(isDesktop || tabletOnly) ? 80 : 80}
        collapsible={isCollapsible}
        width={260}
        {...props}
      >
        {/* <SiderLogo isSiderCollapsed={isCollapsed} toggleSider={toggleSider} /> */}
        <SiderLogo isSiderCollapsed={isCollapsed} toggleSider={toggleSider} />
        <S.SiderContent>
          <SiderMenu setCollapsed={setCollapsed} />
        </S.SiderContent>
      </S.Sider>
      {(isDesktop || tabletOnly) && <Overlay onClick={toggleSider} show={!isCollapsed} />}
    </>
  );
};

export default MainSider;
