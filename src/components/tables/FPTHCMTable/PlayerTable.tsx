/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Event, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import { Pagination, Player, getPaginatedPlayers } from '@app/api/FPT_3DMAP_API/Player';
import { User, getPaginatedUsers } from '@app/api/FPT_3DMAP_API/User';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Select, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditableCell } from '../editableTable/EditableCell';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { School, getPaginatedSchools } from '@app/api/FPT_3DMAP_API/School';
import { DownOutlined } from '@ant-design/icons';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const PlayerTable: React.FC = () => {
  const { t } = useTranslation();

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: Player[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const formatDateTime = (isoDateTime: number) => {
    const dateTime = new Date(isoDateTime);
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0');
    const day = String(dateTime.getDate()).padStart(2, '0');
    const hours = String(dateTime.getHours()).padStart(2, '0');
    const minutes = String(dateTime.getMinutes()).padStart(2, '0');
    const seconds = String(dateTime.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
  };

  const isEditing = (record: Player) => record.id === editingKey;

  const [form] = Form.useForm();

  const { isMounted } = useMounted();
  const [originalData, setOriginalData] = useState<Player[]>([]);

  const [eventId, setEventId] = useState<string>('');
  const [schoolId, setSchoolId] = useState<string>('');

  const fetch = useCallback(
    async (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedPlayers(pagination)
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

      try {
        const eventResponse = await getPaginatedEvents({ current: 1, pageSize: 1000 });
        setEvents(eventResponse.data);
      } catch (error) {
        message.error('Error fetching events');
      }
      try {
        const studentResponse = await getPaginatedUsers({ current: 1, pageSize: 1000 });
        setStudents(studentResponse.data);
      } catch (error) {
        // message.error('Error fetching students');
      }

      getPaginatedSchools({ current: 1, pageSize: 10 }).then((paginationData) => {
        setSchools(paginationData.data);
      });
    },
    [isMounted],
  );

  useEffect(() => {
    fetch(initialPagination);
  }, [fetch]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetch(pagination);
  };

  const uniqueEventNames = new Set(data.data.map((record) => record.eventName));
  const eventNameFilters = Array.from(uniqueEventNames).map((eventName) => ({
    text: eventName,
    value: eventName,
  }));

  const columns: ColumnsType<Player> = [
    {
      title: t('Tên học sinh'),
      dataIndex: 'studentName',
      render: (text: string, record: Player) => {
        const editable = isEditing(record);
        const dataIndex: keyof Player = 'studentName';
        return editable ? (
          <Form.Item
            key={record.studentName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a fullname' }]}
          ></Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Biệt danh'),
      dataIndex: 'nickname',
      render: (text: string, record: Player) => {
        const editable = isEditing(record);
        const dataIndex: keyof Player = 'nickname';
        return editable ? (
          <Form.Item
            key={record.nickname}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a nickname' }]}
          ></Form.Item>
        ) : (
          <span>{text === 'null' ? 'chưa có thông tin' : text}</span>
        );
      },
    },
    {
      title: t('Tên sự kiện'),
      dataIndex: 'eventName',
      filters: eventNameFilters,
      onFilter: (value, record) => record.eventName === value,
      render: (text: string, record: Player) => {
        const editable = isEditing(record);
        const dataIndex: keyof Player = 'eventName';
        return editable ? (
          <Form.Item
            key={record.eventName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên sự kiện là cần thiết' }]}
          ></Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Mã tham gia'),
      dataIndex: 'passcode',
      render: (text: string, record: Player) => {
        const editable = isEditing(record);
        const dataIndex: keyof Player = 'passcode';
        return editable ? (
          <Form.Item
            key={record.passcode}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Mã tham gia là cần thiết' }]}
          ></Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Tổng điểm thưởng'),
      dataIndex: 'totalPoint',
      render: (text: number, record: Player) => {
        const editable = isEditing(record);
        const dataIndex: keyof Player = 'totalPoint';
        return editable ? (
          <Form.Item
            key={record.totalPoint}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: false }]}
          ></Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Tổng thời gian hoàn thành'),
      dataIndex: 'totalTime',
      render: (text: number, record: Player) => {
        const editable = isEditing(record);
        const dataIndex: keyof Player = 'totalTime';
        return editable ? (
          <Form.Item
            key={record.totalTime}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: false }]}
          ></Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    // {
    //   title: t('Thời điểm đã tạo'),
    //   dataIndex: 'createdAt',
    //   render: (text: number, record: Player) => {
    //     const editable = isEditing(record);
    //     const dataIndex: keyof Player = 'createdAt';
    //     return editable ? (
    //       <Form.Item
    //         key={record.createdAt}
    //         name={dataIndex}
    //         initialValue={text}
    //         rules={[{ required: true, message: 'Người tạo là cần thiết' }]}
    //       ></Form.Item>
    //     ) : (
    //       <span>{formatDateTime(record.createdAt)}</span>
    //     );
    //   },
    // },
  ];

  return (
    <Form form={form} component={false}>
      <SearchInput
        placeholder="Tìm kiếm..."
        allowClear
        onSearch={(value) => {
          const filteredData = data.data.filter((record) =>
            Object.values(record).some((fieldValue) => String(fieldValue).toLowerCase().includes(value.toLowerCase())),
          );
          setData((prevData) => ({ ...prevData, data: filteredData }));
        }}
        onChange={(e) => {
          if (e.target.value.trim() === '') {
            setData((prevData) => ({ ...prevData, data: originalData }));
          }
        }}
        style={{ marginBottom: '16px', width: '400px', right: '0' }}
      />

      <div>
        <Select
          value={eventId}
          onChange={(value) => setEventId(value)}
          style={{ width: 350, marginRight: 10, marginBottom: 10 }}
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
      </div>

      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        columns={columns}
        dataSource={data.data}
        pagination={data.pagination}
        onChange={handleTableChange}
        loading={data.loading}
        scroll={{ x: 1500 }}
        bordered
      />
    </Form>
  );
};
