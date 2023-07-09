/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../common/Card/Card';
import { ChartData } from 'interfaces/interfaces';
import styled from 'styled-components';
import { PlayerChart } from '@app/components/medical-dashboard/playerCard/PlayerChart';

export const PlayerCard: React.FC = () => {
  const [data] = useState<ChartData>([1840, 1927, 1793, 1757, 1934, 1620, 1754]);

  const { t } = useTranslation();

  return (
    <PlayerCardStyled id="activity" title={t('Số lượng người chơi')} padding={0}>
      <PlayerChart data={data} />
    </PlayerCardStyled>
  );
};

const PlayerCardStyled = styled(Card)`
  height: 100%;
`;
