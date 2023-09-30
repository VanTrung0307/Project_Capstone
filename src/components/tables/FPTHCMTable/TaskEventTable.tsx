/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DownOutlined } from '@ant-design/icons';
import { Event, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import { getSchoolbyEventId } from '@app/api/FPT_3DMAP_API/EventSchool';
import {
  EventTask,
  TaskByEvent,
  addEventTask,
  createListEventTask,
  deleteEventTask,
  getTaskbyEventId,
  updateEventTask,
} from '@app/api/FPT_3DMAP_API/EventTask';
import { Pagination, Task, getPaginatedTasks } from '@app/api/FPT_3DMAP_API/Task';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { useMounted } from '@app/hooks/useMounted';
import { Col, Form, Input, Modal, Row, Select, Space, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';
import { TaskTableModal } from './TaskTableModal';
import './Select.css';
import { Major, getPaginatedMajors } from '@app/api/FPT_3DMAP_API/Major';
import { Option } from 'antd/lib/mentions';

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
  const [major, setMajor] = useState<Major[]>([]);
  const { eventId } = useParams<{ eventId: string | undefined }>();

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

        // message.warn('Updated null Task:', updatedItem);

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
        const taskResponse = await getPaginatedTasks({ current: 1, pageSize: 100 });
        setTask(taskResponse.data);
      } catch (error) {
        // message.error('Error fetching locations');
      }

      try {
        const majorResponse = await getPaginatedMajors({ current: 1, pageSize: 100 });
        setMajor(majorResponse.data);
      } catch (error) {
        // message.error('Error fetching locations');
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

  const [eventTask, setEventTask] = useState<{ data: EventTask[] }>({ data: [] });

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const newEventTask: addEventTask = {
        taskId: values.taskId,
        eventId: values.eventId,
        startTime: values.startTime,
        endTime: values.endTime,
        point: values.point,
        status: values.status,
      };

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        const createdEventTask = await createListEventTask(newEventTask);

        setEventTask((prevData) => ({
          ...prevData,
          data: [...prevData.data, createdEventTask],
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
      console.error(error); // Log the error for debugging purposes
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEventTask(id);

      setData((prevTableData) => ({
        ...prevTableData,
        data: prevTableData.data.filter((item) => item.eventtaskId !== id),
        pagination: {
          ...prevTableData.pagination,
          total: prevTableData.pagination.total ? prevTableData.pagination.total - 1 : prevTableData.pagination.total,
        },
      }));
      message.success(`Xoá nhiệm vụ thành công`);
    } catch (error) {
      message.error('Xoá nhiệm vụ thất bại');
    }
  };

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
              suffixIcon={<DownOutlined style={{ color: '#FF7C00' }} />}
              dropdownStyle={{ background: '#414345' }}
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
      title: 'Tên ngành',
      dataIndex: 'majorName',
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'starttime',
      width: '8%',
      render: (text: number, record: TaskByEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskByEvent = 'starttime';
        const formattedText = moment(text, 'HH:mm').format('HH:mm');
        const formattedValue = moment(record[dataIndex], 'HH:mm').format('HH:mm');

        return editable ? (
          <Form.Item
            key={record.starttime}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập thời gian bắt đầu' }]}
          >
            <Input
              type="time"
              value={formattedValue}
              onChange={(e) => handleInputChange(e.target.value, record.starttime, dataIndex)}
              style={{ background: '#414345' }}
            />
          </Form.Item>
        ) : (
          <span>{formattedText}</span>
        );
      },
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endtime',
      width: '8%',
      render: (text: number, record: TaskByEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskByEvent = 'endtime';
        const formattedText = moment(text, 'HH:mm').format('HH:mm');
        const formattedValue = moment(record[dataIndex], 'HH:mm').format('HH:mm');

        return editable ? (
          <Form.Item
            key={record.endtime}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập thời gian kết thúc' }]}
          >
            <Input
              type="time"
              value={formattedValue}
              onChange={(e) => handleInputChange(e.target.value, record.endtime, dataIndex)}
              style={{ background: '#414345' }}
            />
          </Form.Item>
        ) : (
          <span>{formattedText}</span>
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
              style={{ background: '#414345' }}
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
                  disabled={editingKey === record.eventtaskId}
                  onClick={() => edit({ ...record, key: record.eventtaskId })}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  danger
                  onClick={() => handleDelete(record.eventtaskId)}
                  style={{ background: '#FF5252', color: 'white' }}
                >
                  Xoá
                </Button>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  const FlexContainer = styled.div`
    display: relative;
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

  const handleStartTimeChange = (timeValue: string, form: any) => {
    const [hour, minute] = timeValue.split(':');

    if ((hour === '08' && minute === '00') || (hour === '13' && minute === '00')) {
      let newEndTime;
      if (hour === '08') {
        newEndTime = moment().set({ hour: 12, minute: 0 });
      } else {
        newEndTime = moment().set({ hour: 17, minute: 0 });
      }

      form.setFieldsValue({ startTime: timeValue, endTime: newEndTime.format('HH:mm') });
    } else {
      message.error('Thời gian bắt đầu phải là 8 AM hoặc 1 PM');
      form.setFieldsValue({ startTime: '', endTime: '' });
    }
  };

  const handleEndTimeChange = (timeValue: string, form: any) => {
    const [hour, minute] = timeValue.split(':');

    if ((hour === '12' && minute === '00') || (hour === '17' && minute === '00')) {
      let newStartTime;
      if (hour === '12') {
        newStartTime = moment().set({ hour: 8, minute: 0 });
      } else {
        newStartTime = moment().set({ hour: 13, minute: 0 });
      }

      form.setFieldsValue({ endTime: timeValue, startTime: newStartTime.format('HH:mm') });
    } else {
      message.error('Thời gian kết thúc phải là 12 PM hoặc 5 PM');
      form.setFieldsValue({ endTime: '', startTime: '' });
    }
  };

  const navigate = useNavigate();

  const handleSchoolClick = async (eventId: string) => {
    try {
      const pagination = { current: 1, pageSize: 100 };
      await getSchoolbyEventId(eventId, pagination);
      navigate(`/schools/${eventId}`);
    } catch (error) {
      message.error('Không tìm thấy trường');
    }
  };

  const [selectedMajor, setSelectedMajor] = useState<null | Major[]>(null);

  const handleMajorChange = (value: string) => {
    const foundMajor = major.find((majorItem) => majorItem.id === value);
    if (foundMajor) {
      setSelectedMajor([foundMajor]);
    } else {
      setSelectedMajor([]);
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
        className="custom-modal"
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
        width={1000}
        style={{ marginTop: '-100px' }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button key="back" onClick={() => setIsBasicModalOpen(false)} style={{ background: '#414345' }}>
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
                  <BaseForm.Item name="eventId" style={{ color: '#FF7C00', fontWeight: 'bold', fontSize: '25px' }}>
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
                    <Input
                      type="time"
                      required
                      onChange={(e) => handleStartTimeChange(e.target.value, form)}
                      style={{ background: '#414345' }}
                    />
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>

              <FlexContainer>
                <Label>{'Thời gian kết thúc'}</Label>
                <InputContainer>
                  <BaseForm.Item name="endTime" rules={[{ required: true, message: t('Hãy nhập thời gian kết thúc') }]}>
                    <Input
                      type="time"
                      required
                      onChange={(e) => handleEndTimeChange(e.target.value, form)}
                      disabled
                      style={{ background: '#1D1C1A' }}
                    />
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>

              <FlexContainer>
                <Label>{'Điểm thưởng'}</Label>
                <InputContainer>
                  <BaseForm.Item name="point" rules={[{ required: true, message: t('Hãy nhập điểm thưởng') }]}>
                    <Input style={{ width: '250px', background: '#414345' }} type="number" />
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>

              <FlexContainer>
                <Label>{'Trạng thái'}</Label>
                <InputContainer>
                  <BaseForm.Item name="status" initialValue={'ACTIVE'}>
                    <Input style={{ width: '100px', background: '#1D1C1A' }} disabled={true} />
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>
            </Col>

            <Col span={19} offset={12}>
              <FlexContainer
                style={{
                  marginTop: '-380px',
                  marginLeft: '100px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                <div>
                  <Label>{'Tên ngành học'}</Label>
                  <BaseForm.Item rules={[{ required: true, message: t('Hãy chọn ngành học') }]}>
                    <Select
                      style={{ width: '300px', marginBottom: '16px' }}
                      value={selectedMajor && selectedMajor.length > 0 ? selectedMajor[0].id : undefined}
                      onChange={handleMajorChange}
                      suffixIcon={<DownOutlined style={{ color: '#FF7C00' }} />}
                    >
                      <Option value="">Chọn ngành học</Option>
                      {/* Generate options dynamically from the 'major' array */}
                      {major
                        .filter((taskItem) => taskItem.status !== 'INACTIVE')
                        .map((task) => (
                          <Option key={task.id} value={task.id}>
                            {task.name}
                          </Option>
                        ))}
                    </Select>
                  </BaseForm.Item>
                </div>
              </FlexContainer>

              <FlexContainer
                style={{
                  marginLeft: '100px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                <div>
                  <Label>{'Tên nhiệm vụ'}</Label>
                  <BaseForm.Item name="taskId" rules={[{ required: true, message: t('Hãy chọn nhiệm vụ') }]}>
                    {selectedMajor && (
                      <Select
                        mode="multiple"
                        style={{ width: '300px' }}
                        placeholder="Chọn nhiệm vụ"
                        showSearch
                        dropdownStyle={{ background: '#414345' }}
                        filterOption={(inputValue, option) =>
                          option?.label.toLowerCase().includes(inputValue.toLowerCase()) ?? false
                        }
                        options={tasks
                          .filter(
                            (taskItem) =>
                              taskItem.status !== 'INACTIVE' &&
                              selectedMajor?.some((major) => major.name === taskItem.majorName),
                          )
                          .map((task) => ({
                            label: task.name,
                            value: task.id,
                          }))}
                      />
                    )}
                  </BaseForm.Item>
                </div>
              </FlexContainer>
            </Col>
          </Row>
          <TaskTableModal />
        </S.FormContent>
      </Modal>

      {/* <Button
        type="ghost"
        onClick={() => eventId && handleSchoolClick(eventId)}
        style={{ position: 'absolute', top: '0', right: '0', margin: '15px 140px' }}
      >
        Danh sách trường
      </Button> */}

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
