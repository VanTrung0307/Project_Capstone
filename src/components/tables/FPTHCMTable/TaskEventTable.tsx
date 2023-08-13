/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DownOutlined } from '@ant-design/icons';
import { EventTask, addEventTask, createEventTask } from '@app/api/FPT_3DMAP_API/EventTask';
import { Item, getPaginatedItems } from '@app/api/FPT_3DMAP_API/Item';
import { Major, getPaginatedMajors } from '@app/api/FPT_3DMAP_API/Major';
import { Npc, getPaginatedNpcs } from '@app/api/FPT_3DMAP_API/NPC';
import { RoomLocation, getPaginatedRoomLocations } from '@app/api/FPT_3DMAP_API/Room&Location';
import {
  Pagination,
  Task,
  TaskEvent,
  getPaginatedTasks,
  getTaskbyEventId,
  updateTask,
} from '@app/api/FPT_3DMAP_API/Task';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { Option } from '@app/components/common/selects/Select/Select';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Modal, Select, Space, Tag } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';
import { Event, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const TaskEventTable: React.FC = () => {
  const { t } = useTranslation();

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: TaskEvent[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [tasks, setTask] = useState<Task[]>([]);
  const [locations, setLocations] = useState<RoomLocation[]>([]);
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const isEditing = (record: TaskEvent) => record.id === editingKey;

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

        console.log('Updated null Task:', updatedItem);

        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({ ...data, data: newData, loading: false });
        await updateTask(key.toString(), row);
        console.log('Task data updated successfully');
      } catch (error) {
        console.error('Error updating Task data:', error);
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

  const edit = (record: Partial<TaskEvent> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof TaskEvent) => {
    const updatedData = data.data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const { isMounted } = useMounted();
  const { eventId } = useParams<{ eventId: string | undefined }>();
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [originalData, setOriginalData] = useState<TaskEvent[]>([]);

  const fetch = useCallback(
    async (pagination: Pagination) => {
      if (eventId === undefined) {
        console.error('School ID is missing in the URL.');
        return;
      }

      setData((tableData) => ({ ...tableData, loading: true }));
      getTaskbyEventId(eventId, pagination)
        .then((res) => {
          if (isMounted.current) {
            setOriginalData(res.data);
            setData({ data: res.data, pagination: res.pagination, loading: false });
          }
        })
        .catch((error) => {
          console.error('Error fetching paginated tasks:', error);
          setData((tableData) => ({ ...tableData, loading: false }));
        });

      try {
        const locationResponse = await getPaginatedRoomLocations({ current: 1, pageSize: 1000 });
        setLocations(locationResponse.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }

      try {
        const taskResponse = await getPaginatedTasks({ current: 1, pageSize: 1000 });
        setTask(taskResponse.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }

      try {
        const majorResponse = await getPaginatedMajors({ current: 1, pageSize: 1000 });
        setMajors(majorResponse.data);
      } catch (error) {
        console.error('Error fetching majors:', error);
      }

      try {
        const npcResponse = await getPaginatedNpcs({ current: 1, pageSize: 1000 });
        setNpcs(npcResponse.data);
      } catch (error) {
        console.error('Error fetching npcs:', error);
      }

      try {
        const itemResponse = await getPaginatedItems({ current: 1, pageSize: 1000 });
        setItems(itemResponse.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    },
    [isMounted, eventId],
  );

  useEffect(() => {
    if (eventId) {
      const pagination: Pagination = { current: 1, pageSize: 5 };

      getPaginatedEvents(pagination)
        .then((response) => {
          const eventData = response.data.find((event) => event.id === eventId);
          setEvent(eventData);
        })
        .catch((error) => {
          console.error('Error fetching paginated events:', error);
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
        console.log('Event Task data created successfully');

        getPaginatedTasks(data.pagination).then((res) => {
          setData({ data: res.data, pagination: res.pagination, loading: false });
        });
      } catch (error) {
        console.error('Error creating Event Task data:', error);
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      console.error('Error validating form:', error);
    }
  };

  const uniqueMajorNames = new Set(data.data.map((record) => record.majorName));
  const majorNameFilters = Array.from(uniqueMajorNames).map((majorName) => ({
    text: majorName,
    value: majorName,
  }));

  const uniqueTaskTypes = new Set(data.data.map((record) => record.type));
  const taskTypeFilters = Array.from(uniqueTaskTypes).map((taskType) => ({
    text: taskType,
    value: taskType,
  }));

  const columns: ColumnsType<TaskEvent> = [
    {
      title: t('Địa điểm'),
      dataIndex: 'locationName',
      render: (text: string, record: TaskEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskEvent = 'locationName';
        return editable ? (
          <Form.Item
            key={record.locationName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Địa điểm là cần thiết' }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.locationName, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
            >
              {locations.map((location) => (
                <Select.Option key={location.id} value={location.id}>
                  {location.locationName}
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
      title: t('Tên Ngành'),
      dataIndex: 'majorName',
      filters: majorNameFilters,
      onFilter: (value, record) => record.majorName === value,
      render: (text: string, record: TaskEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskEvent = 'majorName';
        return editable ? (
          <Form.Item
            key={record.majorName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên ngành nghề là cần thiết' }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.majorName, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
            >
              {majors.map((major) => (
                <Select.Option key={major.id} value={major.id}>
                  {major.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: t('Tên NPC'),
      dataIndex: 'npcName',
      render: (text: string, record: TaskEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskEvent = 'npcName';
        return editable ? (
          <Form.Item
            key={record.npcName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên NPC là cần thiết' }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.npcName, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
            >
              {npcs.map((npc) => (
                <Select.Option key={npc.id} value={npc.id}>
                  {npc.name}
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
      title: t('Vật phẩm'),
      dataIndex: 'itemName',
      render: (text: string, record: TaskEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskEvent = 'itemName';
        return editable ? (
          <Form.Item key={record.itemName} name={dataIndex} initialValue={text} rules={[{ required: false }]}>
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.itemName, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
            >
              {items.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <span>{text !== null ? text : 'Không có'}</span>
        );
      },
    },
    {
      title: t('Tên nhiệm vụ'),
      dataIndex: 'name',
      render: (text: string, record: TaskEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskEvent = 'name';
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên nhiệm vụ là cần thiết' }]}
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
    },
    {
      title: t('Loại nhiệm vụ'),
      dataIndex: 'type',
      filters: taskTypeFilters,
      onFilter: (value, record) => record.type === value,
      render: (text: string, record: TaskEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskEvent = 'type';
        return editable ? (
          <Form.Item
            key={record.type}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a type' }]}
          >
            <Input
              maxLength={100}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.type, dataIndex)}
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
      filters: [
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'INACTIVE', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (text: string, record: TaskEvent) => {
        const editable = isEditing(record);
        const dataIndex: keyof TaskEvent = 'status';

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
      render: (text: string, record: TaskEvent) => {
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
              <BaseForm.Item name="eventId" rules={[{ required: true, message: t('Loại nhiệm vụ là cần thiết') }]}>
                {event?.name}
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
            <Label>{'Số lượng'}</Label>
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
        scroll={{ x: 1500 }}
        bordered
      />
    </Form>
  );
};
