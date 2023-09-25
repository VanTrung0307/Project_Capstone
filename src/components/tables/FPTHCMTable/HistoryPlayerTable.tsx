/* eslint-disable prettier/prettier */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DownOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { HistoryPlayer, getHistoryPaginatedPlayers } from '@app/api/FPT_3DMAP_API/HistoryPlayer';
import { Pagination } from '@app/api/FPT_3DMAP_API/Player';
import { useMounted } from '@app/hooks/useMounted';
import { Card, Col, Form, List, Row, Select, Tabs, Tag, message } from 'antd';
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

  const [isPasscodeVisible, setIsPasscodeVisible] = useState(false);
  const { TabPane } = Tabs;
  const [activeTabKey, setActiveTabKey] = useState('all');

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  const { Option } = Select;
  const [selectedMajor, setSelectedMajor] = useState('all');
  const uniqueMajorNames = originalData
    .filter(
      (player, index, self) =>
        player.playerId === playerId && self.findIndex((p) => p.majorId === player.majorId) === index,
    )
    .map((player) => {
      const matchingPlayer = originalData.find((p) => p.majorId === player.majorId);
      if (matchingPlayer) {
        return {
          majorId: player.majorId,
          majorName: matchingPlayer.majorName,
        };
      }
      return null; // or handle the case when matchingPlayer is undefined
    })
    .filter((player) => player !== null); // remove any null entries

  return (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <div
            style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '27px', marginTop: '10px', color: '#FF7C00' }}
          >
            ➤ Thông tin cá nhân
          </div>
          <div style={{ width: '100%' }}>
            {getUniquePlayers(originalData)
              .filter((player) => player.playerId === playerId)
              .map((player) => (
                <Card
                  bordered={false}
                  key={player.playerId}
                  style={{
                    borderRadius: '8px',
                    boxShadow: 'rgba(255, 124, 0, 1) 0px 1px 4px, rgba(255, 124, 0, 1) 0px 0px 0px 3px',
                    marginBottom: '16px',
                    transition: 'box-shadow 0.3s',
                    background: '#414345',
                  }}
                  hoverable
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div>
                          ✒️ <span style={{ fontWeight: 'bold' }}>Họ và tên:</span>
                        </div>
                        <div>
                          ⭐ <span style={{ fontWeight: 'bold' }}>Nickname:</span>
                        </div>
                        <div>
                          🏫 <span style={{ fontWeight: 'bold' }}>Tên Trường:</span>
                        </div>
                        <div>
                          📧 <span style={{ fontWeight: 'bold' }}>Email:</span>
                        </div>
                        <div>
                          📆 <span style={{ fontWeight: 'bold' }}>Tên sự kiện:</span>
                        </div>
                        <div>
                          🪙 <span style={{ fontWeight: 'bold' }}>Tổng điểm:</span>
                        </div>
                        <div>
                          🔑 <span style={{ fontWeight: 'bold' }}>Mã tham gia:</span>
                        </div>
                      </div>
                      <div style={{ paddingLeft: '20px' }}>
                        <div>{player.studentName}</div>
                        <div>{player.playerNickName}</div>
                        <div>{player.schoolName}</div>
                        <div>
                          <a href={`mailto:${player.studentEmail}`}>{player.studentEmail}</a>
                        </div>
                        <div style={{ whiteSpace: 'nowrap' }}>{player.eventName}</div>
                        <div>
                          <span style={{ fontFamily: 'Pacifico, cursive', fontWeight: 'bold' }}>
                            {player.totalPoint}
                          </span>
                          <span> (điểm nhiệm vụ + bonus)</span>
                        </div>
                        <div>
                          {isPasscodeVisible ? player.passcode : '********'}
                          {isPasscodeVisible ? (
                            <EyeInvisibleOutlined
                              style={{ cursor: 'pointer', marginLeft: '5px' }}
                              onClick={() => setIsPasscodeVisible(!isPasscodeVisible)}
                            />
                          ) : (
                            <EyeOutlined
                              style={{ cursor: 'pointer', marginLeft: '5px' }}
                              onClick={() => setIsPasscodeVisible(!isPasscodeVisible)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </Col>
        <Col span={12}>
          <div
            style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '27px', marginTop: '10px', color: '#FF7C00' }}
          >
            ➤ Thông tin nhiệm vụ
          </div>
          <div style={{ overflowX: 'auto' }}>
            <Select
              value={selectedMajor}
              onChange={(value) => setSelectedMajor(value)}
              style={{ width: '300px', marginBottom: '10px' }}
              suffixIcon={<DownOutlined style={{ color: '#FF7C00' }} />}
              dropdownStyle={{ background: '#414345' }}
            >
              <Option value="all">Tất cả</Option>
              {uniqueMajorNames.map(
                (major) =>
                  major && (
                    <Option key={major.majorId} value={major.majorId}>
                      {major.majorName}
                    </Option>
                  ),
              )}
            </Select>
            <Card
              style={{
                maxHeight: '350px',
                overflowY: 'auto',
                background: '#414345',
                boxShadow: 'rgba(255, 124, 0, 1) 0px 1px 4px, rgba(255, 124, 0, 1) 0px 0px 0px 3px',
              }}
            >
              {originalData
                .filter(
                  (player) =>
                    player.playerId === playerId && (selectedMajor === 'all' || player.majorId === selectedMajor),
                )
                .map((player) => {
                  let totalPoints = 0;
                  return originalData
                    .filter(
                      (task) =>
                        task.playerId === playerId &&
                        task.majorId === player.majorId &&
                        task.eventtaskId === player.eventtaskId,
                    )
                    .map((task) => {
                      if (task.status === 'SUCCESS') {
                        totalPoints += task.taskPoint;
                      }
                      return (
                        <div key={task.id}>
                          📋 <span style={{ fontStyle: 'italic', textDecoration: 'underline' }}>{task.taskName}</span> -{' '}
                          <span style={{ fontWeight: 'bold' }}>
                            {task.status === 'SUCCESS' ? (
                              <>
                                <Tag color="green">SUCCESS</Tag>
                                <a>✅</a>
                              </>
                            ) : (
                              <>
                                <Tag color="red">FAILED</Tag>
                                <a>❌</a>
                              </>
                            )}
                          </span>
                          <List size="small">
                            <List.Item>
                              <div>
                                <div style={{ marginBottom: '10px' }}>
                                  ⌚ Thời gian hoàn thành:{' '}
                                  <span style={{ fontFamily: 'Casio', fontSize: '18px' }}>
                                    {formatTime(task.completedTime)}
                                  </span>{' '}
                                  - 💫 Điểm nhiệm vụ:{' '}
                                  <span style={{ fontFamily: 'Pacifico, cursive', fontWeight: 'bold' }}>
                                    {task.taskPoint}
                                  </span>
                                </div>
                                {selectedMajor === 'all' && (
                                  <div>
                                    🎓 Ngành học:{' '}
                                    <span style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 'bold' }}>
                                      {task.majorName}
                                    </span>
                                  </div>
                                )}
                                <hr
                                  style={{
                                    display: 'block',
                                    height: '1px',
                                    border: '0',
                                    borderTop: '1px solid #ccc',
                                    margin: '1em 0',
                                    padding: '0',
                                  }}
                                />
                              </div>
                            </List.Item>
                          </List>
                        </div>
                      );
                    });
                })}
              {selectedMajor === 'all' && (
                <div>
                  🪙 Tổng điểm nhiệm vụ:{' '}
                  <span style={{ fontFamily: 'Pacifico, cursive', fontWeight: 'bold' }}>
                    {originalData
                      .filter(
                        (player) =>
                          player.playerId === playerId && (selectedMajor === 'all' || player.majorId === selectedMajor),
                      )
                      .reduce((totalPoints, player) => {
                        return (
                          totalPoints +
                          originalData
                            .filter(
                              (task) =>
                                task.playerId === playerId &&
                                task.majorId === player.majorId &&
                                task.eventtaskId === player.eventtaskId &&
                                task.status === 'SUCCESS',
                            )
                            .reduce((points, task) => points + task.taskPoint, 0)
                        );
                      }, 0)}
                  </span>
                </div>
              )}
            </Card>
          </div>
        </Col>
      </Row>
    </>
  );
};
