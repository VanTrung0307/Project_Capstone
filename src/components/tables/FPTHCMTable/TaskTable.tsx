/* eslint-disable prettier/prettier */
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { Item, getPaginatedItems } from '@app/api/FPT_3DMAP_API/Item';
import { Major, getPaginatedMajors } from '@app/api/FPT_3DMAP_API/Major';
import { Npc, getPaginatedNpcs } from '@app/api/FPT_3DMAP_API/NPC';
import { RoomLocation, getPaginatedRoomLocationsWithNPC } from '@app/api/FPT_3DMAP_API/Room&Location';
import {
  Pagination,
  Task,
  createTask,
  getPaginatedTasks,
  updateTask,
  updateTaskData,
} from '@app/api/FPT_3DMAP_API/Task';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { Option } from '@app/components/common/selects/Select/Select';
import { useMounted } from '@app/hooks/useMounted';
import { Col, Form, Input, Modal, Row, Select, Space, Tag, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';

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
        await updateTask(key.toString(), row);
        message.success('Cập nhật nhiệm vụ thành công');
      } catch (error) {
        fetch(data.pagination);
        message.error('Cập nhật nhiệm vụ thất bại');
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

  const edit = (record: Partial<Task> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof updateTaskData) => {
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
          message.error('Lỗi hệ thống', error);
          setData((tableData) => ({ ...tableData, loading: false }));
        });

      try {
        const locationResponse = await getPaginatedRoomLocationsWithNPC({ current: 1, pageSize: 1000 });
        setLocations(locationResponse.data);
      } catch (error) {
        // message.error('Error fetching locations');
      }

      try {
        const majorResponse = await getPaginatedMajors({ current: 1, pageSize: 100 });
        setMajors(majorResponse.data);
      } catch (error) {
        // message.error('Error fetching majors');
      }

      try {
        const npcResponse = await getPaginatedNpcs({ current: 1, pageSize: 1000 });
        setNpcs(npcResponse.data);
      } catch (error) {
        // message.error('Error fetching npcs');
      }

      try {
        const itemResponse = await getPaginatedItems({ current: 1, pageSize: 100 });
        setItems(itemResponse.data);
      } catch (error) {
        // message.error('Error fetching items');
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
        message.success('Tạo nhiệm vụ thành công');
        fetch(data.pagination);
      } catch (error) {
        setData((prevData) => ({ ...prevData, loading: false }));
        message.error('Tạo nhiệm vụ thất bại');
      }
    } catch (error) {
      message.error('Lỗi hệ thống');
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
            rules={[
              { required: true, message: 'Hãy nhập tên nhiệm vụ' },
              {
                pattern: /^[^\d\W].*$/,
                message: 'Không được bắt đầu bằng số hoặc ký tự đặc biệt',
              },
            ]}
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
        const dataIndex: keyof updateTaskData = 'locationName';
        return editable ? (
          <Form.Item
            key={record.locationName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập tên địa điểm' }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.locationName, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
            >
              {locations
                // .filter((locationItem) => locationItem.status !== 'INACTIVE')
                .map((location) => (
                  <Select.Option key={location.id} value={location.locationName}>
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
        const dataIndex: keyof updateTaskData = 'npcName';
        return editable ? (
          <Form.Item
            key={record.npcName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập tên NPC' }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.npcName, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
            >
              {npcs.map((npc) => (
                <Select.Option key={npc.id} value={npc.name}>
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
        const dataIndex: keyof updateTaskData = 'majorName';
        return editable ? (
          <Form.Item
            key={record.majorName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Hãy nhập tên ngành học' }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.majorName, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
            >
              {majors.map((major) => (
                <Select.Option key={major.id} value={major.name}>
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
            rules={[{ required: true, message: 'Hãy nhập chọn loại nhiệm vụ' }]}
          >
            <Select
              style={{ minWidth: '200px' }}
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.type, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
            >
              {Object.values(TaskType).map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
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
        const dataIndex: keyof updateTaskData = 'itemName';

        const isExchangeItem = record.type === TaskType.EXCHANGEITEM;

        const requiredRule = isExchangeItem ? { required: true, message: 'Hãy chọn vật phẩm' } : { required: false };

        return editable && isExchangeItem ? (
          <Form.Item key={record.itemName} name={dataIndex} initialValue={text} rules={[requiredRule]}>
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.itemName, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
              style={{ minWidth: '100px' }}
            >
              {items.map((item) => (
                <Select.Option key={item.id} value={item.name}>
                  {item.name === null ? 'Không có' : item.name}
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
            rules={[{ required: true, message: 'Hãy chọn trạng thái' }]}
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
    ::before {
      content: '* ';
      color: red;
    }
  `;

  const InputContainer = styled.div`
    flex: 1;
  `;

  enum TaskType {
    CHECKIN = 'CHECKIN',
    QUESTIONANDANSWER = 'QUESTIONANDANSWER',
    EXCHANGEITEM = 'EXCHANGEITEM',
    MINIGAME = 'MINIGAME',
  }

  const [selectedTaskType, setSelectedTaskType] = useState<string | null>(null);
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  const handleTaskTypeChange = (value: string) => {
    setSelectedTaskType(value);
    setShowItemDropdown(false);
  };

  const handleShowItemDropdown = () => {
    setShowItemDropdown(true);
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
                    <BaseForm.Item
                      name="name"
                      rules={[
                        { required: true, message: t('Hãy nhập tên nhiệm vụ') },
                        {
                          pattern: /^[^\d\W].*$/,
                          message: 'Không được bắt đầu bằng số hoặc ký tự đặc biệt',
                        },
                      ]}
                    >
                      <Input style={{ width: '300px' }} placeholder="Nhập tên nhiệm vụ" />
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>

              <FlexContainer>
                <div>
                  <Label>{'Tên địa điểm'}</Label>
                  <InputContainer>
                    <BaseForm.Item name="locationId" rules={[{ required: true, message: t('Hãy chọn địa điểm') }]}>
                      <Select
                        placeholder={'---- Chọn tọa độ ----'}
                        suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                        style={{ width: '300px' }}
                      >
                        {locations
                          // .filter((location) => location.status === 'ACTIVE')
                          .map((location) => (
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
                  <Label>{'Loại nhiệm vụ'}</Label>
                  <InputContainer>
                    <BaseForm.Item name="type" rules={[{ required: true, message: t('Hãy chọn loại nhiệm vụ') }]}>
                      <Select
                        style={{ width: '300px' }}
                        placeholder={'---- Chọn loại nhiệm vụ ----'}
                        suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                        onChange={handleTaskTypeChange}
                      >
                        {Object.values(TaskType).map((type) => (
                          <Option key={type} value={type}>
                            {type}
                          </Option>
                        ))}
                      </Select>
                    </BaseForm.Item>
                  </InputContainer>
                </div>
              </FlexContainer>

              {selectedTaskType === TaskType.EXCHANGEITEM && (
                <Button type="default" onClick={handleShowItemDropdown}>
                  <PlusOutlined /> Vật phẩm
                </Button>
              )}

              {showItemDropdown && (
                <FlexContainer>
                  <div>
                    <InputContainer>
                      <BaseForm.Item name="itemId">
                        <Select
                          placeholder={'---- Chọn vật phẩm ----'}
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
              )}
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <FlexContainer>
                <div>
                  <Label>{'Tên NPC'}</Label>
                  <InputContainer>
                    <BaseForm.Item name="npcId" rules={[{ required: true, message: t('Hãy chọn NPC') }]}>
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
                    <BaseForm.Item name="majorId" rules={[{ required: true, message: t('Hãy chọn ngành học') }]}>
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

            <Col span={12}>
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
