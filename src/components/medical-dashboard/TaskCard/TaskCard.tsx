/* eslint-disable prettier/prettier */
import { Card } from '@app/components/common/Card/Card';
import { taskTypeChartData } from '@app/constants/taskTypeChartData';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PieChartCustomLegend } from '../../common/charts/PieChartCustomLegend';

export const TaskCard: React.FC = () => {
  const { t } = useTranslation();

  const chartData = taskTypeChartData.map((item) => ({
    ...item,
    name: t(item.name),
    description: t(item.description),
  }));

  const legendData = chartData.map((item) => ({ ...item, value: `${item.value}%` }));

  return (
    <Card title={t('Nhiệm vụ đã hoàn thành')} padding={'0 1.25rem 1.875rem'}>
      <PieChartCustomLegend
        name={t('Task')}
        chartData={chartData}
        legendData={legendData}
        height="300px"
      />
    </Card>
  );
};
