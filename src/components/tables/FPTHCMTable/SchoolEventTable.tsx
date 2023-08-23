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
import { Col, DatePicker, Form, Input, Modal, Row, Select, Space, Tag, message } from 'antd';
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
import moment from 'moment';

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

  const isEditing = (record: SchoolByEvent) => record.id === editingKey;

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
        message.success('Thêm trường thành công');
      } catch (error) {
        message.error('Thêm trường thất bại');
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData((prevData) => ({ ...prevData, data: newData }));
        }
      }
    } catch (errInfo) {
      message.error('Hãy nhập đầy đủ');
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
        message.error('Không lấy được dữ liệu trường');
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
        schoolIds: values.schoolId,
        approvalstatus: values.approvalstatus,
        status: values.status,
        startTime: values.startTime,
        endTime: values.endTime,
      };

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        await createEventSchool(newData);
        fetch(data.pagination);
        message.success('Thêm trường thành công');
        form.resetFields();
        setIsBasicModalOpen(false);
      } catch (error) {
        message.error('Thêm trường thất bại');
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      message.error('Hãy nhập đầy đủ');
    }
  };

  const navigate = useNavigate();

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
      title: t('Địa chỉ nhà trường'),
      dataIndex: 'address',
    },
    // {
    //   title: t('Thời gian bắt đầu'),
    //   dataIndex: 'startTime',
    //   render: (text: string) => moment(text).format('DD/MM/YYYY - HH:mm:ss'),
    // },
    // {
    //   title: t('Thời gian kết thúc'),
    //   dataIndex: 'endTime',
    //   render: (text: string) => moment(text).format('DD/MM/YYYY - HH:mm:ss'),
    // },
    {
      title: t('Thời gian'),
      dataIndex: 'timeRange',
      render: (_, record: SchoolByEvent) => {
        const formattedStartTime = moment(record.startTime).format('DD/MM/YYYY - HH:mm:ss');
        const formattedEndTime = moment(record.endTime).format('DD/MM/YYYY - HH:mm:ss');

        const editable = isEditing(record);
        const startTimeIndex: keyof SchoolByEvent = 'startTime';
        const endTimeIndex: keyof SchoolByEvent = 'endTime';

        return editable ? (
          <div>
            Start time:
            <Form.Item key={startTimeIndex} name={startTimeIndex} initialValue={moment(record.startTime)}>
              <DatePicker showTime format="DD/MM/YYYY - HH:mm:ss" style={{ maxWidth: '200px', marginRight: '8px' }} />
            </Form.Item>
            End time:
            <Form.Item key={endTimeIndex} name={endTimeIndex} initialValue={moment(record.endTime)}>
              <DatePicker showTime format="DD/MM/YYYY - HH:mm:ss" style={{ maxWidth: '200px' }} />
            </Form.Item>
          </div>
        ) : (
          <span>{`${formattedStartTime} - ${formattedEndTime}`}</span>
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
      render: (text: string, record: SchoolByEvent) => {
        const dataIndex: keyof Event = 'status';

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
      render: (text: string, record: SchoolByEvent) => {
        const editable = isEditing(record);
        return (
          <Space>
            {editable ? (
              <>
                <Button type="primary" onClick={() => save(record.id.toString())}>
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
                <Button
                  type="ghost"
                  onClick={() => {
                    if (eventId) {
                      handleStudentClick(record.id, eventId);
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

  return (
    <Form form={form} component={false} initialValues={{ eventId }}>
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

                            const selectedDate = moment(value);
                            const tomorrow = moment().startOf('day').add(1, 'day');

                            if (selectedDate.isBefore(tomorrow)) {
                              return Promise.reject(new Error('Thời gian bắt đầu phải bắt đầu từ ngày mai'));
                            }

                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input type="datetime-local" required />
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>

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
                              return Promise.reject(
                                new Error('Thời gian kết thúc phải ít nhất 2 giờ sau thời gian bắt đầu'),
                              );
                            }

                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input type="datetime-local" required />
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
                    <BaseForm.Item name="schoolId" rules={[{ required: true, message: t('Xin hãy chọn trường') }]}>
                      <Select
                        mode="multiple"
                        placeholder={'Tìm kiếm và Chọn trường'}
                        suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                        style={{ width: '300px' }}
                        filterOption={(inputValue, option) =>
                          option?.label.toLowerCase().includes(inputValue.toLowerCase()) ?? false
                        }
                        options={school.map((school) => ({
                          label: school.name,
                          value: school.id,
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
        scroll={{ x: 1500 }}
        bordered
      />
    </Form>
  );
};
