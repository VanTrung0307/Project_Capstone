/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Event, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import { getHistoryPaginatedPlayers } from '@app/api/FPT_3DMAP_API/HistoryPlayer';
import {
  Pagination,
  PlayerFilter,
  getPaginatedPlayersWithEventandSchool
} from '@app/api/FPT_3DMAP_API/Player';
import { School, getPaginatedSchools } from '@app/api/FPT_3DMAP_API/School';
import { User } from '@app/api/FPT_3DMAP_API/User';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { useMounted } from '@app/hooks/useMounted';
import { Button, Form, Space, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { EditableCell } from '../editableTable/EditableCell';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

type EventsProps = {
  eventId?: string;
};

export const PlayerTable: React.FC<EventsProps & { selectedSchoolId: string }> = ({ eventId, selectedSchoolId }) => {
  const { t } = useTranslation();

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: PlayerFilter[]; pagination: Pagination; loading: boolean }>({
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

  const isEditing = (record: PlayerFilter) => record.id === editingKey;
  const cancel = () => {
    setEditingKey('');
  };

  const [form] = Form.useForm();

  const { isMounted } = useMounted();

  // const [eventId, setEventId] = useState<string>('');
  // const [schoolId, setSchoolId] = useState<string>('');

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
        getPaginatedPlayersWithEventandSchool(selectedSchoolId, eventId, pagination).then((res) => {
          if (isMounted.current) {
            setData({ data: res.data, pagination: res.pagination, loading: false });
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

  const navigate = useNavigate();

  const handlePlayerClick = async (playerId: string) => {
    try {
      const pagination = { current: 1, pageSize: 100 };
      await getHistoryPaginatedPlayers(playerId, pagination);
      navigate(`/players/${playerId}`);
    } catch (error) {
      message.error('Không tìm thấy học sinh này');
    }
  };

  const columns: ColumnsType<PlayerFilter> = [
    {
      title: t('Tên học sinh'),
      dataIndex: 'studentName',
    },
    {
      title: t('Biệt danh'),
      dataIndex: 'nickname',
    },
    {
      title: t('Email'),
      dataIndex: 'studentEmail',
    },
    {
      title: t('Sự kiện'),
      dataIndex: 'eventName',
    },
    {
      title: t('Trên trường'),
      dataIndex: 'schoolName',
    },
    {
      title: t('Mã tham gia'),
      dataIndex: 'passcode',
    },
    {
      title: t('Tổng điểm thưởng'),
      dataIndex: 'totalPoint',
    },
    {
      title: t('Tổng thời gian hoàn thành'),
      dataIndex: 'totalTime',
    },
    {
      title: t('Chức năng'),
      dataIndex: 'actions',
      width: '1%',
      render: (text: string, record: PlayerFilter) => {
        const editable = isEditing(record);
        return (
          <Space>
            <Button type="ghost" onClick={() => handlePlayerClick(record.id)}>
              Lịch sử người chơi
            </Button>
          </Space>
        );
      },
    },
  ];

  const [filteredData, setFilteredData] = useState(data.data);

  const handleSearch = (value: string) => {
    const updatedFilteredData = data.data.filter((record) =>
      Object.values(record).some((fieldValue) => String(fieldValue).toLowerCase().includes(value.toLowerCase())),
    );
    setFilteredData(updatedFilteredData);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim();

    if (inputValue === '') {
      setFilteredData(data.data);
    } else {
      handleSearch(inputValue);
    }
  };

  return (
    <Form form={form} component={false}>
      <SearchInput
        placeholder="Tìm kiếm..."
        allowClear
        onSearch={handleSearch}
        onChange={handleSearchChange}
        style={{ marginBottom: '16px', width: '400px', right: '0' }}
      />

      {/* <div style={{ marginBottom: '10px' }}>
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

        {schoolId && (
          <Select
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
          </Select>
        )}
      </div> */}

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
