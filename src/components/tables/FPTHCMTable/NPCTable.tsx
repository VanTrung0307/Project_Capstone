/* eslint-disable prettier/prettier */
import { DownOutlined } from '@ant-design/icons';
import { Npc, Pagination, getPaginatedNpcs, updateNpc } from '@app/api/FPT_3DMAP_API/NPC';
import { SearchInput } from '@app/components/common/inputs/SearchInput/SearchInput';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Modal, Select, Space, Tag, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditableCell } from '../editableTable/EditableCell';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const NPCTable: React.FC = () => {
  const { t } = useTranslation();
  const { TextArea } = Input;

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

        Object.keys(updatedItem).forEach((field) => {
          if (updatedItem[field] === '') {
            updatedItem[field] = null;
          }
        });

        message.warn('Updated null NPC:', updatedItem);

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
        message.success('Cập nhật thành công');
        fetch(data.pagination);
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
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const { isMounted } = useMounted();
  const [originalData, setOriginalData] = useState<Npc[]>([]);

  const fetch = useCallback(
    (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedNpcs(pagination).then((res) => {
        if (isMounted.current) {
          setOriginalData(res.data);
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

  // const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);

  // const handleModalOk = async () => {
  //   try {
  //     const values = await form.validateFields();

  //     const newData: Npc = {
  //       name: values.name,
  //       introduce: values.introduce,
  //       status: values.status,
  //       id: values.id,
  //     };

  //     setData((prevData) => ({ ...prevData, loading: true }));

  //     try {
  //       const createdNpc = await createNpc(newData);
  //       setData((prevData) => ({
  //         ...prevData,
  //         data: [...prevData.data, createdNpc],
  //         loading: false,
  //       }));
  //       form.resetFields();
  //       setIsBasicModalOpen(false);
  //       message.success('Npc data created successfully');
  //       fetch(data.pagination);
  //     } catch (error) {
  //       message.error('Error creating Npc data');
  //       setData((prevData) => ({ ...prevData, loading: false }));
  //     }
  //   } catch (error) {
  //     message.error('Error validating form');
  //   }
  // };

  const [dialogueModalVisible, setDialogueModalVisible] = useState(false);
  const [selectedDialogue, setSelectedDialogue] = useState('');

  const columns: ColumnsType<Npc> = [
    {
      title: t('Tên NPC'),
      dataIndex: 'name',
      render: (text: string, record: Npc) => {
        const editable = isEditing(record);
        const dataIndex: keyof Npc = 'name';
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên NPC là cần thiết' }]}
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
      title: t('Lời đối thoại (Nhấn vào để xem cho tiết)'),
      dataIndex: 'introduce',
      render: (text: string, record: Npc) => {
        const editable = isEditing(record);
        const dataIndex: keyof Npc = 'introduce';
        const maxTextLength = 50;
        const truncatedText = text?.length > maxTextLength ? `${text.slice(0, maxTextLength)}...` : text;

        const openDescriptionModal = () => {
          if (!editable && text?.length > maxTextLength) {
            setDialogueModalVisible(true);
            if (!editable) {
              setSelectedDialogue(text);
            }
          }
        };

        return (
          <>
            <div
              onClick={() => {
                if (text?.length > maxTextLength) {
                  openDescriptionModal();
                }
              }}
              style={{
                cursor: !editable && text?.length > maxTextLength ? 'pointer' : 'default',
              }}
            >
              {editable ? (
                <Form.Item key={record.introduce} name={dataIndex} initialValue={text} rules={[{ required: false }]}>
                  <TextArea
                    autoSize={{ maxRows: 6 }}
                    value={record[dataIndex]}
                    onChange={(e) => handleInputChange(e.target.value, record.introduce, dataIndex)}
                    style={{ background: '#414345' }}
                  />
                </Form.Item>
              ) : (
                <>
                  <span>{truncatedText !== null ? truncatedText : 'Chưa có thông tin'}</span>
                </>
              )}
            </div>
            <Modal
              title={t('Mô tả')}
              visible={dialogueModalVisible}
              className="custom-modal"
              onCancel={() => setDialogueModalVisible(false)}
              footer={null}
              mask={true}
              maskStyle={{ opacity: 0.5 }}
            >
              <p>{selectedDialogue}</p>
            </Modal>
          </>
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
      render: (text: string, record: Npc) => {
        const editable = isEditing(record);
        const dataIndex: keyof Npc = 'status';

        const statusOptions = ['ACTIVE', 'INACTIVE'];

        return editable ? (
          <Form.Item
            key={record.status}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Trạng thái NPC là cần thiết' }]}
          >
            <Select
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
      render: (text: string, record: Npc) => {
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

  return (
    <Form form={form} component={false}>
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
