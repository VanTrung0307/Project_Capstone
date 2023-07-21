/* eslint-disable prettier/prettier */
import { SearchOutlined } from '@ant-design/icons';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { Status } from '@app/components/profile/profileCard/profileFormNav/nav/payments/paymentHistory/Status/Status';
import { defineColorByPriority } from '@app/utils/utils';
import { Col, Form, Input, Modal, Row, Select, Space } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Event, getPaginatedEvents, updateEvent, Pagination } from '@app/api/FPT_3DMAP_API/Event';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSProperties } from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';
import { useMounted } from '@app/hooks/useMounted';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const EventTable: React.FC = () => {
  
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
  const [data, setData] = useState<{ data: Event[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

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

  const isEditing = (record: Event) => record.id === editingKey;

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
        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({ ...data, data: newData, loading: false });
        await updateEvent(key.toString(), row);
        console.log('Event data updated successfully');
      } catch (error) {
        console.error('Error updating Event data:', error);
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData((prevData) => ({ ...prevData, data: newData}));
        }
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  // const edit = (record: Partial<Event> & { key: React.Key }) => {
  //   form.setFieldsValue(record);
  //   setEditingKey(record.key);
  // };

  const edit = (record: Partial<Event> & { key: React.Key }) => {
    const unformattedRecord = data.data.find((item) => item.id === record.id);
    if (unformattedRecord) {
      form.setFieldsValue({
        ...unformattedRecord,
        startTime: formatDateTime(unformattedRecord.startTime), // Format the startTime field
        endTime: formatDateTime(unformattedRecord.endTime), // Format the endTime field
      });
      setEditingKey(record.key);
    }
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof Event) => {
    const updatedData = data.data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData}));
  };

  const { isMounted } = useMounted();

  // const fetch = useCallback(
  //   (pagination: Pagination) => {
  //     setData((tableData) => ({ ...tableData, loading: true }));
  //     getPaginatedEvents(pagination).then((res) => {
  //       if (isMounted.current) {
  //         setData({ data: res.data, pagination: res.pagination, loading: false });
  //       }
  //     });
  //   },
  //   [isMounted],
  // );

  const fetch = useCallback((pagination: Pagination) => {
    setData((tableData) => ({ ...tableData, loading: true }));
    getPaginatedEvents(pagination).then((res) => {
      if (isMounted.current) {
        const formattedEvents = res.data.map((event) => ({
          ...event,
          startTimeFormatted: formatDateTime(event.startTime), // Store formatted startTime
          endTimeFormatted: formatDateTime(event.endTime), // Store formatted endTime
        }));
        setData({ data: formattedEvents, pagination: res.pagination, loading: false });
      }
    });
  }, [isMounted]);

  useEffect(() => {
    fetch(initialPagination);
  }, [fetch]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetch(pagination);
    cancel();
  };

  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      // Create a new data object from the form values
      const newData = {
        name: values.name,
        startTime: 0,
        endTime: 0,
        status: values.status,
        id: values.id,
      };

      // Update the tableData state with the new data
      setData((prevData) => ({
        ...prevData,
        data: [...prevData.data, newData],
      }));

      form.resetFields(); // Reset the form fields
      setIsBasicModalOpen(false); // Close the modal
    });
  };

  const columns: ColumnsType<Event> = [
    {
      title: t('Tên sự kiện'),
      dataIndex: 'name',
      render: (text: string, record: Event) => {
        const editable = isEditing(record);
        const dataIndex: keyof Event = 'name'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.name, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
      onFilter: (value: string | number | boolean, record: Event) =>
        record.name.toLowerCase().includes(value.toString().toLowerCase()),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => {
        const handleSearch = () => {
          confirm();
          setSearchValue(selectedKeys[0]?.toString());
        };

        return (
          <div style={filterDropdownStyles} className="input-box">
            <Input
              type="text"
              placeholder="Search here..."
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value.toString()] : [])}
              style={inputStyles}
            />
            <Button onClick={handleSearch} className="button" style={buttonStyles}>
              Filter
            </Button>
          </div>
        );
      },
      filterIcon: () => <SearchOutlined />,
      filtered: searchValue !== '', // Apply filtering if searchValue is not empty
    },
    {
      title: t('Thời gian bắt đầu'),
      dataIndex: 'startTime',
      render: (text: number, record: Event) => {
        const editable = isEditing(record);
        const dataIndex: keyof Event = 'startTime'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.startTime}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a startTime' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.startTime, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{formatDateTime(record.startTime)}</span>
        );
      },
      },
    {
      title: t('Thời gian kết thúc'),
      dataIndex: 'endTime',
      render: (text: number, record: Event) => {
        const editable = isEditing(record);
        const dataIndex: keyof Event = 'endTime'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.endTime}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a endTime' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.endTime, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{formatDateTime(record.endTime)}</span>
        );
      },
      },
      {
        title: t('Trạng thái'),
        dataIndex: 'status',
        width: '8%',
        render: (text: string, record: Event) => {
          const editable = isEditing(record);
          const dataIndex: keyof Event = 'status'; // Define dataIndex here
          return editable ? (
            <Form.Item
              key={record.status}
              name={dataIndex}
              initialValue={text}
              rules={[{ required: true, message: 'Please enter a status' }]}
            >
              <Input
                value={record[dataIndex].toString()}
                onChange={(e) => handleInputChange(e.target.value, record.status, dataIndex)}
              />
            </Form.Item>
          ) : (
            <span>{text}</span>
          );
        },
      },
    {
      title: t('Chức năng'),
      dataIndex: 'actions',
      width: '8%',
      render: (text: string, record: Event) => {
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
        Add Data
      </Button>
      <Modal
        title={'Add Player'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
      >
        <S.FormContent>
          <BaseForm.Item name="name" label={'Name'} rules={[{ required: true, message: t('Hãy điền tên người chơi') }]}>
            <Input />
          </BaseForm.Item>
          <BaseForm.Item
            name="email"
            label={'Email'}
            rules={[{ required: true, message: t('Hãy điền email người chơi') }]}
          >
            <Input />
          </BaseForm.Item>
          <BaseForm.Item name="phone" label={'Phone'} rules={[{ required: true, message: t('Nhập số điện thoại') }]}>
            <Input />
          </BaseForm.Item>
          <BaseForm.Item name="gender" label={'Gender'} rules={[{ required: true, message: t('Nhập giới tính') }]}>
            <Input />
          </BaseForm.Item>
          <BaseForm.Item
            name="country"
            label={'Status'}
            rules={[{ required: true, message: t('Trạng thái người chơi là cần thiết') }]}
          >
            <Select placeholder={'Status'}>
              <Option value="active">{'Đang hoạt động'}</Option>
              <Option value="inactive">{'Không hoạt động'}</Option>
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
