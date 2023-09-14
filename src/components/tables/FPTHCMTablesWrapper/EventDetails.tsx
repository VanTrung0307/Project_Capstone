/* eslint-disable prettier/prettier */
import { Event, Pagination, getPaginatedEvents } from '@app/api/FPT_3DMAP_API/Event';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { useNavigate } from 'react-router';
import { DownOutlined } from '@ant-design/icons';
import { getSchoolbyEventId } from '@app/api/FPT_3DMAP_API/EventSchool';
import { Select } from 'antd';
import { Option } from 'antd/lib/mentions';
import { EventStudentTable } from '../FPTHCMTable/EventStudentTable';
import { RankTable } from '../FPTHCMTable/RankTable';
import { SchoolEventTable } from '../FPTHCMTable/SchoolEventTable';
import { TaskEventTable } from '../FPTHCMTable/TaskEventTable';
import * as S from './FPTHCMTables.styles';
import './toggleSwitch.css';

type SchoolTablesProps = {
  eventId?: string;
};

export const EventDetails: React.FC<SchoolTablesProps> = ({ eventId }) => {
  const { t } = useTranslation();
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [schoolOptions, setSchoolOptions] = useState<{ id: string; name: string }[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');

  useEffect(() => {
    if (eventId) {
      const pagination: Pagination = { current: 1, pageSize: 100 };

      Promise.all([getPaginatedEvents(pagination), getSchoolbyEventId(eventId, pagination)])
        .then(([eventsResponse, schoolsResponse]) => {
          const eventData = eventsResponse.data.find((event) => event.id === eventId);
          setEvent(eventData);

          const schoolOptions = schoolsResponse.data.map((school) => ({
            id: school.schoolId,
            name: school.schoolName,
          }));
          setSchoolOptions(schoolOptions);
        })
        .catch((error) => {
          console.error('Error fetching paginated events and school options:', error);
        });
    }
  }, [eventId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const createdAt = event?.createdAt;
  const [day, month, year] = createdAt ? formatDate(createdAt).split(' ') : ['', '', ''];

  // const [activeTab, setActiveTab] = useState('#info');
  const [activeTabOnScroll, setActiveTabOnScroll] = useState<string>('');
  const pageContainerRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, tabId: string) => {
    event.preventDefault();
    setActiveTabOnScroll(tabId);
    const targetElement = document.querySelector(tabId);
    if (targetElement && pageContainerRef.current) {
      const containerScrollTop = pageContainerRef.current.scrollTop;
      const targetOffset =
        targetElement.getBoundingClientRect().top - pageContainerRef.current.offsetTop + containerScrollTop;
      scrollToTargetOffset(targetOffset);
    }
  };

  const handleScroll = () => {
    const container = pageContainerRef.current;
    if (!container) return;

    const currentPosition = container.scrollTop + container.offsetHeight / 2;

    if (currentPosition < container.scrollHeight * 0.25) {
      setActiveTabOnScroll('#info');
    } else if (currentPosition < container.scrollHeight * 0.5) {
      setActiveTabOnScroll('#eventschool');
    } else if (currentPosition < container.scrollHeight * 0.75) {
      setActiveTabOnScroll('#rankstudent');
    } else {
      setActiveTabOnScroll('#eventask');
    }
  };

  useEffect(() => {
    const container = pageContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollToTargetOffset = (targetOffset: number) => {
    const container = pageContainerRef.current;
    if (!container) return;

    const start = container.scrollTop;
    const distance = targetOffset - start;
    const duration = 500;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      if (elapsedTime > duration) {
        container.scrollTop = targetOffset;
        return;
      }

      const easingValue = easeInOutQuad(elapsedTime, start, distance, duration);
      container.scrollTop = easingValue;

      window.requestAnimationFrame(animateScroll);
    };

    window.requestAnimationFrame(animateScroll);
  };

  const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  const [activeCard, setActiveCard] = useState('rank');

  const handleSwitchCard = () => {
    setActiveCard(activeCard === 'rank' ? 'student' : 'rank');
  };

  return (
    <div ref={pageContainerRef} style={{ overflowY: 'auto', height: '600px' }}>
      <S.FPTHCMTablesWrapper>
        <div id="info">
          <S.InfoCard>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <S.EventDate>
                <S.Month>{month}</S.Month>
                <S.DateNumber>{day}</S.DateNumber>
                <S.DayOfWeek>{year}</S.DayOfWeek>
              </S.EventDate>
              <div style={{ marginLeft: '10px' }}>
                <S.EventName>{event?.name}</S.EventName>
                <S.EventStatus status={event?.status ?? 'UNKNOWN'}>
                  {event?.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}
                </S.EventStatus>
              </div>
            </div>
          </S.InfoCard>
        </div>

        <S.StickyCard>
          <S.TabWrapper>
            <S.TabLink
              href="#info"
              className={activeTabOnScroll === '#info' || activeTabOnScroll === '#info' ? 'active' : ''}
              onClick={(event) => handleTabClick(event, '#info')}
            >
              Thông tin
            </S.TabLink>
            <S.TabLink
              href="#eventschool"
              className={activeTabOnScroll === '#eventschool' || activeTabOnScroll === '#eventschool' ? 'active' : ''}
              onClick={(event) => handleTabClick(event, '#eventschool')}
            >
              Danh sách trường
            </S.TabLink>
            <S.TabLink
              href="#eventask"
              className={activeTabOnScroll === '#eventask' || activeTabOnScroll === '#eventask' ? 'active' : ''}
              onClick={(event) => handleTabClick(event, '#eventask')}
            >
              Danh sách nhiệm vụ
            </S.TabLink>
            <S.TabLink
              href="#rankstudent"
              className={activeTabOnScroll === '#rankstudent' || activeTabOnScroll === '#rankstudent' ? 'active' : ''}
              onClick={(event) => handleTabClick(event, '#rankstudent')}
            >
              Xếp hạng và Học sinh
            </S.TabLink>
          </S.TabWrapper>
        </S.StickyCard>

        <div id="eventschool" style={{ width: '100%', height: '60px' }}></div>
        <S.Card padding="1.25rem 1.25rem 0" title={t('Danh sách trường')}>
          <SchoolEventTable />
        </S.Card>

        <div id="rankstudent" style={{ width: '100%', height: '80px' }}></div>
        <Select
          style={{ width: 340, marginRight: 10, marginBottom: 10 }}
          suffixIcon={<DownOutlined style={{ color: '#339CFD' }} />}
          value={selectedSchoolId || undefined}
          placeholder="Chọn trường"
          onChange={(value) => setSelectedSchoolId(value)}
        >
          <Option key={undefined} value={undefined}>
            Chọn trường
          </Option>
          {schoolOptions.map((schoolOption) => (
            <Option key={schoolOption.id} value={schoolOption.id}>
              {schoolOption.name}
            </Option>
          ))}
        </Select>

        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={activeCard === 'student'}
            onChange={handleSwitchCard}
            className="toggle-switch-checkbox"
          />
          <div className="toggle-switch-slider"></div>
          <span style={{ left: '-120px' }} className="toggle-switch-label">
            Bảng xếp hạng
          </span>
          <span className="toggle-switch-label">Danh sách học sinh</span>
        </label>
        {activeCard === 'rank' ? (
          <S.Card padding="1.25rem 1.25rem 0" title={t('Bảng xếp hạng')}>
            <RankTable eventId={eventId} selectedSchoolId={selectedSchoolId} />
          </S.Card>
        ) : (
          <S.Card padding="1.25rem 1.25rem 0" title={t('Danh sách học sinh')}>
            <EventStudentTable eventId={eventId} selectedSchoolId={selectedSchoolId} />
          </S.Card>
        )}

        {/* <S.Card padding="1.25rem 1.25rem 0" title={t('Bảng xếp hạng')}>
          <RankTable eventId={eventId} selectedSchoolId={selectedSchoolId} />
        </S.Card>

        <S.Card padding="1.25rem 1.25rem 0" title={t('Danh sách học sinh')}>
          <StudentTable selectedSchoolId={selectedSchoolId} />
        </S.Card> */}

        <div id="eventask" style={{ width: '100%', height: '60px' }}></div>
        <S.Card padding="1.25rem 1.25rem 0" title={t('Danh sách nhiệm vụ')}>
          <TaskEventTable />
        </S.Card>
      </S.FPTHCMTablesWrapper>
    </div>
  );
};
