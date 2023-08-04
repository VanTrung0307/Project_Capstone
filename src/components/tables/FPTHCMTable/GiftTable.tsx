/* eslint-disable prettier/prettier */
import { DownOutlined } from '@ant-design/icons';

import { Gift, Pagination, createGift, getPaginatedGifts, updateGift } from '@app/api/FPT_3DMAP_API/Gift';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Modal, Select, Space, Tag } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditableCell } from '../editableTable/EditableCell';
import { Event, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 5,
};

export const GiftTable: React.FC = () => {
  const { t } = useTranslation();
  const { TextArea } = Input;

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: Gift[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [events, setEvents] = useState<Event[]>([]);

  const isEditing = (record: Gift) => record.id === editingKey;

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
          if (updatedItem[field] === '') {
            updatedItem[field] = null;
          }
        });

        console.log('Updated null Gift:', updatedItem); // Kiểm tra giá trị trước khi gọi API

        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({ ...data, data: newData, loading: false });
        await updateGift(key.toString(), row);
        console.log('Gift data updated successfully');
      } catch (error) {
        console.error('Error updating Gift data:', error);
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData((prevData) => ({ ...prevData, data: newData }));
        }
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const edit = (record: Partial<Gift> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof Gift) => {
    const updatedData = data.data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const { isMounted } = useMounted();

  const fetch = useCallback(
    async (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedGifts(pagination)
        .then((res) => {
          if (isMounted.current) {
            setData({ data: res.data, pagination: res.pagination, loading: false });
          }
        })
        .catch((error) => {
          console.error('Error fetching paginated gifts:', error);
          setData((tableData) => ({ ...tableData, loading: false }));
        });

      // Fetch the list of events and store it in the "events" state
      try {
        const eventResponse = await getPaginatedEvents({ current: 1, pageSize: 1000 }); // Adjust the pagination as needed
        setEvents(eventResponse.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
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

  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const newData: Gift = {
        name: values.name,
        decription: values.decription,
        eventId: values.eventId,
        eventName: values.eventName,
        quantity: values.quantity,
        status: values.status,
        id: values.id,
      };

      setData((prevData) => ({ ...prevData, loading: true })); // Show loading state

      try {
        const createdGift = await createGift(newData);

        // Fetch the event data using the selected "rankevent" from the form
        const selectedEvent = events.find((event) => event.name === newData.eventName);

        // If the selected event is found, set its ID to the newData
        if (selectedEvent) {
          newData.eventId = selectedEvent.id;
        }

        // Assign the ID received from the API response to the newData
        newData.id = createdGift.id;

        setData((prevData) => ({
          ...prevData,
          data: [...prevData.data, createdGift],
          loading: false, // Hide loading state after successful update
        }));

        form.resetFields();
        setIsBasicModalOpen(false);
        console.log('Gift data created successfully');

        // Fetch the updated data after successful creation
        getPaginatedGifts(data.pagination).then((res) => {
          setData({ data: res.data, pagination: res.pagination, loading: false });
        });
      } catch (error) {
        console.error('Error creating Gift data:', error);
        setData((prevData) => ({ ...prevData, loading: false })); // Hide loading state on error
      }
    } catch (error) {
      console.error('Error validating form:', error);
    }
  };

  const columns: ColumnsType<Gift> = [
    {
      title: t('Tên quà tặng'),
      dataIndex: 'name',
      render: (text: string, record: Gift) => {
        const editable = isEditing(record);
        const dataIndex: keyof Gift = 'name'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên quà tặng là cần thiết' }]}
          >
            <Input
              maxLength={100}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.name, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Tên sự kiện'),
      dataIndex: 'eventName',
      render: (text: string, record: Gift) => {
        const editable = isEditing(record);
        const dataIndex: keyof Gift = 'eventName'; // Define dataIndex here
        return editable ? (
          <Form.Item key={record.eventName} name={dataIndex} initialValue={text} rules={[{ required: false }]}>
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.eventName, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
            >
              {events.map((event) => (
                <Select.Option key={event.id} value={event.name}>
                  {event.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <span>{text !== null ? text : 'Chưa có thông tin'}</span>
        );
      },
    },
    {
      title: t('Số lượng'),
      dataIndex: 'quantity',
      render: (text: number, record: Gift) => {
        const editable = isEditing(record);
        const dataIndex: keyof Gift = 'quantity'; // Define dataIndex here
        return editable ? (
          <Form.Item key={record.quantity} name={dataIndex} initialValue={text} rules={[{ required: false }]}>
            <Input
              type="number"
              min={0}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.quantity, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text !== null ? text : 'Chưa có thông tin'}</span>
        );
      },
    },
    {
      title: t('Mô tả'),
      dataIndex: 'decription',
      render: (text: string, record: Gift) => {
        const editable = isEditing(record);
        const dataIndex: keyof Gift = 'decription'; // Define dataIndex here
        const maxTextLength = 255;
        const truncatedText = text?.length > maxTextLength ? `${text.slice(0, maxTextLength)}...` : text;
        return editable ? (
          <Form.Item key={record.decription} name={dataIndex} initialValue={text} rules={[{ required: false }]}>
            <TextArea
              autoSize={{ maxRows: 6 }}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.decription, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{truncatedText !== null ? truncatedText : 'Chưa có thông tin'}</span>
        );
      },
    },
    {
      title: t('Trạng thái'),
      dataIndex: 'status',
      width: '8%',
      render: (text: string, record: Gift) => {
        const editable = isEditing(record);
        const dataIndex: keyof Gift = 'status'; // Define dataIndex here

        const statusOptions = ['ACTIVE', 'INACTIVE'];

        return editable ? (
          <Form.Item
            key={record.status}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Trạng thái phần qùa là cần thiết' }]}
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
    {
      title: t('Chức năng'),
      dataIndex: 'actions',
      width: '8%',
      render: (text: string, record: Gift) => {
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
        title={'Thêm mới PHẦN QUÀ'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
      >
        <S.FormContent>
          <BaseForm.Item
            name="name"
            label={'Tên phần quà'}
            rules={[{ required: true, message: t('Tên phần quà là cần thiết') }]}
          >
            <Input maxLength={100} />
          </BaseForm.Item>

          <BaseForm.Item name="decription" label={'Mô tả'}>
            <TextArea autoSize={{ maxRows: 6 }} />
          </BaseForm.Item>

          <BaseForm.Item name="quantity" label={'Số lượng'}>
            <Input type="number" min={0} />
          </BaseForm.Item>

          <BaseForm.Item
            name="eventId"
            label={'Tên sự kiện'}
            rules={[{ required: true, message: t('Tên sự kiện là cần thiết') }]}
          >
            <Select placeholder={'---- Select Event ----'} suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}>
              {events.map((event) => (
                <Option key={event.id} value={event.id}>
                  {event.name}
                </Option>
              ))}
            </Select>
          </BaseForm.Item>

          <BaseForm.Item
            name="status"
            label={'Trạng thái'}
            rules={[{ required: true, message: t('Trạng thái là cần thiết') }]}
          >
            <Select placeholder={'---- Select Status ----'} suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}>
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
