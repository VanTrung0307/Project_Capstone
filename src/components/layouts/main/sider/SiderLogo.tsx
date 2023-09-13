/* eslint-disable prettier/prettier */
import { RightOutlined } from '@ant-design/icons';
import LogoImg from '@app/components/layouts/main/sider/logo-img/Logo.png';
import React from 'react';
import * as S from './MainSider/MainSider.styles';
import { useResponsive } from '@app/hooks/useResponsive';

interface SiderLogoProps {
  isSiderCollapsed: boolean;
  toggleSider: () => void;
}
export const SiderLogo: React.FC<SiderLogoProps> = ({ isSiderCollapsed, toggleSider }) => {
  const { isDesktop, tabletOnly } = useResponsive();

  // const theme = useAppSelector((state) => state.theme.theme);

  // const img = theme === 'dark' ? logoDark : logo;
  const img = LogoImg;

  return (
    <S.SiderLogoDiv>
      <S.SiderLogoLink to="/">
        <img src={img} alt="FPTHCM" width={48} height={48} />
        <S.BrandSpan>FPTU HCM Admin</S.BrandSpan>
      </S.SiderLogoLink>
      {(isDesktop || tabletOnly) && (
        <S.CollapseButton
          shape="circle"
          size="small"
          $isCollapsed={isSiderCollapsed}
          icon={<RightOutlined rotate={isSiderCollapsed ? 0 : 180} />}
          onClick={toggleSider}
        />
      )}
    </S.SiderLogoDiv>
  );
};
