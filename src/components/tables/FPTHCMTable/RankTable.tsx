/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DownOutlined } from '@ant-design/icons';
import { Event, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import { Pagination, Player, getRankedPlayers } from '@app/api/FPT_3DMAP_API/Player';
import { PlayerPrizeSend, createPlayerPrize } from '@app/api/FPT_3DMAP_API/PlayerPrize';
import { School, getPaginatedSchools } from '@app/api/FPT_3DMAP_API/School';
import { useMounted } from '@app/hooks/useMounted';
import { Button, Form, Input, Modal, Select, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditableCell } from '../editableTable/EditableCell';
import styled from 'styled-components';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

type EventsProps = {
  eventId?: string;
};

export const RankTable: React.FC<EventsProps & { selectedSchoolId: string }> = ({ eventId, selectedSchoolId }) => {
  const { t } = useTranslation();

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: Player[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

  const isEditing = (record: Player) => record.id === editingKey;

  const [form] = Form.useForm();

  const cancel = () => {
    setEditingKey('');
  };

  const [playerid, setPlayerId] = useState<string>('');

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof Player) => {
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

      if (eventId && selectedSchoolId) {
        getRankedPlayers(eventId, selectedSchoolId, pagination).then((res) => {
          if (isMounted.current) {
            setData({ data: res.data, pagination: res.pagination, loading: false });
            setPlayerId(res.data[0].id);
          }
        });
      }
    },
    [isMounted, eventId, selectedSchoolId],
  );

  useEffect(() => {
    fetch(initialPagination);
  }, [fetch]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetch(pagination);
    cancel();
  };

  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);

  const handleModalOk = async (id: string) => {
    try {
      const values = await form.validateFields();

      const newData: PlayerPrizeSend = {
        prizeId: values.prizeId,
        dateReceived: values.dateReceived,
        status: values.status,
      };

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        await createPlayerPrize(newData, id);
        message.success('Gửi đơn thành công');
        fetch(data.pagination);
        form.resetFields();
        setIsBasicModalOpen(false);
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

  const [prizeId, setPrizeId] = useState('');

  const handlePrizeIdChange = (value: any) => {
    setPrizeId(value);
  };

  const columns: ColumnsType<Player> = [
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
      render: (text: string, record: Player) => {
        const editable = isEditing(record);
        const dataIndex: keyof Player = 'nickname';
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
      render: (text: string, record: Player) => {
        const editable = isEditing(record);
        const dataIndex: keyof Player = 'studentName';
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
      render: (text: string, record: Player) => {
        const editable = isEditing(record);
        const dataIndex: keyof Player = 'totalTime';
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
      render: (text: string, record: Player) => {
        const editable = isEditing(record);
        const dataIndex: keyof Player = 'totalPoint';
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
      render: (text, record: Player) => {
        return (
          <>
            <Button type="primary" onClick={() => setIsBasicModalOpen(true)}>
              Chi tiết
            </Button>

            <Modal
              title={'Gửi đơn phần thưởng'}
              open={isBasicModalOpen}
              onOk={() => handleModalOk(record.id)}
              onCancel={() => setIsBasicModalOpen(false)}
              mask={true}
              maskStyle={{ opacity: 1 }}
              footer={
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button key="back" onClick={() => setIsBasicModalOpen(false)}>
                    Huỷ
                  </Button>
                  <Button key="submit" type="primary" onClick={() => handleModalOk(record.id)}>
                    Gưi
                  </Button>
                </div>
              }
            >
              <S.FormContent>
                <FlexContainer>
                  <Label>{'Phần thưởng'}</Label>
                  <InputContainer>
                    <BaseForm.Item
                      name="prizeId"
                      rules={[{ required: true, message: t('Phải có phần thưởng') }]}
                      initialValue={record.prizedId}
                    >
                      <Input maxLength={100} onChange={(e) => handlePrizeIdChange(record.prizedId)} disabled />
                      {/* <input type="hidden" value={record.prizedId} /> */}
                    </BaseForm.Item>
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
                      <Input type="datetime-local" required />
                    </BaseForm.Item>
                  </InputContainer>
                </FlexContainer>

                <FlexContainer>
                  <Label>{'Trạng thái'}</Label>
                  <InputContainer>
                    <BaseForm.Item name="status" initialValue={'RECEIVED'}>
                      <Input disabled={true} />
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
      {/* <Select
        value={eventId}
        onChange={(value) => setEventId(value)}
        style={{ width: 300, marginRight: 10, marginBottom: 10 }}
        suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
      >
        <Select.Option value="">Chọn sự kiện</Select.Option>
        {events.map((event) => (
          <Select.Option key={event.id} value={event.id}>
            {event.name}
          </Select.Option>
        ))}
      </Select> */}

      {/* {eventId && (
        <Select
          value={schoolId}
          onChange={(value) => setSchoolId(value)}
          style={{ width: 300, marginRight: 10, marginBottom: 10 }}
          suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
        >
          <Select.Option value="">Chọn trường</Select.Option>
          {schools.map((school) => (
            <Select.Option key={school.id} value={school.id}>
              {school.name}
            </Select.Option>
          ))}
        </Select>
      )} */}

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
