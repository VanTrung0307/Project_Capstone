/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DownOutlined } from '@ant-design/icons';
import { Event, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import {
  EventTask,
  TaskByEvent,
  addEventTask,
  createListEventTask,
  getTaskbyEventId,
  updateEventTask,
} from '@app/api/FPT_3DMAP_API/EventTask';
import { Pagination, Task, getPaginatedTasks } from '@app/api/FPT_3DMAP_API/Task';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { useMounted } from '@app/hooks/useMounted';
import { Col, Form, Input, Modal, Row, Select, Space, TimePicker, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';
import { TaskTableModal } from './TaskTableModal';
import { Option } from '@app/components/common/selects/Select/Select';
import moment from 'moment';

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
  // const [locations, setLocations] = useState<RoomLocation[]>([]);
  // const [npcs, setNpcs] = useState<Npc[]>([]);
  // const [majors, setMajors] = useState<Major[]>([]);
  // const [items, setItems] = useState<Item[]>([]);

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
        message.success('Cập nhật nhiệm vụ thành công');
      } catch (error) {
        message.error('Cập nhật nhiệm vụ thất bại');
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData((prevData) => ({ ...prevData, data: newData }));
        }
      }
    } catch (errInfo) {
      message.error('Lỗi hệ thống');
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
        // priority: values.priority,
        point: values.point,
        status: values.status,
      };

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        const createdEventTask = await createListEventTask(newEventTask);

        setEventTask((prevData) => ({
          ...prevData,
          data: [...prevData, createdEventTask],
          loading: false,
        }));

        form.resetFields();
        setIsBasicModalOpen(false);
        fetch(data.pagination);
        message.success('Thêm nhiệm vụ vào sự kiện thành công');
      } catch (error) {
        message.error('Thêm nhiệm vụ vào sự kiện thất bại');
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      message.error('Lỗi hệ thống');
    }
  };

  // const formatTimeSpan = (timeSpan: any): string => {
  //   const hours = timeSpan.hours ? `${timeSpan.hours}h ` : '';
  //   const minutes = timeSpan.minutes ? `${timeSpan.minutes}m` : '';
  //   const seconds = timeSpan.seconds ? `${timeSpan.seconds}s` : '';
  //   return `${hours}:${minutes}:${seconds}`;
  // };

  const columns: ColumnsType<TaskByEvent> = [
    {
      title: t('Tên nhiệm vụ'),
      dataIndex: 'name',
      width: '25%',
      render: (text: string, record: TaskByEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskByEvent = 'taskId';
        return editable ? (
          <Form.Item
            key={record.taskId}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập tên nhiệm vụ' }]}
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
      width: '25%',
      render: (text: number, record: TaskByEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskByEvent = 'eventId';
        return editable ? (
          <Form.Item key={record.eventId} name={dataIndex} initialValue={text}>
            <Input
              disabled
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.eventId, dataIndex)}
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
      width: '8%',
      render: (text: number, record: TaskByEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskByEvent = 'point';
        return editable ? (
          <Form.Item
            key={record.point}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập điểm thưởng' }]}
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
      width: '8%',
      render: (text: number, record: TaskByEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskByEvent = 'priority';
        return editable ? (
          <Form.Item
            key={record.priority}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập mức độ' }]}
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
      title: t('Chức năng'),
      dataIndex: 'actions',
      width: '8%',
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
    ::before {
      content: '* ';
      color: red;
    }
  `;

  const InputContainer = styled.div`
    flex: 1;
  `;

  const handleStartTimeChange = (time: moment.Moment | null, timeString: string, form: any) => {
    form.setFieldsValue({ endTime: moment(time).add(4, 'hours') });
  };

  const handleEndTimeChange = (time: moment.Moment | null, timeString: string, form: any) => {
    const startTime = form.getFieldValue('startTime');
    if (startTime) {
      const diff = moment(time).diff(startTime, 'hours');
      if (diff !== 4) {
        form.setFieldsValue({ startTime: moment(time).subtract(4, 'hours') });
      }
    }
  };

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
        title={'Thêm mới Nhiệm vụ'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
        width={1000}
        style={{ marginTop: '-100px' }}
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
          <Row>
            <Col span={24}>
              <div>
                <FlexContainer>
                  <Label>{'Tên sự kiện'}</Label>
                  <BaseForm.Item name="eventId" style={{ color: '#339CFD', fontWeight: 'bold', fontSize: '25px' }}>
                    {event?.name}
                  </BaseForm.Item>
                </FlexContainer>
              </div>
            </Col>
          </Row>

          <Row>
            <Col span={8}>
              <FlexContainer>
                <Label>{'Thời gian bắt đầu'}</Label>
                <InputContainer>
                  <BaseForm.Item
                    name="startTime"
                    rules={[{ required: true, message: t('Hãy nhập thời gian bắt đầu') }]}
                  >
                    <TimePicker
                      format="HH:mm"
                      allowClear={true}
                      onChange={(time, timeString) => handleStartTimeChange(time, timeString, form)}
                      showNow={false}
                      disabledHours={() => [
                        0,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        9,
                        10,
                        11,
                        12,
                        14,
                        15,
                        16,
                        17,
                        18,
                        19,
                        20,
                        21,
                        22,
                        23,
                      ]}
                      disabledMinutes={() => [
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11,
                        12,
                        13,
                        14,
                        15,
                        16,
                        17,
                        18,
                        19,
                        20,
                        21,
                        22,
                        23,
                        24,
                        25,
                        26,
                        27,
                        28,
                        29,
                        30,
                        31,
                        32,
                        33,
                        34,
                        35,
                        36,
                        37,
                        38,
                        39,
                        40,
                        41,
                        42,
                        43,
                        44,
                        45,
                        46,
                        47,
                        48,
                        49,
                        50,
                        51,
                        52,
                        53,
                        54,
                        55,
                        56,
                        57,
                        58,
                        59,
                      ]}
                      placeholder="Chọn thời gian bắt đầu"
                      style={{ width: '250px' }}
                    />
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>

              <FlexContainer>
                <Label>{'Thời gian kết thúc'}</Label>
                <InputContainer>
                  <BaseForm.Item name="endTime" rules={[{ required: true, message: t('Hãy nhập thời gian kết thúc') }]}>
                    <TimePicker
                      format="HH:mm"
                      allowClear={false}
                      disabled
                      showNow={false}
                      onChange={(time, timeString) => handleEndTimeChange(time, timeString, form)}
                      placeholder="Chọn thời gian kết thúc"
                      style={{ width: '250px' }}
                    />
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>

              <FlexContainer>
                <Label>{'Điểm thưởng'}</Label>
                <InputContainer>
                  <BaseForm.Item name="point" rules={[{ required: true, message: t('Hãy nhập điểm thưởng') }]}>
                    <Input style={{ width: '100px' }} type="number" />
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>

              <FlexContainer>
                <Label>{'Trạng thái'}</Label>
                <InputContainer>
                  <BaseForm.Item name="status" initialValue={'ACTIVE'}>
                    <Input style={{ width: '100px' }} disabled={true} />
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>
            </Col>

            <Col span={19} offset={12}>
              <FlexContainer
                style={{
                  marginTop: '-355px',
                  marginLeft: '100px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                <div>
                  <Label>{'Tên nhiệm vụ'}</Label>
                  <BaseForm.Item name="taskId" rules={[{ required: true, message: t('Hãy chọn nhiệm vụ') }]}>
                    <Select
                      mode="multiple"
                      style={{ width: '300px' }}
                      placeholder="Chọn nhiệm vụ"
                      showSearch
                      filterOption={(inputValue, option) =>
                        option?.label.toLowerCase().includes(inputValue.toLowerCase()) ?? false
                      }
                      options={tasks
                        .filter((taskItem) => taskItem.status !== 'INACTIVE')
                        .map((task) => ({
                          label: task.name,
                          value: task.id,
                        }))}
                    />
                  </BaseForm.Item>
                </div>
              </FlexContainer>
            </Col>
          </Row>

          <TaskTableModal />
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
        scroll={{ x: 800 }}
        bordered
      />
    </Form>
  );
};
