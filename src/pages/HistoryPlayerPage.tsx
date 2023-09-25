/* eslint-disable prettier/prettier */
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { HistoryPlayerTables } from '@app/components/tables/FPTHCMTablesWrapper/HistoryPlayerTables';
import { Button } from 'antd';
import React, { Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PlayerPage: React.FC = () => {
  // const { t } = useTranslation();
  const { playerId } = useParams();

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };
  return (
    <>
      <Button
        onClick={() => handleGoBack()}
        style={{
          position: 'absolute',
          top: '20px',
          left: '100px',
          fontSize: '20px',
          zIndex: '999',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: '5px' }}
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span>Trở lại</span>
      </Button>
      <Suspense fallback={<div>Loading...</div>}>
        <PageTitle>History Player</PageTitle>
        <HistoryPlayerTables playerId={playerId} />
      </Suspense>
    </>
  );
};

export default PlayerPage;
