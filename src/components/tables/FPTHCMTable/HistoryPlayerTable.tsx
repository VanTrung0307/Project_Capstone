/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HistoryPlayer, getHistoryPaginatedPlayers } from '@app/api/FPT_3DMAP_API/HistoryPlayer';
import { Pagination } from '@app/api/FPT_3DMAP_API/Player';
import { useMounted } from '@app/hooks/useMounted';
import { Card, Form, List, Tag, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const HistoryPlayerTable: React.FC = () => {
  const { t } = useTranslation();

  const [data, setData] = useState<{ data: HistoryPlayer[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

  const [form] = Form.useForm();

  const { isMounted } = useMounted();
  const { playerId } = useParams<{ playerId: string | undefined }>();
  const [originalData, setOriginalData] = useState<HistoryPlayer[]>([]);

  const fetch = useCallback(
    async (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      if (playerId) {
        getHistoryPaginatedPlayers(playerId, pagination)
          .then((res) => {
            if (isMounted.current) {
              setOriginalData(res.data);
              setData({ data: res.data, pagination: res.pagination, loading: false });
            }
          })
          .catch((error) => {
            message.error('Error fetching paginated players:', error);
            setData((tableData) => ({ ...tableData, loading: false }));
          });
      }
    },
    [isMounted, playerId],
  );

  useEffect(() => {
    fetch(initialPagination);
  }, [fetch]);

  const getUniquePlayers = (data: HistoryPlayer[]): HistoryPlayer[] => {
    const uniquePlayers: { [key: string]: HistoryPlayer } = {};
    data.forEach((player) => {
      uniquePlayers[player.playerId] = player;
    });
    return Object.values(uniquePlayers);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <>
      <div>
        {getUniquePlayers(originalData)
          .filter((player) => player.playerId === playerId)
          .map((player) => (
            <Card key={player.playerId}>
              <div>Tên người chơi: {player.playerNickName}</div>
              <div>
                <List
                  size="small"
                  dataSource={originalData.filter((task) => task.playerId === playerId)}
                  renderItem={(task) => (
                    <List.Item>
                      <div>
                        {task.taskName} -{' '}
                        {task.status === 'SUCCESS' ? <Tag color="green">SUCCESS</Tag> : <Tag color="red">FAILED</Tag>}
                        <List size="small">
                          <List.Item>
                            <div>
                              Thời gian hoàn thành: {formatTime(task.completedTime)} - Điểm nhiệm vụ: {task.taskPoint}
                            </div>
                          </List.Item>
                        </List>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          ))}
      </div>
    </>
  );
};
