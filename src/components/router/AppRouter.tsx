/* eslint-disable prettier/prettier */
import ForgotPasswordPage from '@app/pages/ForgotPasswordPage';
import LockPage from '@app/pages/LockPage';
import LoginPage from '@app/pages/LoginPage';
import NewPasswordPage from '@app/pages/NewPasswordPage';
import SecurityCodePage from '@app/pages/SecurityCodePage';
import SignUpPage from '@app/pages/SignUpPage';
import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// no lazy loading for auth pages to avoid flickering
const AuthLayout = React.lazy(() => import('@app/components/layouts/AuthLayout/AuthLayout'));

import MainLayout from '@app/components/layouts/main/MainLayout/MainLayout';
import ProfileLayout from '@app/components/profile/ProfileLayout';
import RequireAuth from '@app/components/router/RequireAuth';
import { withLoading } from '@app/hocs/withLoading.hoc';

import FPTHCMDashboardPage from '@app/pages/DashboardPages/FPT_HCMDashboardPage';

const NewsFeedPage = React.lazy(() => import('@app/pages/NewsFeedPage'));
const KanbanPage = React.lazy(() => import('@app/pages/KanbanPage'));
const DataTablesPage = React.lazy(() => import('@app/pages/DataTablesPage'));
const ChartsPage = React.lazy(() => import('@app/pages/ChartsPage'));
const ServerErrorPage = React.lazy(() => import('@app/pages/ServerErrorPage'));
const Error404Page = React.lazy(() => import('@app/pages/Error404Page'));
const AdvancedFormsPage = React.lazy(() => import('@app/pages/AdvancedFormsPage'));
const ButtonsPage = React.lazy(() => import('@app/pages/uiComponentsPages/ButtonsPage'));
const SpinnersPage = React.lazy(() => import('@app/pages/uiComponentsPages/SpinnersPage'));
const AvatarsPage = React.lazy(() => import('@app/pages/uiComponentsPages/dataDisplay/AvatarsPage'));
const BadgesPage = React.lazy(() => import('@app/pages/uiComponentsPages/dataDisplay/BadgesPage'));
const CollapsePage = React.lazy(() => import('@app/pages/uiComponentsPages/dataDisplay/CollapsePage'));
const PaginationPage = React.lazy(() => import('@app/pages/uiComponentsPages/dataDisplay/PaginationPage'));
const ModalsPage = React.lazy(() => import('@app/pages/uiComponentsPages/modals/ModalsPage'));
const PopoversPage = React.lazy(() => import('@app/pages/uiComponentsPages/modals/PopoversPage'));
const PopconfirmsPage = React.lazy(() => import('@app/pages/uiComponentsPages/modals/PopconfirmsPage'));
const ProgressPage = React.lazy(() => import('@app/pages/uiComponentsPages/feedback/ProgressPage'));
const ResultsPage = React.lazy(() => import('@app/pages/uiComponentsPages/feedback/ResultsPage'));
const AlertsPage = React.lazy(() => import('@app/pages/uiComponentsPages/feedback/AlertsPage'));
const SkeletonsPage = React.lazy(() => import('@app/pages/uiComponentsPages/feedback/SkeletonsPage'));
const InputsPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/InputsPage'));
const CheckboxesPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/CheckboxesPage'));
const RadiosPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/RadiosPage'));
const SelectsPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/SelectsPage'));
const SwitchesPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/SwitchesPage'));
const UploadsPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/UploadsPage'));
const RatesPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/RatesPage'));
const AutoCompletesPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/AutoCompletesPage'));
const StepsPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/StepsPage'));
const DateTimePickersPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/DateTimePickersPage'));
const DropdownsPage = React.lazy(() => import('@app/pages/uiComponentsPages/DropdownsPage'));
const BreadcrumbsPage = React.lazy(() => import('@app/pages/uiComponentsPages/navigation/BreadcrumbsPage'));
const TabsPage = React.lazy(() => import('@app/pages/uiComponentsPages/navigation/TabsPage'));
const NotificationsUIPage = React.lazy(() => import('@app/pages/uiComponentsPages/feedback/NotificationsPage'));

const Logout = React.lazy(() => import('./Logout'));

// New Page for Project
export const FPTHCM_DASHBOARD_PATH = '/';
const Dashboard = withLoading(FPTHCMDashboardPage);
const PlayerProfile = React.lazy(() => import('@app/pages/PlayerProfliePage'));
// const User = React.lazy(() => import('@app/pages/UserPage'));
const Player = React.lazy(() => import('@app/pages/PlayerPage'));
const RoomVsLocation = React.lazy(() => import('@app/pages/RoomAndLocationPage'));
// const Event = React.lazy(() => import('@app/pages/EventPage'));
const EventDetail = React.lazy(() => import('@app/pages/EventDetailPage'));
const School = React.lazy(() => import('@app/pages/SchoolPage'));
const SchoolEvent = React.lazy(() => import('@app/pages/SchoolEventPage'));
const TaskEvent = React.lazy(() => import('@app/pages/TaskEventPage'));
const HistoryPlayer = React.lazy(() => import('@app/pages/HistoryPlayerPage'));
const StudentEvent = React.lazy(() => import('@app/pages/EventStudentPage'));
const Task = React.lazy(() => import('@app/pages/TaskPage'));
const Major = React.lazy(() => import('@app/pages/MajorPage'));
const QuestionBank = React.lazy(() => import('@app/pages/QuestionBankPage'));
// const Answer = React.lazy(() => import('@app/pages/AnswerPage'));
const NPC = React.lazy(() => import('@app/pages/NPCPage'));
const Gift = React.lazy(() => import('@app/pages/GiftPage'));
const Item = React.lazy(() => import('@app/pages/ItemPage'));
const Rank = React.lazy(() => import('@app/pages/RankPage'));

export const NFT_DASHBOARD_PATH = '/';
export const MEDICAL_DASHBOARD_PATH = '/medical-dashboard';

const NewsFeed = withLoading(NewsFeedPage);
const Kanban = withLoading(KanbanPage);
const AdvancedForm = withLoading(AdvancedFormsPage);

// UI Components
const Buttons = withLoading(ButtonsPage);
const Spinners = withLoading(SpinnersPage);
const Inputs = withLoading(InputsPage);
const Checkboxes = withLoading(CheckboxesPage);
const Radios = withLoading(RadiosPage);
const Selects = withLoading(SelectsPage);
const Switches = withLoading(SwitchesPage);
const Uploads = withLoading(UploadsPage);
const Rates = withLoading(RatesPage);
const AutoCompletes = withLoading(AutoCompletesPage);
const Steps = withLoading(StepsPage);
const DateTimePickers = withLoading(DateTimePickersPage);
const Dropdowns = withLoading(DropdownsPage);
const Breadcrumbs = withLoading(BreadcrumbsPage);
const Tabs = withLoading(TabsPage);
const Avatars = withLoading(AvatarsPage);
const Badges = withLoading(BadgesPage);
const Collapse = withLoading(CollapsePage);
const Pagination = withLoading(PaginationPage);
const Modals = withLoading(ModalsPage);
const Popovers = withLoading(PopoversPage);
const Popconfirms = withLoading(PopconfirmsPage);
const Progress = withLoading(ProgressPage);
const Results = withLoading(ResultsPage);
const Alerts = withLoading(AlertsPage);
const NotificationsUI = withLoading(NotificationsUIPage);
const Skeletons = withLoading(SkeletonsPage);

const DataTables = withLoading(DataTablesPage);
const Charts = withLoading(ChartsPage);

const ServerError = withLoading(ServerErrorPage);
const Error404 = withLoading(Error404Page);

const AuthLayoutFallback = withLoading(AuthLayout);
const LogoutFallback = withLoading(Logout);

export const AppRouter: React.FC = () => {
  const protectedLayout = (
    <RequireAuth>
      <MainLayout />
    </RequireAuth>
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserRouter>
        <Routes>
          <Route path={FPTHCM_DASHBOARD_PATH} element={protectedLayout}>
            <Route index element={<Dashboard />} />
            <Route path="apps">
              <Route path="feed" element={<NewsFeed />} />
              <Route path="kanban" element={<Kanban />} />
            </Route>
            <Route path="forms">
              <Route path="advanced-forms" element={<AdvancedForm />} />
            </Route>
            <Route path="game">
              <Route path="rooms-location" element={<RoomVsLocation />} />
              <Route path="npcs" element={<NPC />} />
              <Route path="items" element={<Item />} />
            </Route>
            <Route path="system">
              <Route path="players" element={<Player />} />
              {/* <Route path="events" element={<Event />} /> */}
              <Route path="school" element={<School />} />
              <Route path="tasks" element={<Task />} />
              <Route path="majors" element={<Major />} />
              <Route path="questionbanks" element={<QuestionBank />} />
              {/* <Route path="answers" element={<Answer />} /> */}
              <Route path="gifts" element={<Gift />} />
              <Route path="ranks" element={<Rank />} />
            </Route>
            <Route path="players/:playerId" element={<HistoryPlayer />} />
            <Route path="student/:schoolId" element={<StudentEvent />} />
            <Route path="schools/:eventId" element={<SchoolEvent />} />
            <Route path="tasks/:eventId" element={<TaskEvent />} />
            <Route path="event/:eventId" element={<EventDetail />} />
            <Route path="data-tables" element={<DataTables />} />
            <Route path="player-profiles" element={<PlayerProfile />} />
            {/* <Route path="users" element={<User />} /> */}
            <Route path="charts" element={<Charts />} />
            <Route path="server-error" element={<ServerError />} />
            <Route path="404" element={<Error404 />} />
            <Route path="profile" element={<ProfileLayout />} />
            <Route path="ui-components">
              <Route path="button" element={<Buttons />} />
              <Route path="spinner" element={<Spinners />} />
              <Route path="input" element={<Inputs />} />
              <Route path="checkbox" element={<Checkboxes />} />
              <Route path="radio" element={<Radios />} />
              <Route path="select" element={<Selects />} />
              <Route path="switch" element={<Switches />} />
              <Route path="upload" element={<Uploads />} />
              <Route path="rate" element={<Rates />} />
              <Route path="auto-complete" element={<AutoCompletes />} />
              <Route path="steps" element={<Steps />} />
              <Route path="date-time-picker" element={<DateTimePickers />} />
              <Route path="dropdown" element={<Dropdowns />} />
              <Route path="breadcrumbs" element={<Breadcrumbs />} />
              <Route path="tabs" element={<Tabs />} />
              <Route path="avatar" element={<Avatars />} />
              <Route path="badge" element={<Badges />} />
              <Route path="collapse" element={<Collapse />} />
              <Route path="pagination" element={<Pagination />} />
              <Route path="modal" element={<Modals />} />
              <Route path="popover" element={<Popovers />} />
              <Route path="popconfirm" element={<Popconfirms />} />
              <Route path="progress" element={<Progress />} />
              <Route path="result" element={<Results />} />
              <Route path="alert" element={<Alerts />} />
              <Route path="notification" element={<NotificationsUI />} />
              <Route path="skeleton" element={<Skeletons />} />
            </Route>
          </Route>
          <Route path="/auth" element={<AuthLayoutFallback />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="sign-up" element={<SignUpPage />} />
            <Route
              path="lock"
              element={
                <RequireAuth>
                  <LockPage />
                </RequireAuth>
              }
            />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="security-code" element={<SecurityCodePage />} />
            <Route path="new-password" element={<NewPasswordPage />} />
          </Route>
          <Route path="/logout" element={<LogoutFallback />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
};
