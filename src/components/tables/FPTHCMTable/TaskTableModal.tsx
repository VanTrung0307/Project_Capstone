/* eslint-disable prettier/prettier */
import { DownOutlined } from '@ant-design/icons';
import { Pagination, Task, getPaginatedTasks } from '@app/api/FPT_3DMAP_API/Task';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Select, Tag, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditableCell } from '../editableTable/EditableCell';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 5,
};

export const TaskTableModal: React.FC = () => {
  const { t } = useTranslation();

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: Task[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

  const isEditing = (record: Task) => record.id === editingKey;

  const [form] = Form.useForm();

  const cancel = () => {
    setEditingKey('');
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof Task) => {
    const updatedData = data.data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const { isMounted } = useMounted();
  const [originalData, setOriginalData] = useState<Task[]>([]);

  const fetch = useCallback(
    async (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedTasks(pagination)
        .then((res) => {
          if (isMounted.current) {
            setOriginalData(res.data);
            setData({ data: res.data, pagination: res.pagination, loading: false });
          }
        })
        .catch((error) => {
          message.error('Error fetching paginated tasks:', error);
          setData((tableData) => ({ ...tableData, loading: false }));
        });
    },
    [isMounted],
  );

  useEffect(() => {
    fetch(initialPagination);
  }, [fetch]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetch(pagination);
    cancel();
  };

  const columns: ColumnsType<Task> = [
    {
      title: t('Tên nhiệm vụ'),
      dataIndex: 'name',
    },
    {
      title: t('Địa điểm'),
      dataIndex: 'locationName',
    },
    {
      title: t('Tên NPC'),
      dataIndex: 'npcName',
    },
    {
      title: t('Tên Ngành'),
      dataIndex: 'majorName',
    },
    {
      title: t('Loại nhiệm vụ'),
      dataIndex: 'type',
    },
    // {
    //   title: t('Điểm thưởng'),
    //   dataIndex: 'point',
    //   render: (text: number, record: Task) => {
    //     const editable = isEditing(record);
    //     const dataIndex: keyof Task = 'point';
    //     return editable ? (
    //       <Form.Item
    //         key={record.point}
    //         name={dataIndex}
    //         initialValue={text}
    //         rules={[{ required: true, message: 'Please enter a point' }]}
    //       >
    //         <Input
    //           type="number"
    //           value={record[dataIndex]}
    //           onChange={(e) => handleInputChange(e.target.value, record.point, dataIndex)}
    //         />
    //       </Form.Item>
    //     ) : (
    //       <span>{text}</span>
    //     );
    //   },
    // },
    {
      title: t('Vật phẩm'),
      dataIndex: 'itemName',
      render: (text: string | null) => {
        return <span>{text !== null ? text : 'Không có'}</span>;
      },
    },
    {
      title: t('Trạng thái'),
      dataIndex: 'status',
      filters: [
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'INACTIVE', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (text: string, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'status';

        const statusOptions = ['ACTIVE', 'INACTIVE'];

        return editable ? (
          <Form.Item
            key={record.status}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Trạng thái là cần thiết' }]}
          >
            <Select
              value={text}
              onChange={(value) => handleInputChange(value, record.status, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
            >
              {statusOptions.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <span>{text !== 'INACTIVE' ? <Tag color="#339CFD">ACTIVE</Tag> : <Tag color="#FF5252">INACTIVE</Tag>}</span>
        );
      },
    },
  ];

  return (
    <Form form={form} component={false}>
      <SearchInput
        placeholder="Search..."
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
        scroll={{ x: 1500 }}
        bordered
      />
    </Form>
  );
};
