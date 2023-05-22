/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../common/Card/Card';
import { ChartData } from 'interfaces/interfaces';
import styled from 'styled-components';
import { EventChart } from '@app/components/medical-dashboard/eventCard/EventChart';

export const EventCard: React.FC = () => {
  const [data] = useState<ChartData>([1840, 1927, 1793, 1757, 1934, 1620, 1754]);

  const { t } = useTranslation();

  return (
    <EventCardStyled id="activity" title={t('Sự kiện')} padding={0}>
      <EventChart data={data} />
    </EventCardStyled>
  );
};

const EventCardStyled = styled(Card)`
  height: 100%;
`;
