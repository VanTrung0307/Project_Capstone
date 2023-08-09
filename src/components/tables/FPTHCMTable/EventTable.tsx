/* eslint-disable prettier/prettier */
import { DownOutlined } from '@ant-design/icons';
import { Event, Pagination, createEvent, getPaginatedEvents, updateEvent } from '@app/api/FPT_3DMAP_API/Event';
import { getSchoolbyEventId } from '@app/api/FPT_3DMAP_API/School';
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
import { useNavigate } from 'react-router-dom';
import { EditableCell } from '../editableTable/EditableCell';
import styled from 'styled-components';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const EventTable: React.FC = () => {
  const { t } = useTranslation();

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

  const edit = (record: Partial<Event> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const navigate = useNavigate();

  const handleDetailClick = async (eventId: string) => {
    try {
      const pagination = { current: 1, pageSize: 5 };
      const result = await getSchoolbyEventId(eventId, pagination);
      navigate(`/schools/${eventId}`);

      console.log('Paginated School List:', result.data);
      console.log('Pagination Info:', result.pagination);
    } catch (error) {
      console.error('Error fetching paginated schools:', error);
    }
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof Event) => {
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
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedEvents(pagination).then((res) => {
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

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetch(pagination);
    cancel();
  };

  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const newData: Event = {
        name: values.name,
        startTime: values.startTime,
        endTime: values.endTime,
        status: values.status,
        id: values.id,
      };

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        const createdEvent = await createEvent(newData);
        setData((prevData) => ({
          ...prevData,
          data: [...prevData.data, createdEvent],
          loading: false,
        }));
        form.resetFields();
        setIsBasicModalOpen(false);
        console.log('Event data created successfully');

        getPaginatedEvents(data.pagination).then((res) => {
          setData({ data: res.data, pagination: res.pagination, loading: false });
        });
      } catch (error) {
        console.error('Error creating event data:', error);
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      console.error('Error validating form:', error);
    }
  };

  const columns: ColumnsType<Event> = [
    {
      title: t('Tên sự kiện'),
      dataIndex: 'name',
      render: (text: string, record: Event) => {
        const editable = isEditing(record);
        const dataIndex: keyof Event = 'name';
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a name' }]}
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
      title: t('Thời gian bắt đầu'),
      dataIndex: 'startTime',
      render: (text: number, record: Event) => {
        const editable = isEditing(record);
        const dataIndex: keyof Event = 'startTime';
        return editable ? (
          <Form.Item
            key={record.startTime}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Thời gian bắt đầu là cần thiết' }]}
          >
            <Input
              type="datetime-local"
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
        const dataIndex: keyof Event = 'endTime';
        return editable ? (
          <Form.Item
            key={record.endTime}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Thời gian kết thúc là cần thiết' }]}
          >
            <Input
              type="datetime-local"
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
        const dataIndex: keyof Event = 'status';

        const statusOptions = ['ACTIVE', 'INACTIVE'];

        return editable ? (
          <Form.Item
            key={record.status}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Trạng thái sự kiện là cần thiết' }]}
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
                <Button type="ghost" onClick={() => handleDetailClick(record.id)}>
                  {t('Detail')}
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
        title={'Thêm mới SỰ KIỆN'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
      >
        <S.FormContent>
          <FlexContainer>
            <Label>{'Tên sự kiện'}</Label>
            <InputContainer>
              <BaseForm.Item name="name" rules={[{ required: true, message: t('Tên sự kiện là cần thiết') }]}>
                <Input maxLength={100} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
          <FlexContainer>
            <Label>{'Thời gian bắt đầu'}</Label>
            <InputContainer>
              <BaseForm.Item name="startTime" rules={[{ required: true, message: t('Thời gian bắt đầu là bắt buộc') }]}>
                <Input type="datetime-local" />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
          <FlexContainer>
            <Label>{'Thời gian kết thúc'}</Label>
            <InputContainer>
              <BaseForm.Item name="endTime" rules={[{ required: true, message: t('Thời gian kết thúc là bắt buộc') }]}>
                <Input type="datetime-local" />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
          <FlexContainer>
            <Label>{'Trạng thái'}</Label>
            <InputContainer>
              <BaseForm.Item name="status" rules={[{ required: true, message: t('Trạng thái là cần thiết') }]}>
                <Select placeholder={'---- Select Status ----'}>
                  <Option value="ACTIVE">{'ACTIVE'}</Option>
                  <Option value="INACTIVE">{'INACTIVE'}</Option>
                </Select>
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
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
