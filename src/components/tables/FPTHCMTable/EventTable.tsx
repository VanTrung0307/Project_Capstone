/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DownOutlined, UploadOutlined } from '@ant-design/icons';
import { Event, Pagination, createEvent, getPaginatedEvents, updateEvent } from '@app/api/FPT_3DMAP_API/Event';
import { getSchoolbyEventId } from '@app/api/FPT_3DMAP_API/EventSchool';
import { getTaskbyEventId } from '@app/api/FPT_3DMAP_API/EventTask';
import { Upload } from '@app/components/common/Upload/Upload';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Modal, Select, Space, Tag, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';

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
        message.success('Event updated successfully');
      } catch (error) {
        message.error('Error updating Event data:');
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData((prevData) => ({ ...prevData, data: newData }));
        }
      }
    } catch (errInfo) {
      message.error('Validate Failed:');
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

  const handleSchoolClick = async (eventId: string) => {
    try {
      const pagination = { current: 1, pageSize: 10 };
      await getSchoolbyEventId(eventId, pagination);
      navigate(`/schools/${eventId}`);
    } catch (error) {
      message.error('Error fetching paginated schools:');
    }
  };

  const handleTaskClick = async (eventId: string) => {
    try {
      const pagination = { current: 1, pageSize: 10 };
      await getTaskbyEventId(eventId, pagination);
      navigate(`/tasks/${eventId}`);
    } catch (error) {
      message.error('Error fetching paginated task');
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
  const [originalData, setOriginalData] = useState<Event[]>([]);

  const fetch = useCallback(
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedEvents(pagination).then((res) => {
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

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetch(pagination);
    cancel();
  };

  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

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
        await createEvent(newData);
        message.success('Event created successfully');
        fetch(data.pagination);
        form.resetFields();
        setIsBasicModalOpen(false);
      } catch (error) {
        message.error('Error creating event data');
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      message.error('Error validating form');
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
      filters: [
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'INACTIVE', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
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
      width: '15%',
      render: (text: string, record: Event) => {
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
                <Button type="ghost" onClick={() => setIsActionModalOpen(true)}>
                  Danh sách
                </Button>
                <Modal
                  title={'Chức năng'}
                  open={isActionModalOpen}
                  onCancel={() => setIsActionModalOpen(false)}
                  footer
                  mask={true}
                  maskStyle={{ opacity: 0.4 }}
                >
                  <div style={{ display: 'flex', marginBottom: '10px' }}>
                    <Button type="primary" onClick={() => handleSchoolClick(record.id)} style={{ marginRight: '10px' }}>
                      Danh sách trường
                    </Button>
                    <Button type="primary" onClick={() => handleTaskClick(record.id)}>
                      Danh sách nhiệm vụ
                    </Button>
                  </div>
                </Modal>
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

  const uploadProps = {
    name: 'file',
    multiple: true,
    action: `http://anhkiet-001-site1.htempurl.com/api/Events/upload-excel-event`,
    onChange: (info: any) => {
      const { status } = info.file;
      if (status !== 'uploading') {
        message.warn(`${name} ${status}`);
      }
      if (status === 'done') {
        message.success(t('uploads.successUpload', { name: info.file.name }));
        fetch(data.pagination);
      } else if (status === 'error') {
        message.error(t('uploads.failedUpload', { name: info.file.name }));
      }
    },
  };

  return (
    <Form form={form} component={false}>
      <Button
        type="primary"
        onClick={() => setIsBasicModalOpen(true)}
        style={{ position: 'absolute', top: '0', right: '0', margin: '15px 20px' }}
      >
        Tạo mới
      </Button>
      <Modal
        title={'Thêm mới SỰ KIỆN'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
        mask={true}
        maskStyle={{ opacity: 1 }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button key="back" onClick={() => setIsBasicModalOpen(false)}>
              Huỷ
            </Button>
            <Button key="submit" type="primary" onClick={handleModalOk}>
              Tạo
            </Button>
          </div>
        }
      >
        <S.FormContent>
          <FlexContainer>
            <Label>{'Tên sự kiện'}</Label>
            <InputContainer>
              <BaseForm.Item
                name="name"
                rules={[
                  { required: true, message: t('Tên sự kiện là cần thiết') },
                  {
                    pattern: /^[^\s].*/,
                    message: 'Không được bắt đầu bằng khoảng trắng',
                  },
                ]}
              >
                <Input maxLength={100} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
          <FlexContainer>
            <Label>{'Thời gian bắt đầu'}</Label>
            <InputContainer>
              <BaseForm.Item
                name="startTime"
                rules={[
                  {
                    required: true,
                    message: t('Thời gian bắt đầu là bắt buộc'),
                  },
                  () => ({
                    validator(_, value) {
                      if (!value) {
                        return Promise.resolve();
                      }

                      const selectedDate = moment(value);
                      const today = moment().startOf('day');
                      const startOfDay = moment().set('hour', 7).set('minute', 0).set('second', 0);
                      const endOfDay = moment().set('hour', 18).set('minute', 0).set('second', 0);

                      if (selectedDate.isBefore(today)) {
                        return Promise.reject(new Error('Thời gian bắt đầu phải là ngày hôm nay'));
                      }

                      if (selectedDate.isBefore(startOfDay) || selectedDate.isAfter(endOfDay)) {
                        return Promise.reject(new Error('Thời gian bắt đầu phải trong khoảng từ 7 AM đến 6 PM'));
                      }

                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input type="datetime-local" required />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
          <FlexContainer>
            <Label>{'Thời gian kết thúc'}</Label>
            <InputContainer>
              <BaseForm.Item
                name="endTime"
                rules={[
                  {
                    required: true,
                    message: t('Thời gian kết thúc là bắt buộc'),
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value) {
                        return Promise.resolve();
                      }

                      const startTime = getFieldValue('startTime');
                      if (!startTime) {
                        return Promise.resolve();
                      }

                      const startMoment = moment(startTime);
                      const endMoment = moment(value);

                      if (endMoment.isBefore(startMoment.add(2, 'hours'))) {
                        return Promise.reject(new Error('Thời gian kết thúc phải ít nhất 2 giờ sau thời gian bắt đầu'));
                      }

                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input type="datetime-local" required />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
          <FlexContainer>
            <Label>{'Trạng thái'}</Label>
            <InputContainer>
              <BaseForm.Item name="status">
                <Input defaultValue="INACTIVE" disabled />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
        </S.FormContent>
      </Modal>

      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />} style={{ position: 'absolute', top: '0', right: '0', margin: '15px 130px' }}>
          Nhập Excel
        </Button>
      </Upload>

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
        scroll={{ x: 1000 }}
        bordered
      />
    </Form>
  );
};
