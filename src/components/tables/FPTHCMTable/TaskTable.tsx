/* eslint-disable prettier/prettier */
import { DownOutlined } from '@ant-design/icons';
import { Item, getPaginatedItems } from '@app/api/FPT_3DMAP_API/Item';
import { Major, getPaginatedMajors } from '@app/api/FPT_3DMAP_API/Major';
import { Npc, getPaginatedNpcs } from '@app/api/FPT_3DMAP_API/NPC';
import { RoomLocation, getPaginatedRoomLocations } from '@app/api/FPT_3DMAP_API/Room&Location';
import { Pagination, Task, createTask, getPaginatedTasks, updateTask } from '@app/api/FPT_3DMAP_API/Task';
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
import styled from 'styled-components';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const TaskTable: React.FC = () => {
  const { t } = useTranslation();

  const [editingKey, setEditingKey] = useState<number | string>('');
  const [data, setData] = useState<{ data: Task[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [locations, setLocations] = useState<RoomLocation[]>([]);
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const isEditing = (record: Task) => record.id === editingKey;

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
        await updateTask(key.toString(), row);
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

  const edit = (record: Partial<Task> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof Task) => {
    const updatedData = data.data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const { isMounted } = useMounted();
  const [originalData, setOriginalData] = useState<Task[]>([]);

  const fetch = useCallback(
    async (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedTasks(pagination)
        .then((res) => {
          if (isMounted.current) {
            setOriginalData(res.data);
            setData({ data: res.data, pagination: res.pagination, loading: false });
          }
        })
        .catch((error) => {
          message.error('Error fetching paginated tasks:', error);
          setData((tableData) => ({ ...tableData, loading: false }));
        });

      try {
        const locationResponse = await getPaginatedRoomLocations({ current: 1, pageSize: 10 });
        setLocations(locationResponse.data);
      } catch (error) {
        message.error('Error fetching locations');
      }

      try {
        const majorResponse = await getPaginatedMajors({ current: 1, pageSize: 10 });
        setMajors(majorResponse.data);
      } catch (error) {
        message.error('Error fetching majors');
      }

      try {
        const npcResponse = await getPaginatedNpcs({ current: 1, pageSize: 10 });
        setNpcs(npcResponse.data);
      } catch (error) {
        message.error('Error fetching npcs');
      }

      try {
        const itemResponse = await getPaginatedItems({ current: 1, pageSize: 10 });
        setItems(itemResponse.data);
      } catch (error) {
        message.error('Error fetching items');
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

      const newData: Task = {
        name: values.name,
        locationId: values.locationId,
        locationName: values.locationName,
        npcId: values.npcId,
        npcName: values.npcName,
        majorId: values.majorId,
        majorName: values.majorName,
        type: values.type,
        point: values.point,
        itemId: values?.itemId,
        itemName: values.itemName,
        status: values.status,
        id: values.id,
      };

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        const createdTask = await createTask(newData);

        const selectedLocation = locations.find((location) => location.id === newData.locationId);

        const selectedMajor = majors.find((major) => major.id === newData.majorId);

        const selectedNpc = majors.find((npc) => npc.id === newData.npcId);

        const selectedItem = majors.find((item) => item.id === newData.itemId);

        if (selectedLocation) {
          newData.locationId = selectedLocation.id;
        }

        if (selectedMajor) {
          newData.majorId = selectedMajor.id;
        }

        if (selectedNpc) {
          newData.npcId = selectedNpc.id;
        }

        if (selectedItem) {
          newData.itemId = selectedItem.id;
        }

        newData.id = createdTask.id;

        setData((prevData) => ({
          ...prevData,
          data: [...prevData.data, createdTask],
          loading: false,
        }));

        form.resetFields();
        setIsBasicModalOpen(false);
        message.success('Task data created successfully');
        fetch(data.pagination);
      } catch (error) {
        message.error('Error creating Task data');
        setData((prevData) => ({ ...prevData, loading: false }));
      }
    } catch (error) {
      message.error('Error validating form');
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

  const columns: ColumnsType<Task> = [
    {
      title: t('Tên nhiệm vụ'),
      dataIndex: 'name',
      render: (text: string, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'name';
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
      title: t('Địa điểm'),
      dataIndex: 'locationName',
      render: (text: string, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'locationId';
        return editable ? (
          <Form.Item
            key={record.locationId}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Địa điểm là cần thiết' }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.locationId, dataIndex)}
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
      title: t('Tên NPC'),
      dataIndex: 'npcName',
      render: (text: string, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'npcId';
        return editable ? (
          <Form.Item
            key={record.npcId}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên NPC là cần thiết' }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.npcId, dataIndex)}
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
      title: t('Tên Ngành'),
      dataIndex: 'majorName',
      filters: majorNameFilters,
      onFilter: (value, record) => record.majorName === value,
      render: (text: string, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'majorId';
        return editable ? (
          <Form.Item
            key={record.majorId}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên ngành nghề là cần thiết' }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.majorId, dataIndex)}
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
      title: t('Loại nhiệm vụ'),
      dataIndex: 'type',
      filters: taskTypeFilters,
      onFilter: (value, record) => record.type === value,
      render: (text: string, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'type';
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
      title: t('Vật phẩm'),
      dataIndex: 'itemName',
      render: (text: string, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'itemId';
        return editable ? (
          <Form.Item key={record.itemId} name={dataIndex} initialValue={text} rules={[{ required: false }]}>
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.itemId, dataIndex)}
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
      title: t('Trạng thái'),
      dataIndex: 'status',
      filters: [
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'INACTIVE', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (text: string, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'status';

        const statusOptions = ['ACTIVE', 'INACTIVE'];

        return editable ? (
          <Form.Item
            key={record.status}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Trạng thái là cần thiết' }]}
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
      render: (text: string, record: Task) => {
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
        Tạo mới
      </Button>
      <Modal
        title={'Thêm mới NHIỆM VỤ'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
        width={800}
        style={{ marginTop: '-50px' }}
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
          <Row gutter={16}>
            <Col span={12}>
              <FlexContainer>
                <div>
                  <Label>{'Tên nhiệm vụ'}</Label>
                  <InputContainer>
                    <BaseForm.Item name="name" rules={[{ required: true, message: t('Tên nhiệm vụ là cần thiết') }]}>
                      <Input style={{ width: '300px' }} />
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>

              <FlexContainer>
                <div>
                  <Label>{'Tên địa điểm'}</Label>
                  <InputContainer>
                    <BaseForm.Item
                      name="locationId"
                      rules={[{ required: true, message: t('Tên địa điểm là cần thiết') }]}
                    >
                      <Select
                        placeholder={'---- Chọn tọa độ ----'}
                        suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                        style={{ width: '300px' }}
                      >
                        {locations.map((location) => (
                          <Option key={location.id} value={location.id}>
                            {location.locationName}
                          </Option>
                        ))}
                      </Select>
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>
            </Col>

            <Col span={12}>
              <FlexContainer>
                <div>
                  <Label>{'Tên NPC'}</Label>
                  <InputContainer>
                    <BaseForm.Item
                      name="npcId"
                      rules={[{ required: true, message: t('Tên câu trả lời là cần thiết') }]}
                    >
                      <Select
                        placeholder={'---- Chọn NPC ----'}
                        suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                        style={{ width: '300px' }}
                      >
                        {npcs.map((npc) => (
                          <Option key={npc.id} value={npc.id}>
                            {npc.name}
                          </Option>
                        ))}
                      </Select>
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>

              <FlexContainer>
                <div>
                  <Label>{'Tên ngành học'}</Label>
                  <InputContainer>
                    <BaseForm.Item
                      name="majorId"
                      rules={[{ required: true, message: t('Tên câu trả lời là cần thiết') }]}
                    >
                      <Select
                        style={{ width: '300px' }}
                        placeholder={'---- Chọn ngành ----'}
                        suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                      >
                        {majors.map((major) => (
                          <Option key={major.id} value={major.id}>
                            {major.name}
                          </Option>
                        ))}
                      </Select>
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <FlexContainer>
                <div>
                  <Label>{'Loại nhiệm vụ'}</Label>
                  <InputContainer>
                    <BaseForm.Item name="type" rules={[{ required: true, message: t('Loại nhiệm vụ là cần thiết') }]}>
                      <Select
                        style={{ width: '300px' }}
                        placeholder={'---- Chọn loại nhiệm vụ ----'}
                        suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                      >
                        <Option value="CHECKIN">{'CHECKIN'}</Option>
                        <Option value="QUESTIONANDANSWER">{'QUESTIONANDANSWER'}</Option>
                      </Select>
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>

              <FlexContainer>
                <div>
                  <Label>{'Điểm thưởng'}</Label>
                  <InputContainer>
                    <BaseForm.Item name="point" rules={[{ required: true, message: t('Điểm thưởng là cần thiết') }]}>
                      <Input type="number" style={{ width: '300px' }} />
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>
            </Col>

            <Col span={12}>
              <FlexContainer>
                <div>
                  <Label>{'Tên vật phẩm'}</Label>
                  <InputContainer>
                    <BaseForm.Item name="itemID">
                      <Select
                        placeholder={'---- Chọn vật phẩm (Optional) ----'}
                        suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                        style={{ width: '300px' }}
                      >
                        {items.map((item) => (
                          <Option key={item.id} value={item?.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>

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
