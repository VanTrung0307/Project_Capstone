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
        // message.error('Error fetching events');
      }
      try {
        const studentResponse = await getPaginatedUsers({ current: 1, pageSize: 1000 });
        setStudents(studentResponse.data);
      } catch (error) {
        // message.error('Error fetching students');
      }

      try {
        // Fetch schools here and set the schools state
        const schoolResponse = await getPaginatedSchools({ current: 1, pageSize: 1000 });
        setSchools(schoolResponse.data);
      } catch (error) {
        // message.error('Error fetching schools');
      }
    },
    [isMounted],
  );

  useEffect(() => {
    fetch(initialPagination);
  }, [fetch]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetch(pagination);

    // Apply additional filtering based on selected school and event
    let filteredDataAfterPagination = originalData;
    if (selectedSchoolId) {
      filteredDataAfterPagination = filteredDataAfterPagination.filter(
        (record) => record.schoolName === selectedSchoolId,
      );
    }
    if (selectedEventId) {
      filteredDataAfterPagination = filteredDataAfterPagination.filter((record) => record.eventId === selectedEventId);
    }

    setFilteredData(filteredDataAfterPagination);
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
      title: t('Tên trường'),
      dataIndex: 'schoolName',
    },
    {
      title: t('Tên sự kiện'),
      dataIndex: 'eventName',
      filters: eventNameFilters,
      onFilter: (value, record) => record.eventName === value,
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

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  return (
    <Form form={form} component={false}>
      <SearchInput
        placeholder="Tìm kiếm..."
        allowClear
        onSearch={handleSearch}
        onChange={handleSearchChange}
        style={{ marginBottom: '16px', width: '400px', right: '0' }}
      />

      <div style={{ marginBottom: '10px' }}>
        <Select
          value={selectedEventId}
          onChange={(value) => {
            setSelectedEventId(value);
            const filteredDataByEvent = originalData.filter((record) => record.eventId === value);
            setFilteredData(filteredDataByEvent);
          }}
          placeholder="Hãy chọn sự kiện"
          style={{ width: 300, marginRight: 16 }}
          suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
        >
          {events.map((event) => (
            <Select.Option key={event.id} value={event.id}>
              {event.name}
            </Select.Option>
          ))}
        </Select>

        <Select
          value={selectedSchoolId}
          onChange={(value) => {
            setSelectedSchoolId(value);
            const filteredDataBySchool = originalData.filter((record) => record.schoolName === value);
            setFilteredData(filteredDataBySchool);
          }}
          placeholder="Hãy chọn trường"
          style={{ width: 300, marginRight: 16 }}
          suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
        >
          {schools.map((school) => (
            <Select.Option key={school.id} value={school.id}>
              {school.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        columns={columns}
        dataSource={filteredData}
        pagination={data.pagination}
        onChange={handleTableChange}
        loading={data.loading}
        scroll={{ x: 1500 }}
        bordered
      />
    </Form>
  );
};
