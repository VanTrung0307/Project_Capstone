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
import { Form, Input, Modal, Select, Space } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSProperties } from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 5,
};

export const TaskTable: React.FC = () => {

  const { t } = useTranslation();

  const filterDropdownStyles: CSSProperties = {
    height: '50px',
    maxWidth: '300px',
    width: '100%',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 5px 10px rgba(0, 0, 0, 0.1)',
    border: '2px solid white',
    right: '10px',
  };

  const inputStyles = {
    height: '100%',
    width: '100%',
    outline: 'none',
    fontSize: '18px',
    fontWeight: '400',
    border: 'none',
    borderRadius: '8px',
    padding: '0 155px 0 25px',
    backgroundColor: '#25284B',
    color: 'white',
  };

  const buttonStyles: CSSProperties = {
    height: '30px',
    width: '60px', // Adjust the width to accommodate the text
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    right: '20px',
    fontSize: '16px',
    fontWeight: '400',
    color: '#fff',
    border: 'none',
    padding: '4px 10px', // Adjust the padding to position the text
    borderRadius: '6px',
    backgroundColor: '#4070f4',
    cursor: 'pointer',
  };

  const [searchValue, setSearchValue] = useState('');

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

        // Kiểm tra và chuyển các trường rỗng thành giá trị null
        Object.keys(updatedItem).forEach((field) => {
          if (updatedItem[field] === "") {
            updatedItem[field] = null;
          }
        });

        console.log("Updated null Task:", updatedItem); // Kiểm tra giá trị trước khi gọi API

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
          setData((prevData) => ({ ...prevData, data: newData}));
        }
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
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
    setData((prevData) => ({ ...prevData, data: updatedData}));
  };

  const { isMounted } = useMounted();

  const fetch = useCallback(
    async (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedTasks(pagination)
        .then((res) => {
          if (isMounted.current) {
            setData({ data: res.data, pagination: res.pagination, loading: false });
          }
        })
        .catch((error) => {
          console.error('Error fetching paginated tasks:', error);
          setData((tableData) => ({ ...tableData, loading: false }));
        });
  
      // Fetch the list of locations and store it in the "locations" state
      try {
        const locationResponse = await getPaginatedRoomLocations({ current: 1, pageSize: 1000 }); // Adjust the pagination as needed
        setLocations(locationResponse.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }

      // Fetch the list of majors and store it in the "majors" state
      try {
        const majorResponse = await getPaginatedMajors({ current: 1, pageSize: 1000 }); // Adjust the pagination as needed
        setMajors(majorResponse.data);
      } catch (error) {
        console.error('Error fetching majors:', error);
      }

      // Fetch the list of npcs and store it in the "npcs" state
      try {
        const npcResponse = await getPaginatedNpcs({ current: 1, pageSize: 1000 }); // Adjust the pagination as needed
        setNpcs(npcResponse.data);
      } catch (error) {
        console.error('Error fetching npcs:', error);
      }

      // Fetch the list of items and store it in the "items" state
      try {
        const itemResponse = await getPaginatedItems({ current: 1, pageSize: 1000 }); // Adjust the pagination as needed
        setItems(itemResponse.data);
      } catch (error) {
        console.error('Error fetching items:', error);
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
        durationCheckin: values.durationCheckin,
        timeOutAmount: values.timeOutAmount,
        itemId: values.itemId,
        itemName: values.itemName,
        status: values.status,
        id: values.id,
      };

      setData((prevData) => ({ ...prevData, loading: true })); // Show loading state

      try {
        const createdTask = await createTask(newData);

        // Fetch the location data using the selected "locationName" from the form
        const selectedLocation = locations.find((location) => location.locationName === newData.locationName);

        // Fetch the major data using the selected "majorName" from the form
        const selectedMajor = majors.find((major) => major.name === newData.majorName);

        // Fetch the npc data using the selected "npcName" from the form
        const selectedNpc = majors.find((npc) => npc.name === newData.npcName);

        // Fetch the item data using the selected "itemName" from the form
        const selectedItem = majors.find((item) => item.name === newData.itemName);

        // If the selected location is found, set its ID to the newData
        if (selectedLocation) {
          newData.locationId = selectedLocation.id;
        }

        // If the selected major is found, set its ID to the newData
        if (selectedMajor) {
          newData.majorId = selectedMajor.id;
        }

        // If the selected npc is found, set its ID to the newData
        if (selectedNpc) {
          newData.npcId = selectedNpc.id;
        }

        // If the selected item is found, set its ID to the newData
        if (selectedItem) {
          newData.itemId = selectedItem.id;
        }

        // Assign the ID received from the API response to the newData
        newData.id = createdTask.id;


      setData((prevData) => ({
        ...prevData,
        data: [...prevData.data, createdTask],
        loading: false, // Hide loading state after successful update
      }));

      form.resetFields();
      setIsBasicModalOpen(false);
      console.log('Task data created successfully');

      // Fetch the updated data after successful creation
      getPaginatedTasks(data.pagination).then((res) => {
        setData({ data: res.data, pagination: res.pagination, loading: false });
      });
    } catch (error) {
      console.error('Error creating Task data:', error);
      setData((prevData) => ({ ...prevData, loading: false })); // Hide loading state on error
    }
  } catch (error) {
    console.error('Error validating form:', error);
  }
  };

  const columns: ColumnsType<Task> = [
    {
      title: t('Tên nhiệm vụ'),
      dataIndex: 'name',
      render: (text: string, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'name'; // Define dataIndex here
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
        const dataIndex: keyof Task = 'locationName'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.locationName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Địa điểm là cần thiết' }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.id, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
            >
              {locations.map((location) => (
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
      // sorter: (a: BasicTableRow, b: BasicTableRow) => a.email - b.email,
      showSorterTooltip: false,
    },
    {
      title: t('Tên NPC'),
      dataIndex: 'npcName',
      render: (text: string, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'npcName'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.npcName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên NPC là cần thiết' }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.id, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
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
      // sorter: (a: BasicTableRow, b: BasicTableRow) => a.email - b.email,
      showSorterTooltip: false,
    },
    {
      title: t('Tên Ngành'),
      dataIndex: 'majorName',
      render: (text: string, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'majorName'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.majorName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên ngành nghề là cần thiết' }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.id, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
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
      render: (text: string, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'type'; // Define dataIndex here
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
      title: t('Điểm thưởng'),
      dataIndex: 'point',
      render: (text: number, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'point'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.point}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a point' }]}
          >
            <Input
              type='number'
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
      title: t('Giới hạn Check in?'),
      dataIndex: 'durationCheckin',
      render: (text: number, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'durationCheckin'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.durationCheckin}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: false }]}
          >
            <Input
              type='time'
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.durationCheckin, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text !== null ? text : "Không có"}</span>
        );
      },
    },
    {
      title: t('Thời gian làm lại'),
      dataIndex: 'timeOutAmount',
      render: (text: number, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'timeOutAmount'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.timeOutAmount}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: false }]}
          >
            <Input
              type='number'
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.timeOutAmount, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text !== null ? text : "Không có"}</span>
        );
      },
    },
    {
      title: t('Vật phẩm'),
      dataIndex: 'itemName',
      render: (text: string, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'itemName'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.itemName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: false }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.id, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
            >
              {items.map((item) => (
                <Select.Option key={item.id} value={item.name}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <span>{text !== null ? text : "Không có"}</span>
        );
      },
    },
    {
      title: t('Trạng thái'),
      dataIndex: 'status',
      render: (text: string, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'status'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.status}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a status' }]}
          >
            <Input
              value={record[dataIndex].toString()}
              onChange={(e) => handleInputChange(e.target.value, record.status, dataIndex)}
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
      render: (text: string, record: Task) => {
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

  return (
    <Form form={form} component={false}>
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

          <BaseForm.Item name="name" label={'Tên nhiệm vụ'} rules={[{ required: true, message: t('Tên nhiệm vụ là cần thiết') }]}>
            <Input />
          </BaseForm.Item>

          <BaseForm.Item
            name="locationName"
            label={'Tên địa điểm'}
            rules={[{ required: true, message: t('Tên địa điểm là cần thiết') }]}
          >
            <Select 
              placeholder={'---- Select Location ----'}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
            >
              {locations.map((location) => (
                <Option key={location.id} value={location.locationName}>
                  {location.locationName}
                </Option>
              ))}
            </Select>
          </BaseForm.Item>

          <BaseForm.Item name="npcName" label={'Tên NPC'} rules={[{ required: true, message: t('Tên câu trả lời là cần thiết') }]}>
            <Select 
              placeholder={'---- Select NPC ----'}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
            >
                {npcs.map((npc) => (
                  <Option key={npc.id} value={npc.name}>
                    {npc.name}
                  </Option>
                ))}
            </Select>
          </BaseForm.Item>

          <BaseForm.Item name="majorName" label={'Tên ngành nghề'} rules={[{ required: true, message: t('Tên câu trả lời là cần thiết') }]}>
            <Select 
              placeholder={'---- Select Major ----'}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
            >
                {majors.map((major) => (
                  <Option key={major.id} value={major.name}>
                    {major.name}
                  </Option>
                ))}
            </Select>
          </BaseForm.Item>

          <BaseForm.Item name="type" label={'Loại nhiệm vụ'} rules={[{ required: true, message: t('Loại nhiệm vụ là cần thiết') }]}>
            <Input maxLength={100} />
          </BaseForm.Item>

          <BaseForm.Item name="point" label={'Điểm thưởng'} rules={[{ required: true, message: t('Điểm thưởng là cần thiết') }]}>
            <Input type='number' />
          </BaseForm.Item>

          <BaseForm.Item name="durationCheckin" label={'Giới hạn Check in (nếu có)'} >
            <Input type='time' />
          </BaseForm.Item>

          <BaseForm.Item name="timeOutAmount" label={'Thời gian làm lại (nếu có)'} >
            <Input type='number' />
          </BaseForm.Item>

          <BaseForm.Item name="itemName" label={'Tên vật phẩm (nếu có)'} >
            <Select 
              placeholder={'---- Select Item ----'}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
            >
                {items.map((item) => (
                  <Option key={item.id} value={item.name}>
                    {item.name}
                  </Option>
                ))}
            </Select>
          </BaseForm.Item>

          <BaseForm.Item
            name="status"
            label={'Status'}
            rules={[{ required: true, message: t('Trạng thái câu hỏi là cần thiết') }]}
          >
            <Select 
              placeholder={'---- Select Status ----'}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
            >
              <Option value="ACTIVE">{'ACTIVE'}</Option>
              <Option value="INACTIVE">{'INACTIVE'}</Option>
            </Select>
          </BaseForm.Item>

        </S.FormContent>
      </Modal>
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
