/* eslint-disable prettier/prettier */
import { DownOutlined } from '@ant-design/icons';
import { Pagination, RoomLocation, createRoomLocation, getPaginatedRoomLocations, updateRoomLocation } from '@app/api/FPT_3DMAP_API/Room&Location';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { Form, Input, Modal, Select, Space, Tag } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSProperties } from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';
import { useMounted } from '@app/hooks/useMounted';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const RoomAndLocationTable: React.FC = () => {

  const { t } = useTranslation();
  
  const filterDropdownStyles: CSSProperties = {
    height: '50px',
    maxWidth: '300px',
    width: '100%',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 5px 10px rgba(0, 0, 0, 0.1)',
    border: '2px solid white',
    right: '10px',
  };

  const inputStyles = {
    height: '100%',
    width: '100%',
    outline: 'none',
    fontSize: '18px',
    fontWeight: '400',
    border: 'none',
    borderRadius: '8px',
    padding: '0 155px 0 25px',
    backgroundColor: '#25284B',
    color: 'white',
  };

  const buttonStyles: CSSProperties = {
    height: '30px',
    width: '60px', // Adjust the width to accommodate the text
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    right: '20px',
    fontSize: '16px',
    fontWeight: '400',
    color: '#fff',
    border: 'none',
    padding: '4px 10px', // Adjust the padding to position the text
    borderRadius: '6px',
    backgroundColor: '#4070f4',
    cursor: 'pointer',
  };

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

        // Kiểm tra và chuyển các trường rỗng thành giá trị null
        Object.keys(updatedItem).forEach((field) => {
          if (updatedItem[field] === "") {
            updatedItem[field] = null;
          }
        });

        console.log("Updated null Room&Location:", updatedItem); // Kiểm tra giá trị trước khi gọi API

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
        console.log('Room location data updated successfully');
      } catch (error) {
        console.error('Error updating room location data:', error);
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData((prevData) => ({ ...prevData, data: newData, loading: false }));
        }
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
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
    setData((prevData) => ({ ...prevData, data: updatedData}));
  };

  const { isMounted } = useMounted();

  const fetch = useCallback(
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedRoomLocations(pagination).then((res) => {
        if (isMounted.current) {
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

    // Cập nhật giá trị searchValue khi người dùng thay đổi ô tìm kiếm
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

      setData((prevData) => ({ ...prevData, loading: true })); // Show loading state

    try {
      const createdRoomLocation = await createRoomLocation(newData);
      setData((prevData) => ({
        ...prevData,
        data: [...prevData.data, createdRoomLocation],
        loading: false, // Hide loading state after successful update
      }));
      form.resetFields();
      setIsBasicModalOpen(false);
      console.log('RoomLocation data created successfully');

      // Fetch the updated data after successful creation
      getPaginatedRoomLocations(data.pagination).then((res) => {
        setData({ data: res.data, pagination: res.pagination, loading: false });
      });
    } catch (error) {
      console.error('Error creating RoomLocation data:', error);
      setData((prevData) => ({ ...prevData, loading: false })); // Hide loading state on error
    }
  } catch (error) {
    console.error('Error validating form:', error);
  }
  };

  const columns: ColumnsType<RoomLocation> = [
    {
      title: t('Tọa độ X'),
      dataIndex: 'x',
      render: (text: number, record: RoomLocation) => {
        const editable = isEditing(record);
        const dataIndex: keyof RoomLocation = 'x'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.x}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tọa độ x là cần thiết' }]}
          >
            <Input
              type='number'
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.x, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
      },
    {
      title: t('Tọa độ Y'),
      dataIndex: 'y',
      render: (text: number, record: RoomLocation) => {
        const editable = isEditing(record);
        const dataIndex: keyof RoomLocation = 'y'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.y}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tọa độ y là cần thiết' }]}
          >
            <Input
              type='number'
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.y, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
      },
    {
      title: t('Tọa độ Z'),
      dataIndex: 'z',
      render: (text: number, record: RoomLocation) => {
        const editable = isEditing(record);
        const dataIndex: keyof RoomLocation = 'z'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.z}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tọa độ z là cần thiết' }]}
          >
            <Input
              type='number'
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.z, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
      },
      {
        title: t('Tên trường'),
        dataIndex: 'locationName',
        render: (text: string, record: RoomLocation) => {
          const editable = isEditing(record);
          const dataIndex: keyof RoomLocation = 'locationName'; // Define dataIndex here
          return editable ? (
            <Form.Item
              key={record.locationName}
              name={dataIndex}
              initialValue={text}
              rules={[{ required: true, message: 'Tên vị trí là cần thiết' }]}
            >
              <Input
                maxLength={100}
                value={record[dataIndex]}
                onChange={(e) => handleInputChange(e.target.value, record.locationName, dataIndex)}
              />
            </Form.Item>
          ) : (
            <span>{text}</span>
          );
        },
      },
      {
        title: t('Trạng thái'),
        dataIndex: 'status',
        width: '8%',
        render: (text: string, record: RoomLocation) => {
          const editable = isEditing(record);
          const dataIndex: keyof RoomLocation = 'status';
  
          const statusOptions = ['ACTIVE', 'INACTIVE'];
  
          return editable ? (
            <Form.Item
              key={record.status}
              name={dataIndex}
              initialValue={text}
              rules={[{ required: true, message: 'Trạng thái tọa độ là cần thiết' }]}
            >
              <Select
                value={text}
                onChange={(value) => handleInputChange(value, record.status, dataIndex)}
                suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
              >
                {statusOptions.map((option) => (
                  <Select.Option key={option} value={option}>
                    {option}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <span>{text !== "INACTIVE" ? <Tag color="#339CFD">ACTIVE</Tag> : <Tag color="#FF5252">INACTIVE</Tag>}</span>
          );
        },
      },
    {
      title: t('Chức năng'),
      dataIndex: 'actions',
      width: '8%',
      render: (text: string, record: RoomLocation) => {
        const editable = isEditing(record);
        return (
          <Space>
            {editable ? (
              <>
                <Button type="primary" onClick={() => save(record.id)}>
                  {t('common.save')}
                </Button>
                <Button type="ghost" onClick={cancel}>
                  {t('common.cancel')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="ghost"
                  disabled={editingKey === record.id}
                  onClick={() => edit({ ...record, key: record.id })}
                >
                  {t('common.edit')}
                </Button>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Form form={form} component={false}>
      <Button
        type="primary"
        onClick={() => setIsBasicModalOpen(true)}
        style={{ position: 'absolute', top: '0', right: '0', margin: '15px 20px' }}
      >
        Thêm mới
      </Button>
      <Modal
        title={'Thêm TỌA ĐỘ & VỊ TRÍ'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
      >
        <S.FormContent>
           
          <BaseForm.Item name="x" label={'Tọa độ x'} rules={[{ required: true, message: t('Tọa độ x là cần thiết') }]}>
            <Input type='number' />
          </BaseForm.Item>

          <BaseForm.Item name="y" label={'Tọa độ y'} rules={[{ required: true, message: t('Tọa độ y là cần thiết') }]}>
            <Input type='number' />
          </BaseForm.Item>

          <BaseForm.Item name="z" label={'Tọa độ z'} rules={[{ required: true, message: t('Tọa độ z là cần thiết') }]}>
            <Input type='number' />
          </BaseForm.Item>

          <BaseForm.Item name="locationName" label={'Tên vị trí'} rules={[{ required: true, message: t('TTên vị trí là cần thiết') }]}>
            <Input maxLength={100} />
          </BaseForm.Item>

          <BaseForm.Item
            name="status"
            label={'Trạng thái'}
            rules={[{ required: true, message: t('Trạng thái là cần thiết') }]}
          >
            <Select 
              placeholder={'---- Select Status ----'}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
            >
              <Option value="ACTIVE">{'ACTIVE'}</Option>
              <Option value="INACTIVE">{'INACTIVE'}</Option>
            </Select>
          </BaseForm.Item>

        </S.FormContent>
      </Modal>
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
        scroll={{ x: 800 }}
        bordered
      />
    </Form>
  );
};
