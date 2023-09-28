/* eslint-disable prettier/prettier */
import { Pagination, Player, getPaginatedPlayers } from '@app/api/FPT_3DMAP_API/Player';
import React, { useEffect, useState } from 'react';
import { HistoryPlayerTable } from '../FPTHCMTable/HistoryPlayerTable';
import * as S from './FPTHCMTables.styles';

type PlayerProps = {
  playerId?: string;
};

export const HistoryPlayerTables: React.FC<PlayerProps> = ({ playerId }) => {
  const [player, setPlayer] = useState<Player | undefined>(undefined);

  useEffect(() => {
    if (playerId) {
      const pagination: Pagination = { current: 1, pageSize: 100 };

      getPaginatedPlayers(pagination)
        .then((response) => {
          // console.log('API Response:', response);
          const playerData = response.data.find((player) => player.id === playerId);
          setPlayer(playerData);
        })
        .catch((error) => {
          console.error('Error fetching paginated events:', error);
        });
    }
  }, [playerId]);
  return (
    <>
      <S.FPTHCMTablesWrapper>
        <S.Card
          id="basic-table"
          title={
            <>
              <span>📂</span>
              <span style={{ textDecoration: 'underline' }}>{player?.studentName}</span>
            </>
          }
          padding="1.25rem 1.25rem 1.25rem 1.25rem"
        >
          <HistoryPlayerTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </>
  );
};
