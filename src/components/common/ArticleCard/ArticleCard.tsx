/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Event, getEventById, getPaginatedEvents, updateEvent } from '@app/api/FPT_3DMAP_API/Event';
import logoCard from '@app/assets/Logo.png';
import { Dates } from '@app/constants/Dates';
import { Form, Input, Modal, Select, Tooltip, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag } from '../Tag/Tag';
import * as S from './ArticleCard.styles';
import { Option } from 'antd/lib/mentions';
interface ArticleCardProps {
  id: string;
  name?: string;
  createdAt: string;
  status?: string;
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  name,
  createdAt,
  status,
  id,
  className = 'article-card',
}) => {
  const [events, setEvents] = useState<Event[]>([]);

  const fetchEvents = async () => {
    try {
      const pagination = { current: 1, pageSize: 100 };
      const { data } = await getPaginatedEvents(pagination);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getTagColor = (status: string) => {
    return status === 'ACTIVE' ? 'success' : 'error';
  };

  const navigate = useNavigate();

  const handleDetailClick = async () => {
    try {
      await getEventById(id);
      navigate(`/event/${id}`);
    } catch (error) {
      message.error('Chưa có dữ liệu');
    }
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleEditClick = () => {
    setIsModalVisible(true);
    const event = events.find((event) => event.id === id);
    form.setFieldsValue({
      name: event?.name,
      status: event?.status,
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const eventData = {
        name: values.name,
        status: values.status,
      };
      await updateEvent(id, eventData);
      message.success('Cập nhật thành công');

      form.resetFields();
      setIsModalVisible(false);

      setTimeout(() => {
        fetchEvents();
      }, 100);
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const [isOpen, setIsOpen] = useState(false);

  const handleDotsClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <S.Wrapper className={className}>
      <S.Header>
        {!!logoCard && <img src={logoCard} alt="author" style={{ width: '43px', height: '43px' }} />}
        <S.AuthorWrapper>
          {name && <S.Author>{name}</S.Author>}
          <S.DateTime>📆 {Dates.format(createdAt, 'DD/MM/YYYY')}</S.DateTime>
        </S.AuthorWrapper>
      </S.Header>

      {status && (
        <S.TagsWrapper>
          <Tag title={status} bgColor={getTagColor(status)} />
        </S.TagsWrapper>
      )}

      <S.DotsButton onClick={handleDotsClick}>⋮</S.DotsButton>
      <S.ButtonAction isOpen={isOpen}>
        <Tooltip title="Chi tiết">
          <S.DetailButton onClick={handleDetailClick}>👁‍🗨</S.DetailButton>
        </Tooltip>
        <Tooltip title="Chỉnh sửa">
          <S.EditButton onClick={handleEditClick}>📝</S.EditButton>
        </Tooltip>
      </S.ButtonAction>

      <Modal title="Edit Event" visible={isModalVisible} onOk={handleModalOk} onCancel={handleModalCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Event Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="ACTIVE">Active</Option>
              <Option value="INACTIVE">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </S.Wrapper>
  );
};
