/* eslint-disable prettier/prettier */
import { DownOutlined } from '@ant-design/icons';
import { Answer, getPaginatedAnswers } from '@app/api/FPT_3DMAP_API/Answer';
import { Major, getPaginatedMajors } from '@app/api/FPT_3DMAP_API/Major';
import { Pagination, Question, createQuestion, getPaginatedQuestions, updateQuestion } from '@app/api/FPT_3DMAP_API/QuestionBank';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { Form, Input, Modal, Select, Space, Tag } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'components/common/Table/Table';
import { Button } from 'components/common/buttons/Button/Button';
import * as S from 'components/forms/StepForm/StepForm.styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSProperties } from 'styled-components';
import { EditableCell } from '../editableTable/EditableCell';
import { useMounted } from '@app/hooks/useMounted';

const initialPagination: Pagination = {
  current: 1,
  pageSize: 10,
};

export const QuestionBankTable: React.FC = () => {

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
  const [data, setData] = useState<{ data: Question[]; pagination: Pagination; loading: boolean }>({
    data: [],
    pagination: initialPagination,
    loading: false,
  });
  const [majors, setMajors] = useState<Major[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const isEditing = (record: Question) => record.id === editingKey;

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

        console.log("Updated null Question:", updatedItem); // Kiểm tra giá trị trước khi gọi API

        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({ ...data, data: newData, loading: false });
        await updateQuestion(key.toString(), row);
        console.log('Question data updated successfully');
      } catch (error) {
        console.error('Error updating Question data:', error);
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

  const edit = (record: Partial<Question> & { key: React.Key }) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  const handleInputChange = (value: string, key: number | string, dataIndex: keyof Question) => {
    const updatedData = data.data.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: value };
      }
      return record;
    });
    setData((prevData) => ({ ...prevData, data: updatedData}));
  };

  const { isMounted } = useMounted();

  // const fetch = useCallback(
  //   (pagination: Pagination) => {
  //     setData((tableData) => ({ ...tableData, loading: true }));
  //     getPaginatedQuestions(pagination).then((res) => {
  //       if (isMounted.current) {
  //         setData({ data: res.data, pagination: res.pagination, loading: false });
  //       }
  //     });
  //   },
  //   [isMounted],
  // );
  const fetch = useCallback(
    async (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedQuestions(pagination)
        .then((res) => {
          if (isMounted.current) {
            setData({ data: res.data, pagination: res.pagination, loading: false });
          }
        })
        .catch((error) => {
          console.error('Error fetching paginated questions:', error);
          setData((tableData) => ({ ...tableData, loading: false }));
        });
  
      // Fetch the list of majors and store it in the "majors" state
      try {
        const majorResponse = await getPaginatedMajors({ current: 1, pageSize: 1000 }); // Adjust the pagination as needed
        setMajors(majorResponse.data);
      } catch (error) {
        console.error('Error fetching majors:', error);
      }

      // Fetch the list of answers and store it in the "answers" state
      try {
        const answerResponse = await getPaginatedAnswers({ current: 1, pageSize: 1000 }); // Adjust the pagination as needed
        setAnswers(answerResponse.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
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

      const newData: Question = {
        majorId: values.majorId,
        majorName: values.majorName,
        name: values.name,
        status: values.status,
        answerId: values.answerId,
        answerName: values.answerName,
        id: values.id,
      };

      setData((prevData) => ({ ...prevData, loading: true })); // Show loading state

      try {
        const createdQuestion = await createQuestion(newData);

        // Fetch the major data using the selected "majorName" from the form
        const selectedMajor = majors.find((major) => major.name === newData.majorName);

        // Fetch the answer data using the selected "answerName" from the form
        const selectedAnswer = answers.find((answer) => answer.answerName === newData.answerName);

        // If the selected major is found, set its ID to the newData
        if (selectedMajor) {
          newData.majorId = selectedMajor.id;
        }

        // If the selected answer is found, set its ID to the newData
        if (selectedAnswer) {
          newData.answerId = selectedAnswer.id;
        }

        // Assign the ID received from the API response to the newData
        newData.id = createdQuestion.id;


      setData((prevData) => ({
        ...prevData,
        data: [...prevData.data, createdQuestion],
        loading: false, // Hide loading state after successful update
      }));

      form.resetFields();
      setIsBasicModalOpen(false);
      console.log('Question data created successfully');

      // Fetch the updated data after successful creation
      getPaginatedQuestions(data.pagination).then((res) => {
        setData({ data: res.data, pagination: res.pagination, loading: false });
      });
    } catch (error) {
      console.error('Error creating Question data:', error);
      setData((prevData) => ({ ...prevData, loading: false })); // Hide loading state on error
    }
  } catch (error) {
    console.error('Error validating form:', error);
  }
  };

  const columns: ColumnsType<Question> = [
    {
      title: t('Tên câu hỏi'),
      dataIndex: 'name',
      render: (text: string, record: Question) => {
        const editable = isEditing(record);
        const dataIndex: keyof Question = 'name'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên câu hỏi là cần thiết' }]}
          >
            <Input
              maxLength={100}
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
      title: t('Tên ngành'),
      dataIndex: 'majorName',
      render: (text: string, record: Question) => {
        const editable = isEditing(record);
        const dataIndex: keyof Question = 'majorName'; // Define dataIndex here
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
      title: t('Câu trả lời đúng'),
      dataIndex: 'answerName',
      render: (text: number, record: Question) => {
        const editable = isEditing(record);
        const dataIndex: keyof Question = 'answerName'; // Define dataIndex here
        return editable ? (
          <Form.Item
            key={record.answerName}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Please enter a answerName' }]}
          >
            <Select
              value={record[dataIndex]}
              onChange={(value) => handleInputChange(value, record.id, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
            >
              {answers.map((answer) => (
                <Select.Option key={answer.id} value={answer.answerName}>
                  {answer.answerName}
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
      title: t('Trạng thái'),
      dataIndex: 'status',
      width: '8%',
      render: (text: string, record: Question) => {
        const editable = isEditing(record);
        const dataIndex: keyof Question = 'status';

        const statusOptions = ['ACTIVE', 'INACTIVE'];

        return editable ? (
          <Form.Item
            key={record.status}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Trạng thái câu hỏi là cần thiết' }]}
          >
            <Select
              value={text}
              onChange={(value) => handleInputChange(value, record.status, dataIndex)}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
            >
              {statusOptions.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <span>{text !== "INACTIVE" ? <Tag color="#339CFD">ACTIVE</Tag> : <Tag color="#FF5252">INACTIVE</Tag>}</span>
        );
      },
    },
    {
      title: t('Chức năng'),
      dataIndex: 'actions',
      width: '8%',
      render: (text: string, record: Question) => {
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
        title={'Thêm mới CÂU HỎI'}
        open={isBasicModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsBasicModalOpen(false)}
      >
        <S.FormContent>
          
          <BaseForm.Item name="name" label={'Tên câu hỏi'} rules={[{ required: true, message: t('Tên câu hỏi là cần thiết') }]}>
            <Input maxLength={100} />
          </BaseForm.Item>

          <BaseForm.Item
            name="majorName"
            label={'Tên ngành'}
            rules={[{ required: true, message: t('Tên ngành nghề là cần thiết') }]}
          >
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

          <BaseForm.Item name="answerName" label={'Câu trả lời'} rules={[{ required: true, message: t('Tên câu trả lời là cần thiết') }]}>
            <Select 
              placeholder={'---- Select Answer ----'}
              suffixIcon={<DownOutlined style={{ color: '#339CFD'}}/>} 
            >
                {answers.map((answer) => (
                  <Option key={answer.id} value={answer.answerName}>
                    {answer.answerName}
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
              <Option value="ACTIVE">{'Đang hoạt động'}</Option>
              <Option value="INACTIVE">{'Không hoạt động'}</Option>
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
