/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Upload } from '@app/components/common/Upload/Upload';
import { DownOutlined, UploadOutlined } from '@ant-design/icons';
import { Answer, getPaginatedAnswers } from '@app/api/FPT_3DMAP_API/Answer';
import { Major, getPaginatedMajors } from '@app/api/FPT_3DMAP_API/Major';
import {
  Pagination,
  Question,
  createQuestion,
  getPaginatedQuestions,
  updateQuestion,
} from '@app/api/FPT_3DMAP_API/QuestionBank';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import { Option } from '@app/components/common/selects/Select/Select';
import { useMounted } from '@app/hooks/useMounted';
import { Form, Input, Modal, Select, Space, Tag, message } from 'antd';
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

export const QuestionBankTable: React.FC = () => {
  const { t } = useTranslation();
  const { TextArea } = Input;

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

        Object.keys(updatedItem).forEach((field) => {
          if (updatedItem[field] === '') {
            updatedItem[field] = null;
          }
        });

        message.warn('Updated null Question:', updatedItem);

        newData.splice(index, 1, updatedItem);
      } else {
        newData.push(row);
      }

      setData((prevData) => ({ ...prevData, loading: true }));
      setEditingKey('');

      try {
        await updateQuestion(key.toString(), row);
        setData((prevData) => ({ ...prevData, loading: true }));
        message.success('Question data updated successfully');
        fetch(data.pagination);
      } catch (error) {
        message.error('Error updating Question data');
        if (index > -1 && item) {
          newData.splice(index, 1, item);
          setData((prevData) => ({ ...prevData, data: newData, loading: false }));
        }
      }
    } catch (errInfo) {
      message.error('Validate Failed');
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
    setData((prevData) => ({ ...prevData, data: updatedData }));
  };

  const { isMounted } = useMounted();
  const [originalData, setOriginalData] = useState<Question[]>([]);

  const fetch = useCallback(
    async (pagination: Pagination) => {
      setData((tableData) => ({ ...tableData, loading: true }));
      getPaginatedQuestions(pagination)
        .then((res) => {
          if (isMounted.current) {
            setOriginalData(res.data);
            setData({ data: res.data, pagination: res.pagination, loading: false });
          }
        })
        .catch((error) => {
          message.error('Error fetching paginated questions:', error);
          setData((tableData) => ({ ...tableData, loading: false }));
        });

      try {
        const majorResponse = await getPaginatedMajors({ current: 1, pageSize: 10 });
        setMajors(majorResponse.data);
      } catch (error) {
        message.error('Error fetching majors');
      }

      try {
        const answerResponse = await getPaginatedAnswers({ current: 1, pageSize: 10 });
        setAnswers(answerResponse.data);
      } catch (error) {
        message.error('Error fetching questions');
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

      setData((prevData) => ({ ...prevData, loading: true }));

      try {
        const createdQuestion = await createQuestion(newData);

        const selectedMajor = majors.find((major) => major.id === newData.majorId);

        const selectedAnswer = answers.find((answer) => answer.id === newData.answerId);

        if (selectedMajor) {
          newData.majorId = selectedMajor.id;
        }

        if (selectedAnswer) {
          newData.answerId = selectedAnswer.id;
        }

        newData.id = createdQuestion.id;

        setData((prevData) => ({
          ...prevData,
          data: [...prevData.data, createdQuestion],
          loading: false,
        }));

        form.resetFields();
        setIsBasicModalOpen(false);
        message.success('Question data created successfully');
        fetch(data.pagination);
      } catch (error) {
        message.error('Error creating Question data');
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

  const [answerModalVisible, setAnswerModalVisible] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');

  const columns: ColumnsType<Question> = [
    {
      title: t('Tên câu hỏi'),
      dataIndex: 'name',
      render: (text: string, record: Question) => {
        const editable = isEditing(record);
        const dataIndex: keyof Question = 'name';
        return editable ? (
          <Form.Item
            key={record.name}
            name={dataIndex}
            initialValue={text}
            rules={[{ required: true, message: 'Tên nhiệm vụ là cần thiết' }]}
          >
            <TextArea
              autoSize={{ maxRows: 6 }}
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
      filters: majorNameFilters,
      onFilter: (value, record) => record.majorName === value,
      render: (text: string, record: Question) => {
        const editable = isEditing(record);
        const dataIndex: keyof Question = 'majorId';
        return editable ? (
          <Form.Item
            key={record.majorId}
            name={dataIndex}
            rules={[{ required: true, message: 'Tên ngành nghề là cần thiết' }]}
          >
            <Select
              style={{ maxWidth: '212.03px' }}
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
      title: t('Câu trả lời đúng'),
      dataIndex: 'answerName',
      render: (text: string, record: Question) => {
        const editable = isEditing(record);
        const dataIndex: keyof Question = 'answerId';
        const maxTextLength = 50;
        const truncatedText = text?.length > maxTextLength ? `${text.slice(0, maxTextLength)}...` : text;

        const openAnswerModal = () => {
          if (!editable && text?.length > maxTextLength) {
            setAnswerModalVisible(true);
            if (!editable) {
              setSelectedAnswer(text);
            }
          }
        };

        return (
          <>
            <div
              onClick={() => {
                if (text?.length > maxTextLength) {
                  openAnswerModal();
                }
              }}
              style={{
                cursor: !editable && text?.length > maxTextLength ? 'pointer' : 'default',
              }}
            >
              {editable ? (
                <Form.Item key={record.answerId} name={dataIndex} rules={[{ required: false }]}>
                  <Select
                    style={{ maxWidth: '212.03px' }}
                    value={record[dataIndex]}
                    onChange={(value) => handleInputChange(value, record.answerId, dataIndex)}
                    suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                  >
                    {answers.map((answer) => (
                      <Select.Option key={answer.id} value={answer.id}>
                        {answer.answerName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : (
                <>
                  <span>{truncatedText}</span>
                </>
              )}
            </div>
            <Modal
              title={t('Nội dung CÂU TRẢ LỜI ĐÚNG')}
              visible={answerModalVisible}
              onCancel={() => setAnswerModalVisible(false)}
              footer={null}
            >
              <p>{selectedAnswer}</p>
            </Modal>
          </>
        );
      },
    },
    {
      title: t('Trạng thái'),
      dataIndex: 'status',
      width: '15%',
      filters: [
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'INACTIVE', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
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

  const uploadProps = {
    name: 'file',
    multiple: true,
    action: `http://anhkiet-001-site1.htempurl.com/api/Questions/upload-excel-question`,
    onChange: (info: any) => {
      const { status } = info.file;
      if (status !== 'uploading') {
        message.warn(`${name} ${status}`);
      }
      if (status === 'done') {
        message.success(t('uploads.successUpload', { name: info.file.name }));
        fetch(data.pagination);
      } else if (status === 'error') {
        message.error(t('uploads.failedUpload', { name: info.file.name }));
      }
    },
  };

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
          <FlexContainer>
            <Label>{'Tên câu hỏi'}</Label>
            <InputContainer>
              <BaseForm.Item name="name" rules={[{ required: true, message: t('Tên câu hỏi là cần thiết') }]}>
                <Input maxLength={1000} />
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>{'Tên ngành'}</Label>
            <InputContainer>
              <BaseForm.Item name="majorId" rules={[{ required: true, message: t('Tên ngành nghề là cần thiết') }]}>
                <Select
                  style={{ maxWidth: '256px' }}
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
          </FlexContainer>

          <FlexContainer>
            <Label>{'Câu trả lời đúng'}</Label>
            <InputContainer>
              <BaseForm.Item name="answerId" rules={[{ required: true, message: t('Tên câu trả lời là cần thiết') }]}>
                <Select
                  style={{ maxWidth: '256px' }}
                  placeholder={'---- Chọn câu trả lời ----'}
                  suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                >
                  {answers.map((answer) => (
                    <Option key={answer.id} value={answer.id}>
                      {answer.answerName}
                    </Option>
                  ))}
                </Select>
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>

          <FlexContainer>
            <Label>Trạng thái</Label>
            <InputContainer>
              <BaseForm.Item name="status" rules={[{ required: true, message: t('Trạng thái câu hỏi là cần thiết') }]}>
                <Select
                  style={{ maxWidth: '256px' }}
                  placeholder={'---- Chọn trạng thái ----'}
                  suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
                >
                  <Option value="ACTIVE">{'ACTIVE'}</Option>
                  <Option value="INACTIVE">{'INACTIVE'}</Option>
                </Select>
              </BaseForm.Item>
            </InputContainer>
          </FlexContainer>
        </S.FormContent>
      </Modal>

      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />} style={{ position: 'absolute', top: '0', right: '0', margin: '15px 150px' }}>
          {t('uploads.clickToUpload')}
        </Button>
      </Upload>

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
