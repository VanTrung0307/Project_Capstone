/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DownOutlined } from '@ant-design/icons';
import {
  Pagination,
  RoomLocation,
  createRoomLocation,
  getPaginatedRoomLocations,
  updateRoomLocation,
} from '@app/api/FPT_3DMAP_API/Room&Location';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Modal, Select, Space, Tag, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditableCell } from '../editableTable/EditableCell';
import styled from 'styled-components';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { FilterCheckboxGroup } from '@app/components/nft-dashboard/recentActivity/recentActivityFilters/RecentActivityStatusFilter/RecentActivityStatusFilter.styles';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const RoomAndLocationTable: React.FC = () => {
  const { t } = useTranslation();

  const [searchValue, setSearchValue] = useState('');

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: RoomLocation[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

  const isEditing = (record: RoomLocation) => record.id === editingKey;

  const [form] = Form.useForm();

  const save = async (key: React.Key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data.data];
      const index = newData.findIndex((item) => key === item.id);

      let item;

      if (index > -1) {
        item = newData[index];
        const updatedItem = {
          ...item,
          ...row,
        };

        Object.keys(updatedItem).forEach((field) => {
          if (updatedItem[field] === '') {
            updatedItem[field] = null;
          }
        });

        // message.success('Updated null Room&Location:', updatedItem);

        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({ ...data, data: newData, loading: false });
        await updateRoomLocation(key.toString(), row);
        message.success('Cập nhật thành công');
        fetch(data.pagination);
      } catch (error) {
        message.error('Cập nhật thất bại');
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData((prevData) => ({ ...prevData, data: newData, loading: false }));
        }
      }
    } catch (errInfo) {
      message.error('Lỗi hệ thống');
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const edit = (record: Partial<RoomLocation> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof RoomLocation) => {
    const updatedData = data.data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const { isMounted } = useMounted();
  const [originalData, setOriginalData] = useState<RoomLocation[]>([]);

  const fetch = useCallback(
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedRoomLocations(pagination).then((res) => {
        if (isMounted.current) {
          setOriginalData(res.data);
          setData({ data: res.data, pagination: res.pagination, loading: false });
        }
      });
    },
    [isMounted],
  );

  useEffect(() => {
    fetch(initialPagination);
  }, [fetch]);

  const handleTableChange = (pagination: TablePaginationConfig, filters: Record<string, any>, sorter: any) => {
    const { current, pageSize } = pagination;
    const paginationParams: Pagination = { current, pageSize };

    if (filters.locationName) {
      setSearchValue(filters.locationName[0]);
    } else {
      setSearchValue('');
    }

    fetch(paginationParams);
  };

  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const newData: RoomLocation = {
        x: values.x,
        y: values.y,
        z: values.z,
        locationName: values.locationName,
        status: values.status,
        id: values.id,
      };

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        const createdRoomLocation = await createRoomLocation(newData);
        setData((prevData) => ({
          ...prevData,
          data: [...prevData.data, createdRoomLocation],
          loading: false,
        }));
        form.resetFields();
        setIsBasicModalOpen(false);
        message.success('RoomLocation data created successfully');
        fetch(data.pagination);
      } catch (error) {
        message.error('Error creating RoomLocation data');
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      message.error('Error validating form');
    }
  };

  const columns: ColumnsType<RoomLocation> = [
    {
      title: t('Tọa độ X'),
      dataIndex: 'x',
      render: (text: string) => {
        return <span>{text}</span>;
      },
    },
    {
      title: t('Tọa độ Y'),
      dataIndex: 'y',
      render: (text: string) => {
        return <span>{text}</span>;
      },
    },
    {
      title: t('Tọa độ Z'),
      dataIndex: 'z',
      render: (text: string) => {
        return <span>{text}</span>;
      },
    },
    {
      title: t('Tên vị trí'),
      dataIndex: 'locationName',
      width: '25%',
      render: (text: string) => {
        return <span>{text}</span>;
      },
    },
    {
      title: t('Trạng thái'),
      dataIndex: 'status',
      width: '5%',
      filters: [
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'INACTIVE', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (text: string, record: RoomLocation) => {
        const editable = isEditing(record);
        const dataIndex: keyof RoomLocation = 'status';

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
              suffixIcon={<DownOutlined style={{ color: '#FF7C00' }} />}
              dropdownStyle={{ background: '#414345' }}
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
    {
      title: t('Chức năng'),
      dataIndex: 'actions',
      width: '5%',
      render: (text: string, record: RoomLocation) => {
        const editable = isEditing(record);
        return (
          <Space>
            {editable ? (
              <>
                <Button type="primary" onClick={() => save(record.id)}>
                  Lưu
                </Button>
                <Button type="ghost" onClick={cancel}>
                  Huỷ
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="ghost"
                  disabled={editingKey === record.id}
                  onClick={() => edit({ ...record, key: record.id })}
                >
                  Chỉnh sửa
                </Button>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  const FlexContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  `;

  const Label = styled.label`
    flex: 0 0 200px;
  `;

  const InputContainer = styled.div`
    flex: 1;
  `;

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
        scroll={{ x: 1200 }}
        bordered
      />
    </Form>
  );
};
