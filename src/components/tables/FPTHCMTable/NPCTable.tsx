/* eslint-disable prettier/prettier */
import { SearchOutlined } from '@ant-design/icons';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { Status } from '@app/components/profile/profileCard/profileFormNav/nav/payments/paymentHistory/Status/Status';
import { defineColorByPriority } from '@app/utils/utils';
import { Col, Form, Input, Modal, Row, Select, Space, Tag } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Npc, getPaginatedNpcs, updateNpc, Pagination, createNpc } from '@app/api/FPT_3DMAP_API/NPC';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSProperties } from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';
import { useMounted } from '@app/hooks/useMounted';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 1,
};

export const NPCTable: React.FC = () => {

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
  const [data, setData] = useState<{ data: Npc[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });

  const isEditing = (record: Npc) => record.id === editingKey;

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

        console.log("Updated null NPC:", updatedItem); // Kiểm tra giá trị trước khi gọi API

        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({ ...data, data: newData, loading: false });
        await updateNpc(key.toString(), row);
        console.log('Npc data updated successfully');
      } catch (error) {
        console.error('Error updating Npc data:', error);
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

  const edit = (record: Partial<Npc> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof Npc) => {
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
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedNpcs(pagination).then((res) => {
        if (isMounted.current) {
          setData({ data: res.data, pagination: res.pagination, loading: false });
        }
      });
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

  // const handleModalOk = () => {
  //   form.validateFields().then((values) => {
  //     // Create a new data object from the form values
  //     const newData = {
  //       name: values.name,
  //       introduce: values.introduce,
  //       status: values.status,
  //       id: values.id,
  //     };

  //     // Update the tableData state with the new data
  //     setData((prevData) => ({
  //       ...prevData,
  //       data: [...prevData.data, newData],
  //     }));

  //     form.resetFields(); // Reset the form fields
  //     setIsBasicModalOpen(false); // Close the modal
  //   });
  // };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
    
      // Create a new data object from the form values
      const newData: Npc = {
        name: values.name,
        introduce: values.introduce,
        status: values.status,
        id: '', // You can assign an empty string here as the 'id' will be generated by the server
      };
    
      // Call the createNpc API to add the new NPC data
      const createdNpc = await createNpc(newData);
    
      // Update the tableData state with the new data
      setData((prevData) => ({
        ...prevData,
        data: [...prevData.data, createdNpc],
      }));
    
      form.resetFields(); // Reset the form fields
      setIsBasicModalOpen(false); // Close the modal
      console.log('Npc data created successfully');
    } catch (error) {
      console.error('Error creating Npc data:', error);
    }
  };

  const columns: ColumnsType<Npc> = [
    {
      title: t('Tên NPC'),
      dataIndex: 'name',
      render: (text: string, record: Npc) => {
        const editable = isEditing(record);
        const dataIndex: keyof Npc = 'name'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a name' }]}
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
      onFilter: (value: string | number | boolean, record: Npc) =>
        record.name.toLowerCase().includes(value.toString().toLowerCase()),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => {
        const handleSearch = () => {
          confirm();
          setSearchValue(selectedKeys[0].toString());
        };

        return (
          <div style={filterDropdownStyles} className="input-box">
            <Input
              type="text"
              placeholder="Search here..."
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value.toString()] : [])}
              style={inputStyles}
            />
            <Button onClick={handleSearch} className="button" style={buttonStyles}>
              Filter
            </Button>
          </div>
        );
      },
      filterIcon: () => <SearchOutlined />,
      filtered: searchValue !== '', // Apply filtering if searchValue is not empty
    },
    {
      title: t('Lời đối thoại'),
      dataIndex: 'introduce',
      render: (text: string, record: Npc) => {
        const editable = isEditing(record);
        const dataIndex: keyof Npc = 'introduce'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.introduce}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a introduce' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.introduce, dataIndex)}
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
      width: '8%',
      render: (text: string, record: Npc) => {
        const editable = isEditing(record);
        const dataIndex: keyof Npc = 'status'; // Define dataIndex here
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
          <span>{text !== "INACTIVE" ? <Tag color="#2db7f5">ACTIVE</Tag> : <Tag color="#f50">INACTIVE</Tag>}</span>
        );
      },
    },
    {
      title: t('Chức năng'),
      dataIndex: 'actions',
      width: '8%',
      render: (text: string, record: Npc) => {
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
        Add Data
      </Button>
      <Modal
        title={'Add Player'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
      >
        <S.FormContent>
          <BaseForm.Item name="name" label={'Tên NPC:'} rules={[{ required: true, message: t('Hãy điền tên NPC') }]}>
            <Input />
          </BaseForm.Item>
          <BaseForm.Item
            name="introduce"
            label={'Lời đối thoại'}
            rules={[{ required: true, message: t('Hãy điền Lời đối thoại của NPC') }]}
          >
            <Input />
          </BaseForm.Item>
          <BaseForm.Item
            name="status"
            label={'Trạng thái'}
            rules={[{ required: true, message: t('Hãy điền Lời đối thoại của NPC') }]}
          >
            <Input />
          </BaseForm.Item>
          {/* <BaseForm.Item
            name="status"
            label={'Trạng thái'}
            rules={[{ required: true, message: t('Trạng thái NPC là cần thiết') }]}
          >
            <Select placeholder={'Trạng thái'}>
              <Option value="ACTIVE">{'ACTIVE'}</Option>
              <Option value="INACTIVE">{'INACTIVE'}</Option>
            </Select>
          </BaseForm.Item> */}
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
