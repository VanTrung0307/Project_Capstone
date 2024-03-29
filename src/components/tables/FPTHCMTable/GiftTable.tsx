/* eslint-disable prettier/prettier */
import { DownOutlined } from '@ant-design/icons';
import {
  Gift,
  Pagination,
  addGift,
  createGift,
  deleteGift,
  getPaginatedGifts,
  updateGift,
} from '@app/api/FPT_3DMAP_API/Gift';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { useMounted } from '@app/hooks/useMounted';
import { Col, Form, Input, Modal, Row, Select, Space, Tag, message } from 'antd';
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
import { School, getPaginatedSchools } from '@app/api/FPT_3DMAP_API/School';

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
  const [schools, setSchools] = useState<School[]>([]);

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

        // message.warn('Updated null Gift:', updatedItem);

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
        message.success('Cập nhật phần thưởng thành công');
      } catch (error) {
        message.error('Cập nhật phần thưởng thất bại');
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
          message.error('Không thấy dữ liệu', error);
          setData((tableData) => ({ ...tableData, loading: false }));
        });

      try {
        const eventResponse = await getPaginatedEvents({ current: 1, pageSize: 1000 });
        setEvents(eventResponse.data);
      } catch (error) {
        // message.error('Error fetching events');
      }
      try {
        const schoolResponse = await getPaginatedSchools({ current: 1, pageSize: 1000 });
        setSchools(schoolResponse.data);
      } catch (error) {
        // message.error('Error fetching events');
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
      const currentDate = new Date();

      const newData: addGift = {
        prizeRank: values.prizeRank,
        eventId: values.eventId,
        schoolId: values.schoolId,
        name: values.name,
        description: values.description,
        quantity: values.quantity,
        status: values.status,
        dateReceived: currentDate.toISOString(),
        // id: values.id,
      };

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        await createGift(newData);
        // const createdGift = await createGift(newData);

        const selectedEvent = events.find((event) => event.id === newData.eventId);

        if (selectedEvent) {
          newData.eventId = selectedEvent.id;
        }

        // newData.id = createdGift.id;

        form.resetFields();
        setIsBasicModalOpen(false);
        fetch(data.pagination);
        message.success('Tạo phần thưởng thành công');
      } catch (error) {
        message.error('Tạo phần thưởng thất bại');
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      message.error('Lỗi hệ thống');
    }
  };

  const uniqueEventNames = new Set(data.data.map((record) => record.eventName));
  const eventNameFilters = Array.from(uniqueEventNames).map((eventName) => ({
    text: eventName,
    value: eventName,
  }));

  const handleDelete = async (giftId: string) => {
    try {
      await deleteGift(giftId);

      setData((prevTableData) => ({
        ...prevTableData,
        data: prevTableData.data.filter((item) => item.id !== giftId),
        pagination: {
          ...prevTableData.pagination,
          total: prevTableData.pagination.total ? prevTableData.pagination.total - 1 : prevTableData.pagination.total,
        },
      }));
      message.success(`Xoá phần thưởng thành công`);
    } catch (error) {
      message.error('Xoá phần thưởng thất bại');
    }
  };

  const columns: ColumnsType<Gift> = [
    // {
    //   title: t('Số hạng'),
    //   dataIndex: 'rankNumber',
    // },
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
            rules={[{ required: true, message: 'Hãy nhập tên phần thưởng' }]}
          >
            <Input
              maxLength={100}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.name, dataIndex)}
              style={{ background: '#414345' }}
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
            rules={[{ required: true, message: 'Hãy chọn tên sự kiện' }]}
          >
            <Select
              style={{ maxWidth: '212.03px' }}
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.eventId, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#FF7C00' }} />}
              dropdownStyle={{ background: '#414345' }}
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
      title: t('Tên trường'),
      dataIndex: 'schoolName',
      // filters: eventNameFilters,
      onFilter: (value, record) => record.schoolName === value,
      render: (text: string, record: Gift) => {
        const editable = isEditing(record);
        const dataIndex: keyof Gift = 'schoolId';
        return editable ? (
          <Form.Item
            key={record.schoolId}
            name={dataIndex}
            rules={[{ required: true, message: 'Hãy chọn tên sự kiện' }]}
          >
            <Select
              style={{ maxWidth: '212.03px' }}
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.schoolId, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#FF7C00' }} />}
              dropdownStyle={{ background: '#414345' }}
            >
              {schools.map((school) => (
                <Select.Option key={school.id} value={school.id}>
                  {school.name}
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
          <Form.Item
            key={record.quantity}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập số lượng phần thưởng' }]}
          >
            <Input
              style={{ maxWidth: '150px', background: '#414345' }}
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
      dataIndex: 'description',
      render: (text: string, record: Gift) => {
        const editable = isEditing(record);
        const dataIndex: keyof Gift = 'description';
        const maxTextLength = 50;
        const truncatedText = text?.length > maxTextLength ? `${text.slice(0, maxTextLength)}...` : text;
        return editable ? (
          <Form.Item
            key={record.description}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập mô tả' }]}
          >
            <TextArea
              autoSize={{ maxRows: 6 }}
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.description, dataIndex)}
              style={{ background: '#414345' }}
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
            rules={[{ required: true, message: 'Hãy chọn trạng thái' }]}
          >
            <Select
              style={{ maxWidth: '212.03px' }}
              value={text}
              onChange={(value) => handleInputChange(value, record.status, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#FF7C00' }} />}
              dropdownStyle={{ background: '#414345' }}
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
                  danger
                  onClick={() => handleDelete(record.id)}
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
    align-items: center;
    margin-bottom: 16px;
  `;

  const Label = styled.label`
    flex: 0 0 200px;
  `;

  const InputContainer = styled.div`
    flex: 1;
  `;

  const rankNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Use useEffect to update the currentDateTime state with the current date and time
  // useEffect(() => {
  //   setCurrentDateTime(new Date());
  // }, []);

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
        title={'Thêm mới PHẦN QUÀ'}
        open={isBasicModalOpen}
        className="custom-modal"
        onOk={handleModalOk}
        width={800}
        onCancel={() => setIsBasicModalOpen(false)}
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
          <Row gutter={16}>
            <Col span={12}>
              <FlexContainer>
                <Label>{'Tên phần quà'}</Label>
                <InputContainer>
                  <BaseForm.Item
                    name="name"
                    rules={[
                      { required: true, message: t('Hãy nhập tên phần quà') },
                      {
                        pattern: /^[^\d\W].*$/,
                        message: 'Không được bắt đầu bằng số hoặc ký tự đặc biệt',
                      },
                    ]}
                  >
                    <Input maxLength={100} style={{ width: '256px', background: '#414345' }} />
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>
            </Col>
            <Col span={12}>
              <FlexContainer>
                <Label>{'Mô tả'}</Label>
                <InputContainer>
                  <BaseForm.Item
                    name="description"
                    rules={[
                      { required: true, message: t('Hãy nhập mô tả') },
                      {
                        pattern: /^[^\d\W].*$/,
                        message: 'Không được bắt đầu bằng số hoặc ký tự đặc biệt',
                      },
                    ]}
                  >
                    <TextArea style={{ width: '256px', background: '#414345' }} />
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <FlexContainer>
                <Label>{'Số lượng'}</Label>
                <InputContainer>
                  <BaseForm.Item name="quantity" rules={[{ required: true, message: t('Hãy nhập số lượng') }]}>
                    <Input type="number" min={1} style={{ width: '256px', background: '#414345' }} />
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>
            </Col>
            <Col span={12}>
              <FlexContainer>
                <Label>{'Xếp hạng'}</Label>
                <InputContainer>
                  <BaseForm.Item name="prizeRank" rules={[{ required: true, message: t('Hãy nhập số lượng') }]}>
                    <Select
                      placeholder={'Chọn số xếp hạng'}
                      suffixIcon={<DownOutlined style={{ color: '#FF7C00' }} />}
                      dropdownStyle={{ background: '#414345' }}
                      style={{ width: '256px' }}
                    >
                      {rankNumbers.map((number) => (
                        <Select.Option key={number} value={number}>
                          {number}
                        </Select.Option>
                      ))}
                    </Select>
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <FlexContainer>
                <Label>{'Tên sự kiện'}</Label>
                <InputContainer>
                  <BaseForm.Item name="eventId" rules={[{ required: true, message: t('Hãy chọn tên sự kiện') }]}>
                    <Select
                      style={{ maxWidth: '256px' }}
                      placeholder={'---- Chọn sự kiện ----'}
                      suffixIcon={<DownOutlined style={{ color: '#FF7C00' }} />}
                      dropdownStyle={{ background: '#414345' }}
                    >
                      {events
                        .filter((event) => event.status === 'ACTIVE')
                        .map((event) => (
                          <Option key={event.id} value={event.id}>
                            {event.name}
                          </Option>
                        ))}
                    </Select>
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>
            </Col>
            <Col span={12}>
              <FlexContainer>
                <Label>{'Tên trường'}</Label>
                <InputContainer>
                  <BaseForm.Item name="schoolId" rules={[{ required: true, message: t('Hãy chọn tên trường') }]}>
                    <Select
                      style={{ maxWidth: '256px' }}
                      placeholder={'---- Chọn trường ----'}
                      suffixIcon={<DownOutlined style={{ color: '#FF7C00' }} />}
                      dropdownStyle={{ background: '#414345' }}
                    >
                      {schools
                        .filter((school) => school.status === 'ACTIVE')
                        .map((school) => (
                          <Option key={school.id} value={school.id}>
                            {school.name}
                          </Option>
                        ))}
                    </Select>
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>
            </Col>
          </Row>
          <Row gutter={16}>
            {/* <Col span={12}>
              <FlexContainer>
                <Label>{'Ngày tạo'}</Label>
                <InputContainer>
                  <BaseForm.Item name="dateReceived" initialValue={currentDateTime.toISOString()}>
                    <Input disabled={true} style={{ width: '256px' }} />
                  </BaseForm.Item>
                </InputContainer>
              </FlexContainer>
            </Col> */}
            <Col span={12}>
              <FlexContainer>
                <Label>{'Trạng thái'}</Label>
                <InputContainer>
                  <BaseForm.Item name="status" initialValue={'ACTIVE'}>
                    <Input disabled={true} style={{ width: '80px', background: '#1D1C1A' }} />
                  </BaseForm.Item>
                </InputContainer>
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
        scroll={{ x: 1200 }}
        bordered
      />
    </Form>
  );
};
