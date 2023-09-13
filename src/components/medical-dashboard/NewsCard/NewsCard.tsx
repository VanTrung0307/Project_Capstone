/* eslint-disable prettier/prettier */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardCard } from '../DashboardCard/DashboardCard';

export const NewsCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DashboardCard title={t('medical-dashboard.news')}>
      {/* <S.Wrapper>
        {dashboardNews.map((advice, index) => (
          <ArticleCard
            key={index}
            imgUrl={advice.img}
            title={advice.title}
            date={advice.date}
            description={advice.text}
            avatar={advice.avatarUrl}
            author={advice.author}
            tags={advice.tags}
          />
        ))}
      </S.Wrapper> */}
    </DashboardCard>
  );
};
