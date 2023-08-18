/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DownOutlined } from '@ant-design/icons';
import { Event, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import {
  EventTask,
  TaskByEvent,
  addEventTask,
  createEventTask,
  getTaskbyEventId,
  updateEventTask,
  updateEventTaskData,
} from '@app/api/FPT_3DMAP_API/EventTask';
import { Item, getPaginatedItems } from '@app/api/FPT_3DMAP_API/Item';
import { Major, getPaginatedMajors } from '@app/api/FPT_3DMAP_API/Major';
import { Npc, getPaginatedNpcs } from '@app/api/FPT_3DMAP_API/NPC';
import { RoomLocation, getPaginatedRoomLocations } from '@app/api/FPT_3DMAP_API/Room&Location';
import { Pagination, Task, getPaginatedTasks, updateTask } from '@app/api/FPT_3DMAP_API/Task';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { Option } from '@app/components/common/selects/Select/Select';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Modal, Select, Space, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const TaskEventTable: React.FC = () => {
  const { t } = useTranslation();

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: TaskByEvent[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [tasks, setTask] = useState<Task[]>([]);
  const { eventId } = useParams<{ eventId: string | undefined }>();
  const [locations, setLocations] = useState<RoomLocation[]>([]);
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const isEditing = (record: TaskByEvent) => record.eventtaskId === editingKey;

  const [form] = Form.useForm();

  const save = async (key: React.Key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data.data];
      const index = newData.findIndex((item) => key === item.eventtaskId);

      let item;

      if (index > -1) {
        item = newData[index];
        const updatedItem = {
          ...item,
          ...row,
          eventId: eventId,
        };

        Object.keys(updatedItem).forEach((field) => {
          if (updatedItem[field] === '') {
            updatedItem[field] = null;
          }
        });

        message.warn('Updated null Task:', updatedItem);

        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({ ...data, data: newData, loading: false });
        await updateEventTask(key.toString(), row);
        fetch(data.pagination);
        message.success('Task data updated successfully');
      } catch (error) {
        message.error('Error updating Task data');
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData((prevData) => ({ ...prevData, data: newData }));
        }
      }
    } catch (errInfo) {
      message.error('Validate Failed');
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const edit = (record: Partial<TaskByEvent> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof TaskByEvent) => {
    const updatedData = data.data.map((record) => {
      if (record.eventtaskId === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const { isMounted } = useMounted();

  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [originalData, setOriginalData] = useState<TaskByEvent[]>([]);

  const fetch = useCallback(
    async (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      if (eventId) {
        try {
          const res = await getTaskbyEventId(eventId, pagination);
          if (isMounted.current) {
            setOriginalData(res.data);
            setData({ data: res.data, pagination: res.pagination, loading: false });
          }
        } catch (error) {
          message.error('Error fetching tasks');
        }
      }

      try {
        const taskResponse = await getPaginatedTasks({ current: 1, pageSize: 10 });
        setTask(taskResponse.data);
      } catch (error) {
        message.error('Error fetching locations');
      }
    },
    [isMounted, eventId],
  );

  useEffect(() => {
    if (eventId) {
      const pagination: Pagination = { current: 1, pageSize: 10 };

      getPaginatedEvents(pagination)
        .then((response) => {
          const eventData = response.data.find((event) => event.id === eventId);
          setEvent(eventData);
        })
        .catch((error) => {
          message.error('Error fetching paginated events:', error);
        });
    }
  }, [eventId]);

  useEffect(() => {
    fetch(initialPagination);
  }, [fetch]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetch(pagination);
    cancel();
  };

  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);

  const [eventTask, setEventTask] = useState<EventTask[]>([]);

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const newEventTask: addEventTask = {
        taskId: values.taskId,
        eventId: values.eventId,
        startTime: values.startTime,
        endTime: values.endTime,
        priority: values.priority,
        point: values.point,
      };

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        const createdEventTask = await createEventTask(newEventTask);

        setEventTask((prevData) => ({
          ...prevData,
          data: [...prevData, createdEventTask],
          loading: false,
        }));

        fetch(data.pagination);

        form.resetFields();
        setIsBasicModalOpen(false);
        message.success('Event Task data created successfully');
      } catch (error) {
        message.error('Error creating Event Task data');
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      message.error('Error validating form');
    }
  };

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

  const columns: ColumnsType<TaskByEvent> = [
    {
      title: t('Tên nhiệm vụ'),
      dataIndex: 'name',
      render: (text: string, record: TaskByEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskByEvent = 'taskId';
        return editable ? (
          <Form.Item
            key={record.taskId}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Địa điểm là cần thiết' }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.taskId, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
            >
              {tasks.map((tasks) => (
                <Select.Option key={tasks.id} value={tasks.id}>
                  {tasks.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },

      showSorterTooltip: false,
    },
    {
      title: t('Tên sự kiện'),
      dataIndex: 'eventName',
      render: (text: number, record: TaskByEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskByEvent = 'eventId';
        return editable ? (
          <Form.Item
            key={record.eventId}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên nhiệm vụ là cần thiết' }]}
          >
            <Input
              disabled
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.eventName, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Điểm thưởng'),
      dataIndex: 'point',
      render: (text: number, record: TaskByEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskByEvent = 'point';
        return editable ? (
          <Form.Item
            key={record.point}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên nhiệm vụ là cần thiết' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.point, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Mức độ'),
      dataIndex: 'priority',
      render: (text: number, record: TaskByEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskByEvent = 'priority';
        return editable ? (
          <Form.Item
            key={record.priority}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a type' }]}
          >
            <Input
              maxLength={100}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.priority, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Thời gian bắt đầu'),
      dataIndex: 'starttime',
      render: (text: string, record: TaskByEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskByEvent = 'starttime';
        return editable ? (
          <Form.Item
            key={record.starttime}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Thời gian bắt đầu là cần thiết' }]}
          >
            <Input
              type="datetime-local"
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.starttime, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{formatDateTime(record.starttime)}</span>
        );
      },
    },
    {
      title: t('Thời gian kết thúc'),
      dataIndex: 'endtime',
      render: (text: string, record: TaskByEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskByEvent = 'endtime';
        return editable ? (
          <Form.Item
            key={record.endtime}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Thời gian kết thúc là cần thiết' }]}
          >
            <Input
              type="datetime-local"
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.endtime, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{formatDateTime(record.endtime)}</span>
        );
      },
    },
    {
      title: t('Chức năng'),
      dataIndex: 'actions',
      render: (text: string, record: TaskByEvent) => {
        const editable = isEditing(record);

        return (
          <Space>
            {editable ? (
              <>
                <Button type="primary" onClick={() => save(record.eventtaskId)}>
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
                  disabled={editingKey === record.eventtaskId}
                  onClick={() => edit({ ...record, key: record.eventtaskId })}
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
    <Form form={form} component={false} initialValues={{ eventId }}>
      <Button
        type="primary"
        onClick={() => setIsBasicModalOpen(true)}
        style={{ position: 'absolute', top: '0', right: '0', margin: '15px 20px' }}
      >
        Thêm mới
      </Button>
      <Modal
        title={'Thêm mới NHIỆM VỤ'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
      >
        <S.FormContent>
          <FlexContainer>
            <Label>{'Tên nhiệm vụ'}</Label>
            <InputContainer>
              <BaseForm.Item name="taskId" rules={[{ required: true, message: t('Tên nhiệm vụ là cần thiết') }]}>
                <Select
                  placeholder={'---- Chọn Nhiệm Vụ ----'}
                  suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                >
                  {tasks.map((tasks) => (
                    <Option key={tasks.id} value={tasks.id}>
                      {tasks.name}
                    </Option>
                  ))}
                </Select>
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Tên sự kiện'}</Label>
            <InputContainer>
              <BaseForm.Item name="eventId">{event?.name}</BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Thời gian bắt đầu'}</Label>
            <InputContainer>
              <BaseForm.Item name="startTime" rules={[{ required: true, message: t('Thời gian bắt đầu là bắt buộc') }]}>
                <Input type="datetime-local" required />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Thời gian kết thúc'}</Label>
            <InputContainer>
              <BaseForm.Item name="endTime" rules={[{ required: true, message: t('Thời gian kết thúc là bắt buộc') }]}>
                <Input type="datetime-local" required />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Mức độ'}</Label>
            <InputContainer>
              <BaseForm.Item name="priority" rules={[{ required: true, message: t('Số lượng là cần thiết') }]}>
                <Input type="number" />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Điểm thưởng'}</Label>
            <InputContainer>
              <BaseForm.Item name="point" rules={[{ required: true, message: t('Điểm thưởng là cần thiết') }]}>
                <Input type="number" />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
        </S.FormContent>
      </Modal>

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
            setOriginalData((prevData) => ({ ...prevData, data: originalData }));
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
