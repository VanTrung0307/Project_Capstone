/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Event, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import {
  Pagination,
  PlayerPrize,
  PlayerPrizeSend,
  createPlayerPrize,
  getRankedPlayerPrizes,
} from '@app/api/FPT_3DMAP_API/PlayerPrize';
import { School, getPaginatedSchools } from '@app/api/FPT_3DMAP_API/School';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { useMounted } from '@app/hooks/useMounted';
import { Button, Form, Input, Modal, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const RankTable: React.FC<{ selectedSchoolId: string }> = ({ selectedSchoolId }) => {
  const { t } = useTranslation();

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: PlayerPrize[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

  const isEditing = (record: PlayerPrize) => record.id === editingKey;

  const [form] = Form.useForm();

  const cancel = () => {
    setEditingKey('');
  };

  const [playerid, setPlayerId] = useState<string>('');

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof PlayerPrize) => {
    const updatedData = data.data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const { isMounted } = useMounted();
  const [schoolId, setSchoolId] = useState<string>('');

  const [events, setEvents] = useState<Event[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  const fetch = useCallback(
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: false }));

      getPaginatedEvents({ current: 1, pageSize: 100 }).then((paginationData) => {
        setEvents(paginationData.data);
      });

      getPaginatedSchools({ current: 1, pageSize: 100 }).then((paginationData) => {
        setSchools(paginationData.data);
      });

      if (selectedSchoolId) {
        getRankedPlayerPrizes(selectedSchoolId, pagination).then((res) => {
          if (isMounted.current) {
            setData({ data: res.data, pagination: res.pagination, loading: false });
            setPlayerId(res.data[0]?.id);
          }
        });
      }
    },
    [isMounted, selectedSchoolId],
  );

  useEffect(() => {
    fetch(initialPagination);
  }, [fetch]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetch(pagination);
    cancel();
  };

  const handleModalOk = async (selectedId: string, selectedPrizeId: string) => {
    try {
      const values = await form.validateFields();

      const newData: PlayerPrizeSend = {
        prizeId: selectedPrizeId,
        dateReceived: values.dateReceived,
        status: values.status,
      };

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        await createPlayerPrize(newData, selectedId);
        message.success('Gửi đơn thành công');
        fetch(data.pagination);
        form.resetFields();
        setIsModalVisible(false);
      } catch (error) {
        message.error('Gửi đơn không thành công');
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      message.error('Lỗi hệ thống');
    }
  };

  const FlexContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  `;

  const Label = styled.label`
    flex: 0 0 200px;
    ::before {
      content: '* ';
      color: red;
    }
  `;

  const InputContainer = styled.div`
    flex: 1;
  `;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPrizeId, setSelectedPrizeId] = useState<string | null>(null);
  const [selectedPrizeName, setSelectedPrizeName] = useState<string | null>(null);

  const handleButtonClick = (id: string, prizedId: string, prizedName: string) => {
    setSelectedId(id);
    setSelectedPrizeId(prizedId);
    setSelectedPrizeName(prizedName);
    setIsModalVisible(true);
  };

  const columns: ColumnsType<PlayerPrize> = [
    {
      title: t('Xếp hạng'),
      dataIndex: 'index',
      render: (text, record, index) => {
        return index + 1;
      },
    },
    {
      title: t('Username'),
      dataIndex: 'nickname',
      render: (text: string, record: PlayerPrize) => {
        const editable = isEditing(record);
        const dataIndex: keyof PlayerPrize = 'nickname';
        return editable ? (
          <Form.Item
            key={record.nickname}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.nickname, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Tên người chơi'),
      dataIndex: 'studentName',
      render: (text: string, record: PlayerPrize) => {
        const editable = isEditing(record);
        const dataIndex: keyof PlayerPrize = 'studentName';
        return editable ? (
          <Form.Item
            key={record.studentName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a playerId' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.studentName, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Tổng thời gian'),
      dataIndex: 'totalTime',
      render: (text: string, record: PlayerPrize) => {
        const editable = isEditing(record);
        const dataIndex: keyof PlayerPrize = 'totalTime';
        return editable ? (
          <Form.Item
            key={record.totalTime}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a eventId' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.totalTime, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Tổng điểm'),
      dataIndex: 'totalPoint',
      render: (text: string, record: PlayerPrize) => {
        const editable = isEditing(record);
        const dataIndex: keyof PlayerPrize = 'totalPoint';
        return editable ? (
          <Form.Item
            key={record.totalPoint}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a place' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.totalPoint, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Phần thưởng'),
      dataIndex: 'prizedName',
    },
    {
      title: t('Chức năng'),
      dataIndex: 'actions',
      render: (text, record: PlayerPrize) => {
        return (
          <>
            <Button type="primary" onClick={() => handleButtonClick(record.id, record.prizedId, record.prizedName)}>
              Gửi mail
            </Button>

            <Modal
              title={'Gửi đơn phần thưởng'}
              open={isModalVisible}
              className="custom-modal"
              onCancel={() => setIsModalVisible(false)}
              mask={true}
              maskStyle={{ opacity: 1 }}
              footer={
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button key="back" onClick={() => setIsModalVisible(false)} style={{ background: '#414345' }}>
                    Huỷ
                  </Button>
                  <Button
                    key="submit"
                    type="primary"
                    onClick={() => handleModalOk(selectedId || '', selectedPrizeId || '')}
                  >
                    Gửi
                  </Button>
                </div>
              }
            >
              <S.FormContent>
                <FlexContainer>
                  <Label>{'Phần thưởng'}</Label>
                  <InputContainer>
                    <span style={{ fontWeight: 'bold', fontFamily: 'Oswald, sans-serif', fontSize: '20px' }}>
                      {selectedPrizeName || ''}
                    </span>
                  </InputContainer>
                </FlexContainer>

                <FlexContainer>
                  <Label>{'Thời gian nhận quà'}</Label>
                  <InputContainer>
                    <BaseForm.Item
                      name="dateReceived"
                      rules={[
                        {
                          required: true,
                          message: t('Hãy chọn thời gian'),
                        },
                      ]}
                    >
                      <Input type="datetime-local" required style={{ background: '#414345' }} />
                    </BaseForm.Item>
                  </InputContainer>
                </FlexContainer>

                <FlexContainer>
                  <Label>{'Trạng thái'}</Label>
                  <InputContainer>
                    <BaseForm.Item name="status" initialValue={'RECEIVED'}>
                      <Input disabled={true} style={{ background: '#1D1C1A' }} />
                    </BaseForm.Item>
                  </InputContainer>
                </FlexContainer>
              </S.FormContent>
            </Modal>
          </>
        );
      },
    },
  ];

  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        columns={columns}
        dataSource={data.data}
        pagination={{
          ...data.pagination,
          onChange: cancel,
        }}
        onChange={handleTableChange}
        loading={data.loading}
        scroll={{ x: 1000 }}
        bordered
      />
    </Form>
  );
};
