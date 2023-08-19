/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Event, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import { Pagination, Player, getRankedPlayers } from '@app/api/FPT_3DMAP_API/Player';
import { School, getPaginatedSchools } from '@app/api/FPT_3DMAP_API/School';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Select } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditableCell } from '../editableTable/EditableCell';
import { DownOutlined } from '@ant-design/icons';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const RankTable: React.FC = () => {
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
  const [eventId, setEventId] = useState<string>('');
  const [schoolId, setSchoolId] = useState<string>('');

  const [events, setEvents] = useState<Event[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  const fetch = useCallback(
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: false }));

      getPaginatedEvents({ current: 1, pageSize: 10 }).then((paginationData) => {
        setEvents(paginationData.data);
      });

      getPaginatedSchools({ current: 1, pageSize: 10 }).then((paginationData) => {
        setSchools(paginationData.data);
      });

      getRankedPlayers(eventId, schoolId, pagination).then((res) => {
        if (isMounted.current) {
          setData({ data: res.data, pagination: res.pagination, loading: false });
        }
      });
    },
    [isMounted, eventId, schoolId],
  );

  useEffect(() => {
    fetch(initialPagination);
  }, [fetch]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetch(pagination);
    cancel();
  };

  const columns: ColumnsType<Player> = [
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
  ];

  return (
    <Form form={form} component={false}>
      <Select
        value={eventId}
        onChange={(value) => setEventId(value)}
        style={{ width: 300, marginRight: 10, marginBottom: 10 }}
        suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
      >
        {!eventId && <Select.Option value="">Chọn sự kiện</Select.Option>}
        {events.map((event) => (
          <Select.Option key={event.id} value={event.id}>
            {event.name}
          </Select.Option>
        ))}
      </Select>

      {eventId && (
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
      )}

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
