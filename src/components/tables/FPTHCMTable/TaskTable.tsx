/* eslint-disable prettier/prettier */
import { SearchOutlined } from '@ant-design/icons';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { Status } from '@app/components/profile/profileCard/profileFormNav/nav/payments/paymentHistory/Status/Status';
import { defineColorByPriority } from '@app/utils/utils';
import { Col, Form, Input, Modal, Row, Select, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Task, getTasks, updateTask, Pagination } from '@app/api/FPT_3DMAP_API/Task';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import { DefaultRecordType, Key } from 'rc-table/lib/interface';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSProperties } from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 5,
};

export const TaskTable: React.FC = () => {
  const [tableData, setTableData] = useState<{ data: Task[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const { t } = useTranslation();

  // const handleDeleteRow = (rowId: number) => {
  //   setTableData({
  //     ...tableData,
  //     data: tableData.data.filter((item) => item.key !== rowId),
  //     pagination: {
  //       ...tableData.pagination,
  //       total: tableData.pagination.total ? tableData.pagination.total - 1 : tableData.pagination.total,
  //     },
  //   });
  // };

  const rowSelection = {
    onChange: (selectedRowKeys: Key[], selectedRows: DefaultRecordType[]) => {
      console.log(selectedRowKeys, selectedRows);
    },
    onSelect: (record: DefaultRecordType, selected: boolean, selectedRows: DefaultRecordType[]) => {
      console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected: boolean, selectedRows: DefaultRecordType[]) => {
      console.log(selected, selectedRows);
    },
  };

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
  const [data, setData] = useState<Task[]>([]);
  const isEditing = (record: Task) => record.id === editingKey;

  const [form] = Form.useForm();

  const save = async (key: React.Key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
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

      setData(newData);
      setEditingKey(0);

      try {
        await updateTask(key.toString(), row);
        console.log('Task data updated successfully');
      } catch (error) {
        console.error('Error updating Task data:', error);
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData(newData);
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
    const updatedData = data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData(updatedData);
  };

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const tasks = await getTasks();
        setData(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTaskData();
  }, []);

  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      // Create a new data object from the form values
      const newData = {
        activityName: values.activityName,
        locationName: values.locationName,
        npcName: values.npcName,
        majorName: values.majorName,
        type: values.type,
        point: 0,
        endTime: 0,
        timeOutAmount: 0,
        isRequireitem: values.isrequireitem,
        status: values.status,
        id: values.id,
      };

      // Update the tableData state with the new data
      setTableData((prevData) => ({
        ...prevData,
        data: [...prevData.data, newData],
      }));

      form.resetFields(); // Reset the form fields
      setIsBasicModalOpen(false); // Close the modal
    });
  };

  const columns: ColumnsType<Task> = [
    {
      title: t('Tên nhiệm vụ'),
      dataIndex: 'activityName',
      render: (text: string, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'activityName'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.activityName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a activityName' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.activityName, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text}</span>
        );
      },
      onFilter: (value: string | number | boolean, record: Task) =>
        record.activityName.toLowerCase().includes(value.toString().toLowerCase()),
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
            rules={[{ required: true, message: 'Please enter a locationName' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.locationName, dataIndex)}
            />
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
            rules={[{ required: true, message: 'Please enter a npcName' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.npcName, dataIndex)}
            />
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
            rules={[{ required: true, message: 'Please enter a majorName' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.majorName, dataIndex)}
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
      width: '8%',
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
      width: '8%',
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
      dataIndex: 'endTime',
      width: '8%',
      render: (text: number, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'endTime'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.endTime}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a endTime' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.endTime, dataIndex)}
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
      width: '8%',
      render: (text: number, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'timeOutAmount'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.timeOutAmount}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a timeOutAmount' }]}
          >
            <Input
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
      title: t('Có yêu cầu vật phẩm?'),
      dataIndex: 'isRequireitem',
      width: '8%',
      render: (text: string, record: Task) => {
        const editable = isEditing(record);
        const dataIndex: keyof Task = 'isRequireitem'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.isRequireitem}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a isRequireitem' }]}
          >
            <Input
              value={record[dataIndex]}
              onChange={(e) => handleInputChange(e.target.value, record.isRequireitem, dataIndex)}
            />
          </Form.Item>
        ) : (
          <span>{text !== null ? text : "Không có"}</span>
        );
      },
    },
    {
      title: t('Trạng thái'),
      dataIndex: 'status',
      width: '8%',
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
      width: '8%',
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
        Add Data
      </Button>
      <Modal
        title={'Add Player'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
      >
        <S.FormContent>
          <BaseForm.Item name="name" label={'Name'} rules={[{ required: true, message: t('Hãy điền tên người chơi') }]}>
            <Input />
          </BaseForm.Item>
          <BaseForm.Item
            name="email"
            label={'Email'}
            rules={[{ required: true, message: t('Hãy điền email người chơi') }]}
          >
            <Input />
          </BaseForm.Item>
          <BaseForm.Item name="phone" label={'Phone'} rules={[{ required: true, message: t('Nhập số điện thoại') }]}>
            <Input />
          </BaseForm.Item>
          <BaseForm.Item name="gender" label={'Gender'} rules={[{ required: true, message: t('Nhập giới tính') }]}>
            <Input />
          </BaseForm.Item>
          <BaseForm.Item
            name="country"
            label={'Status'}
            rules={[{ required: true, message: t('Trạng thái người chơi là cần thiết') }]}
          >
            <Select placeholder={'Status'}>
              <Option value="active">{'Đang hoạt động'}</Option>
              <Option value="inactive">{'Không hoạt động'}</Option>
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
        dataSource={data}
        pagination={tableData.pagination}
        rowSelection={{ ...rowSelection }}
        loading={tableData.loading}
        scroll={{ x: 800 }}
        bordered
      />
    </Form>
  );
};
