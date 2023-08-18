/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DownOutlined } from '@ant-design/icons';
import {
  Pagination,
  School,
  SchoolEvent,
  createSchool,
  getPaginatedSchools,
  updateSchool,
} from '@app/api/FPT_3DMAP_API/School';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { Option } from '@app/components/common/selects/Select/Select';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Modal, Select, Space, Tag, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';
import {
  EventSchool,
  SchoolByEvent,
  addEventSchool,
  createEventSchool,
  getSchoolbyEventId,
} from '@app/api/FPT_3DMAP_API/EventSchool';
import { Event, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import { getStudenbySchoolandEventId } from '@app/api/FPT_3DMAP_API/Student';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const SchoolEventTable: React.FC = () => {
  const { t } = useTranslation();
  const { TextArea } = Input;

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: EventSchool[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

  const isEditing = (record: EventSchool) => record.id === editingKey;

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

        message.success('Updated null Major:', updatedItem);

        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({ ...data, data: newData, loading: false });
        await updateSchool(key.toString(), row);
        message.success('School updated successfully');
      } catch (error) {
        message.error('Error updating school data:');
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

  const edit = (record: Partial<EventSchool> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof EventSchool) => {
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
  const [school, setSchool] = useState<School[]>([]);
  const [originalData, setOriginalData] = useState<EventSchool[]>([]);

  const fetch = useCallback(
    async (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      if (eventId) {
        try {
          const res = await getSchoolbyEventId(eventId, pagination);
          if (isMounted.current) {
            setOriginalData(res.data);
            setData({ data: res.data, pagination: res.pagination, loading: false });
          }
        } catch (error) {
          message.error('Error fetching schools');
        }
      }

      try {
        const schoolResponse = await getPaginatedSchools({ current: 1, pageSize: 1000 });
        setSchool(schoolResponse.data);
      } catch (error) {
        message.error('Error fetching schools');
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

  const [eventSchool, setEventSchool] = useState<EventSchool[]>([]);

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const newData: addEventSchool = {
        eventId: values.eventId,
        schoolId: values.schoolId,
        invitationLetter: values.invitationLetter,
        status: values.status,
      };

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        await createEventSchool(newData);
        message.success('School created successfully');
        fetch(data.pagination);
        form.resetFields();
        setIsBasicModalOpen(false);
      } catch (error) {
        message.error('Error creating School data');
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      message.error('Error validating form');
    }
  };

  const navigate = useNavigate();

  const handleDetailClick = (schoolId: string, eventId: string) => {
    navigate(`/students/${schoolId}/${eventId}`);
  };

  const handleStudentClick = async (schoolId: string, eventId: string) => {
    try {
      const pagination = { current: 1, pageSize: 10 };
      navigate(`/student/${schoolId}/${eventId}`);
      await getStudenbySchoolandEventId(schoolId, eventId, pagination);
    } catch (error) {
      message.error('Error fetching paginated schools');
    }
  };

  const columns: ColumnsType<SchoolByEvent> = [
    {
      title: t('Tên trường'),
      dataIndex: 'name',
    },
    {
      title: t('Email'),
      dataIndex: 'email',
    },
    {
      title: t('Địa chỉ nhà trường'),
      dataIndex: 'address',
    },
    {
      title: t('Điện thoại'),
      dataIndex: 'phoneNumber',
    },
    {
      title: t('Trạng thái'),
      dataIndex: 'status',
      filters: [
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'INACTIVE', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (text: string, record: SchoolByEvent) => {
        const dataIndex: keyof Event = 'status';

        return dataIndex ? (
          <span>{text !== 'INACTIVE' ? <Tag color="#339CFD">ACTIVE</Tag> : <Tag color="#FF5252">INACTIVE</Tag>}</span>
        ) : (
          'Đang đợi trạng tháisif'
        );
      },
    },
    {
      title: t('Chức năng'),
      dataIndex: 'actions',
      render: (text: string, record: SchoolByEvent) => {
        return (
          <Button
            type="ghost"
            onClick={() => {
              if (eventId) {
                handleStudentClick(record.id, eventId);
              }
            }}
          >
            {t('Student')}
          </Button>
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
        title={'Thêm TRƯỜNG'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
      >
        <S.FormContent>
          <FlexContainer>
            <Label>{'Tên sự kiện'}</Label>
            <InputContainer>
              <BaseForm.Item name="eventId">
                {event?.name}
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Tên trường'}</Label>
            <InputContainer>
              <BaseForm.Item name="schoolId" rules={[{ required: true, message: t('Xin hãy chọn trường') }]}>
                <Select
                  placeholder={'---- Chọn trường ----'}
                  suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                  style={{ width: '255px' }}
                >
                  {school.map((school) => (
                    <Option key={school.id} value={school.id}>
                      {school.name}
                    </Option>
                  ))}
                </Select>
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Thư mời'}</Label>
            <InputContainer>
              <BaseForm.Item name="invitationLetter" rules={[{ required: true, message: t('Hãy viết thư mời') }]}>
                <TextArea value="invitationLetter" />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Trạng thái'}</Label>
            <InputContainer>
              <BaseForm.Item name="status" rules={[{ required: true, message: t('Hãy chọn trạng thái') }]}>
                <Select placeholder={'---- Chọn trạng thái ----'}>
                  <Option value="ACCEPT">{'ACCEPT'}</Option>
                  <Option value="REFUSE">{'REFUSE'}</Option>
                </Select>
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
