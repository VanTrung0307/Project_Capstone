/* eslint-disable prettier/prettier */
import { Card } from '@app/components/common/Card/Card';
import { orderStatusChartData } from '@app/constants/orderStatusChartData';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PieChartCustomLegend } from '../../common/charts/PieChartCustomLegend';

export const OrderCard: React.FC = () => {
  const { t } = useTranslation();

  const chartData = orderStatusChartData.map((item) => ({
    ...item,
    name: t(item.name),
    description: t(item.description),
  }));

  const legendData = chartData.map((item) => ({ ...item, value: `${item.value}%` }));

  return (
    <Card title={t('Tổng đơn hàng')} padding={'0 1.25rem 1.875rem'}>
      <PieChartCustomLegend
        name={t('Order')}
        chartData={chartData}
        legendData={legendData}
        height="300px"
      />
    </Card>
  );
};
