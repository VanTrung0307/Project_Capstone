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
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';

import styled from 'styled-components';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
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

        Object.keys(updatedItem).forEach((field) => {
          if (updatedItem[field] === '') {
            updatedItem[field] = null;
          }
        });

        console.log('Updated null Gift:', updatedItem);

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
  const [originalData, setOriginalData] = useState<Gift[]>([]);

  const fetch = useCallback(
    async (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedGifts(pagination)
        .then((res) => {
          if (isMounted.current) {
            setOriginalData(res.data);
            setData({ data: res.data, pagination: res.pagination, loading: false });
          }
        })
        .catch((error) => {
          console.error('Error fetching paginated gifts:', error);
          setData((tableData) => ({ ...tableData, loading: false }));
        });

      try {
        const eventResponse = await getPaginatedEvents({ current: 1, pageSize: 1000 });
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

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        const createdGift = await createGift(newData);

        const selectedEvent = events.find((event) => event.id === newData.eventId);

        if (selectedEvent) {
          newData.eventId = selectedEvent.id;
        }

        newData.id = createdGift.id;

        setData((prevData) => ({
          ...prevData,
          data: [...prevData.data, createdGift],
          loading: false,
        }));

        form.resetFields();
        setIsBasicModalOpen(false);
        console.log('Gift data created successfully');

        getPaginatedGifts(data.pagination).then((res) => {
          setData({ data: res.data, pagination: res.pagination, loading: false });
        });
      } catch (error) {
        console.error('Error creating Gift data:', error);
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      console.error('Error validating form:', error);
    }
  };

  const uniqueEventNames = new Set(data.data.map((record) => record.eventName));
  const eventNameFilters = Array.from(uniqueEventNames).map((eventName) => ({
    text: eventName,
    value: eventName,
  }));

  const columns: ColumnsType<Gift> = [
    {
      title: t('Tên quà tặng'),
      dataIndex: 'name',
      render: (text: string, record: Gift) => {
        const editable = isEditing(record);
        const dataIndex: keyof Gift = 'name';
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
      filters: eventNameFilters,
      onFilter: (value, record) => record.eventName === value,
      render: (text: string, record: Gift) => {
        const editable = isEditing(record);
        const dataIndex: keyof Gift = 'eventId';
        return editable ? (
          <Form.Item
            key={record.eventId}
            name={dataIndex}
            rules={[{ required: true, message: 'Tên sự kiện là cần thiết' }]}
          >
            <Select
              style={{ maxWidth: '212.03px' }}
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.eventId, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
            >
              {events.map((event) => (
                <Select.Option key={event.id} value={event.id}>
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
        const dataIndex: keyof Gift = 'quantity';
        return editable ? (
          <Form.Item key={record.quantity} name={dataIndex} initialValue={text} rules={[{ required: false }]}>
            <Input
              style={{ maxWidth: '150px' }}
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
        const dataIndex: keyof Gift = 'decription';
        const maxTextLength = 50;
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
      filters: [
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'INACTIVE', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (text: string, record: Gift) => {
        const editable = isEditing(record);
        const dataIndex: keyof Gift = 'status';

        const statusOptions = ['ACTIVE', 'INACTIVE'];

        return editable ? (
          <Form.Item
            key={record.status}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Trạng thái phần qùa là cần thiết' }]}
          >
            <Select
              style={{ maxWidth: '212.03px' }}
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
          <FlexContainer>
            <Label>{'Tên phần quà'}</Label>
            <InputContainer>
              <BaseForm.Item name="name" rules={[{ required: true, message: t('Tên phần quà là cần thiết') }]}>
                <Input maxLength={100} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
          <FlexContainer>
            <Label>{'Mô tả'}</Label>
            <InputContainer>
              <BaseForm.Item name="decription">
                <TextArea autoSize={{ maxRows: 6 }} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
          <FlexContainer>
            <Label>{'Số lượng'}</Label>
            <InputContainer>
              <BaseForm.Item name="quantity">
                <Input type="number" min={0} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
          <FlexContainer>
            <Label>{'Tên sự kiện'}</Label>
            <InputContainer>
              <BaseForm.Item name="eventId" rules={[{ required: true, message: t('Tên sự kiện là cần thiết') }]}>
                <Select
                  style={{ maxWidth: '256px' }}
                  placeholder={'---- Chọn sự kiện ----'}
                  suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                >
                  {events.map((event) => (
                    <Option key={event.id} value={event.id}>
                      {event.name}
                    </Option>
                  ))}
                </Select>
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
          <FlexContainer>
            <Label>{'Trạng thái'}</Label>
            <InputContainer>
              <BaseForm.Item name="status" rules={[{ required: true, message: t('Trạng thái là cần thiết') }]}>
                <Select
                  style={{ maxWidth: '256px' }}
                  placeholder={'---- Chọn trạng thái ----'}
                  suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                >
                  <Option value="ACTIVE">{'ACTIVE'}</Option>
                  <Option value="INACTIVE">{'INACTIVE'}</Option>
                </Select>
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
        </S.FormContent>
      </Modal>

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
