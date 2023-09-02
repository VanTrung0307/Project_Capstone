/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DownOutlined } from '@ant-design/icons';
import { Event, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import {
  EventSchool,
  addEventSchool,
  createEventSchool,
  deleteSchoolEvent,
  getSchoolbyEventId,
  updateEventSchool,
  updateSchoolEvent,
} from '@app/api/FPT_3DMAP_API/EventSchool';
import { Pagination, School, getPaginatedSchools, updateSchool } from '@app/api/FPT_3DMAP_API/School';
import { getStudenbySchoolandEventId } from '@app/api/FPT_3DMAP_API/Student';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { useMounted } from '@app/hooks/useMounted';
import { Col, Form, Input, Modal, Row, Select, Space, Spin, Tag, message } from 'antd';
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
import { getTaskbyEventId } from '@app/api/FPT_3DMAP_API/EventTask';

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
        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({ ...data, data: newData, loading: false });
        await updateSchoolEvent(key.toString(), row);
        message.success('Cập nhật thành công');
      } catch (error) {
        message.error('Cập nhật thất bại');
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
      setData((tableData) => ({ ...tableData, loading: false }));
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
        message.error('Không lấy được dữ liệu trường');
      }
    },
    [isMounted, eventId],
  );

  useEffect(() => {
    if (eventId) {
      const pagination: Pagination = { current: 1, pageSize: 1000 };

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
        schoolIds: values.schoolId,
        approvalstatus: values.approvalstatus,
        status: values.status,
        startTime: values.startTime,
        endTime: values.endTime,
      };

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        await createEventSchool(newData);
        form.resetFields();
        setIsBasicModalOpen(false);
        fetch(data.pagination);
        message.success('Thêm trường thành công');
      } catch (error) {
        message.error('Thêm trường thất bại');
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      message.error('Hãy nhập đầy đủ');
    }
  };

  const navigate = useNavigate();

  const handleStudentClick = async (schoolId: string) => {
    try {
      const pagination = { current: 1, pageSize: 1000 };
      navigate(`/student/${schoolId}`);
      await getStudenbySchoolandEventId(schoolId, pagination);
    } catch (error) {
      // message.error('Error fetching paginated schools');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSchoolEvent(id);

      setData((prevTableData) => ({
        ...prevTableData,
        data: prevTableData.data.filter((item) => item.id !== id),
        pagination: {
          ...prevTableData.pagination,
          total: prevTableData.pagination.total ? prevTableData.pagination.total - 1 : prevTableData.pagination.total,
        },
      }));
      message.success(`Xoá trường thành công`);
    } catch (error) {
      message.error('Xoá trường thất bại');
    }
  };

  const columns: ColumnsType<EventSchool> = [
    {
      title: t('Tên trường'),
      dataIndex: 'schoolName',
    },
    {
      title: t('Điện thoại'),
      dataIndex: 'phoneNumber',
      render: (phoneNumber) => {
        const formattedPhoneNumber = `0${phoneNumber}`;
        return <span>{formattedPhoneNumber}</span>;
      },
    },
    {
      title: t('Email'),
      dataIndex: 'email',
    },
    {
      title: t('Thời gian'),
      dataIndex: 'timeRange',
      render: (_, record: EventSchool) => {
        const formattedStartTime = moment(record.startTime).format('DD/MM/YYYY - HH:mm:ss');
        const formattedEndTime = moment(record.endTime).format('DD/MM/YYYY - HH:mm:ss');

        const editable = isEditing(record);
        const startTimeIndex: keyof updateEventSchool = 'startTime';
        const endTimeIndex: keyof updateEventSchool = 'endTime';

        return editable ? (
          <>
            Thời gian bắt đầu
            <Form.Item name={startTimeIndex} initialValue={moment(record.startTime)}>
              <Input
                type="datetime-local"
                style={{ maxWidth: '200px' }}
                disabled
                onChange={(e) => handleInputChange(e.target.value, record.id, startTimeIndex)}
              />
            </Form.Item>
            Thời gian kết thúc
            <Form.Item
              name={endTimeIndex}
              initialValue={moment(record.startTime)}
              rules={[
                {
                  validator: async (_, value) => {
                    const startTime = moment(record.startTime);
                    const endTime = moment(value);

                    if (startTime.hour() === 8 && endTime.hour() > 12) {
                      throw new Error('Thời gian kết thúc không được sau 12:00 PM');
                    }

                    if (startTime.hour() === 13 && endTime.hour() > 17) {
                      throw new Error('Thời gian kết thúc không được sau 5:00 PM');
                    }

                    if (endTime.isBefore(startTime.add(2, 'hours'))) {
                      throw new Error('Thời gian kết thúc phải sau ít nhất 2 giờ so với thời gian bắt đầu');
                    }
                  },
                },
              ]}
            >
              <Input
                type="datetime-local"
                style={{ maxWidth: '200px' }}
                onChange={(e) => handleInputChange(e.target.value, record.id, endTimeIndex)}
              />
            </Form.Item>
          </>
        ) : (
          <span>
            {formattedStartTime} - {formattedEndTime}
          </span>
        );
      },
    },
    {
      title: t('Xác nhận'),
      dataIndex: 'approvalStatus',
      render: (text: string, record: EventSchool) => {
        const dataIndex: keyof EventSchool = 'status';

        return dataIndex ? (
          <span>{text !== 'REFUSE' ? <Tag color="#77DD77">ACCEPT</Tag> : <Tag color="#FF5252">REFUSE</Tag>}</span>
        ) : (
          'Đang đợi trạng thái'
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
      render: (text: string, record: EventSchool) => {
        const dataIndex: keyof EventSchool = 'status';

        return dataIndex ? (
          <span>{text !== 'INACTIVE' ? <Tag color="#339CFD">ACTIVE</Tag> : <Tag color="#FF5252">INACTIVE</Tag>}</span>
        ) : (
          'Đang đợi trạng thái'
        );
      },
    },
    {
      title: t('Chức năng'),
      dataIndex: 'actions',
      render: (text: string, record: EventSchool) => {
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
                <Button danger onClick={() => handleDelete(record.id)}>
                  Xoá
                </Button>
                <Button
                  type="ghost"
                  onClick={() => {
                    if (eventId) {
                      handleStudentClick(record.id);
                    }
                  }}
                >
                  Danh sách học sinh
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

  const [filteredData, setFilteredData] = useState(data.data);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [existingValues, setExistingValues] = useState<EventSchool[]>([]);

  const handleSearch = (value: string) => {
    const updatedFilteredData = data.data.filter((record) =>
      Object.values(record).some((fieldValue) => String(fieldValue).toLowerCase().includes(value.toLowerCase())),
    );
    setFilteredData(updatedFilteredData);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim();

    if (inputValue === '') {
      setFilteredData(data.data);
    } else {
      handleSearch(inputValue);
    }
  };

  const onFinish = (values: { startTime: string; endTime: string }) => {
    console.log('Form values:', values);
  };

  const handleStartTimeChange = (startTime: string) => {
    setLoading(true);
    const formattedStartTime = moment(startTime, 'YYYY-MM-DDTHH:mm').startOf('hour');
    const endTime = formattedStartTime.clone().add(4, 'hours').format('YYYY-MM-DDTHH:mm');
    form.setFieldsValue({ endTime });
    setLoading(false);
  };

  const handleSchoolChange = (values: string[]) => {
    setSelectedSchools(values);
  };

  const handleSchoolBlur = () => {
    const selectedStart = form.getFieldValue('startTime');

    const isDuplicate = existingValues.some(
      (item) =>
        item.startTime === selectedStart &&
        selectedSchools.some((selectedSchool) => item.schoolName === selectedSchool),
    );

    if (isDuplicate) {
      form.setFields([
        {
          name: 'schoolId',
          errors: ['One or more selected schools have already been chosen for the same start time.'],
        },
      ]);
    }
  };

  const [loading, setLoading] = useState(false);

  const handleTaskClick = async (eventId: string) => {
    try {
      const pagination = { current: 1, pageSize: 100 };
      await getTaskbyEventId(eventId, pagination);
      navigate(`/tasks/${eventId}`);
    } catch (error) {
      message.error('Không tìm thấy nhiệm vụ');
    }
  };

  return (
    <Form form={form} component={false} initialValues={{ eventId }} onFinish={onFinish}>
      <Button
        type="primary"
        onClick={() => setIsBasicModalOpen(true)}
        style={{ position: 'absolute', top: '0', right: '0', margin: '15px 20px' }}
      >
        Thêm trường
      </Button>
      <Modal
        title={'Thêm Trường'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
        width={1000}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button key="back" onClick={() => setIsBasicModalOpen(false)}>
              Huỷ
            </Button>
            <Button key="submit" type="primary" onClick={handleModalOk}>
              Thêm
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
                <div>
                  <Label>{'Thời gian bắt đầu'}</Label>
                  <InputContainer>
                    <BaseForm.Item
                      name="startTime"
                      rules={[
                        {
                          required: true,
                          message: t('Hãy chọn thời gian bắt đầu'),
                        },
                        () => ({
                          validator(_, value) {
                            if (!value) {
                              return Promise.resolve();
                            }

                            const formattedValue = moment(value, 'YYYY-MM-DDTHH:mm').format('HH:mm');

                            const is8AM = formattedValue === '08:00';
                            const is1PM = formattedValue === '13:00';

                            if (!is8AM && !is1PM) {
                              return Promise.reject(new Error('Chỉ được chọn thời gian 8 AM hoặc 1 PM'));
                            }

                            const selectedDate = moment(value, 'YYYY-MM-DDTHH:mm');
                            const tomorrow = moment().startOf('day').add(1, 'day');

                            if (selectedDate.isBefore(tomorrow)) {
                              return Promise.reject(
                                new Error(
                                  'Thời gian bắt đầu phải bắt đầu từ ngày mai và chỉ được chọn thời gian 8 AM hoặc 1 PM',
                                ),
                              );
                            }

                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input type="datetime-local" required onChange={(e) => handleStartTimeChange(e.target.value)} />
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>
              {loading && <Spin />}

              <FlexContainer>
                <div>
                  <Label>{'Thời gian kết thúc'}</Label>
                  <InputContainer>
                    <BaseForm.Item
                      name="endTime"
                      rules={[
                        {
                          required: true,
                          message: t('Hãy chọn thời gian kết thúc'),
                        },
                      ]}
                    >
                      <Input type="datetime-local" required disabled />
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>

              <Row>
                <Col>
                  <FlexContainer>
                    <div>
                      <Label>{'Trạng thái'}</Label>
                      <InputContainer>
                        <BaseForm.Item name="status" initialValue={'ACTIVE'}>
                          <Input style={{ width: '100px' }} disabled={true} />
                        </BaseForm.Item>
                      </InputContainer>
                    </div>
                  </FlexContainer>
                </Col>

                <Col>
                  <FlexContainer style={{ marginLeft: '50px' }}>
                    <div>
                      <Label>{'Xác nhận'}</Label>
                      <InputContainer>
                        <BaseForm.Item name="approvalstatus" initialValue={'ACCEPT'}>
                          <Input style={{ width: '100px' }} disabled={true} />
                        </BaseForm.Item>
                      </InputContainer>
                    </div>
                  </FlexContainer>
                </Col>
              </Row>
            </Col>

            <Col span={19} offset={12}>
              <FlexContainer
                style={{
                  marginTop: '-350px',
                  marginLeft: '100px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                <div>
                  <Label>{'Tên trường'}</Label>
                  <InputContainer>
                    <BaseForm.Item name="schoolId" rules={[{ required: true, message: t('Hãy chọn trường') }]}>
                      <Select
                        mode="multiple"
                        placeholder={'Tìm kiếm và Chọn trường'}
                        onBlur={handleSchoolBlur}
                        onChange={handleSchoolChange}
                        suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                        style={{ width: '300px' }}
                        filterOption={(inputValue, option) =>
                          option?.label.toLowerCase().includes(inputValue.toLowerCase()) ?? false
                        }
                        options={school
                          .filter((schoolItem) => schoolItem.status !== 'INACTIVE')
                          .filter((schoolItem) => {
                            return !data.data.some((event) => {
                              const eventStartTime = moment(event.startTime);
                              const eventEndTime = moment(event.endTime);
                              const formattedStartTime = moment(form.getFieldValue('startTime'));
                              const formattedEndTime = moment(form.getFieldValue('endTime'));

                              return (
                                event.schoolId === schoolItem.id &&
                                (formattedStartTime.isBetween(eventStartTime, eventEndTime) ||
                                  formattedEndTime.isBetween(eventStartTime, eventEndTime) ||
                                  eventStartTime.isBetween(formattedStartTime, formattedEndTime) ||
                                  eventEndTime.isBetween(formattedStartTime, formattedEndTime))
                              );
                            });
                          })
                          .map((schoolItem) => ({
                            label: schoolItem.name,
                            value: schoolItem.id,
                          }))}
                      />
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>
            </Col>
          </Row>
        </S.FormContent>
      </Modal>

      <Button
        type="ghost"
        onClick={() => eventId && handleTaskClick(eventId)}
        style={{ position: 'absolute', top: '0', right: '0', margin: '15px 170px' }}
      >
        Danh sách nhiệm vụ
      </Button>

      <SearchInput
        placeholder="Tìm kiếm..."
        allowClear
        onSearch={handleSearch}
        onChange={handleSearchChange}
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
