"use client"
import { Admin, EditGuesser, ListGuesser, Resource, ShowGuesser, CustomRoutes } from "react-admin";
import { Route } from 'react-router-dom';
import simpleRestProvider from "ra-data-simple-rest";
import AnalyticsWrapper from "./organization-analytics/AnalyticsWrapper";
import { FeedbackList } from "./feedbacks/list";
import { FeedbackEdit } from "./feedbacks/edit";
import { FeedbackShow } from "./feedbacks/show";
import { QuestionEdit } from "./questions/edit";
import { QuestionShow } from "./questions/show";
import { QuestionList } from "./questions/list";
import { MessageSquare, HelpCircle, Layers, BookOpen, ListTree, Ticket, Package, Building, Calendar, Users as UsersIcon, Settings, CreditCard, ClipboardCheck, AlertTriangle, Link as LinkIcon, FileText } from "lucide-react";
import { LessonCategoryList } from "./lessonCategory/list";
import { LessonCategoryEdit } from "./lessonCategory/edit";
import { LessonCategoryCreate } from "./lessonCategory/create";
import { LessonCategoryShow } from "./lessonCategory/show";
import { QuestionCreate } from "./questions/create";
import { LessonList } from "./lessons/list";
import { LessonEdit } from "./lessons/edit";
import { LessonShow } from "./lessons/show";
import { LessonCreate } from "./lessons/create";
import { LessonQuestionGroupList } from "./lessonQuestionGroups/list";
import { LessonQuestionGroupShow } from "./lessonQuestionGroups/show";
import { LessonQuestionGroupEdit } from "./lessonQuestionGroups/edit";
import { LessonQuestionGroupCreate } from "./lessonQuestionGroups/create";
import { CouponList } from "./coupons/list";
import { CouponEdit } from "./coupons/edit";
import { CouponShow } from "./coupons/show";
import { CouponCreate } from "./coupons/create";
import { PlanList } from "./plans/list";
import { PlanEdit } from "./plans/edit";
import { PlanShow } from "./plans/show";
import { PlanCreate } from "./plans/create";
import { OrganizationInfoList } from "./organizationInfo/list";
import { OrganizationInfoEdit } from "./organizationInfo/edit";
import { OrganizationInfoShow } from "./organizationInfo/show";
import { OrganizationInfoCreate } from "./organizationInfo/create";
import { OrganizationYearsList } from "./organizationYears/list";
import { OrganizationYearsEdit } from "./organizationYears/edit";
import { OrganizationYearsShow } from "./organizationYears/show";
import { OrganizationYearsCreate } from "./organizationYears/create";
import { UsersList } from "./users/list";
import { UsersEdit } from "./users/edit";
import { UsersShow } from "./users/show";
import { UserSettingsList } from "./userSettings/list";
import { UserSettingsEdit } from "./userSettings/edit";
import { UserSettingsShow } from "./userSettings/show";
import { SubscriptionsList } from "./subscriptions/list";
import { SubscriptionsEdit } from "./subscriptions/edit";
import { SubscriptionsShow } from "./subscriptions/show";
import { UserLessonResultsList } from "./userLessonResults/list";
import { UserLessonResultsEdit } from "./userLessonResults/edit";
import { UserLessonResultsShow } from "./userLessonResults/show";
import { UserWrongQuestionsList } from "./userWrongQuestions/list";
import { UserWrongQuestionsEdit } from "./userWrongQuestions/edit";
import { UserWrongQuestionsShow } from "./userWrongQuestions/show";
import { OnlineLessonList } from "./onlineLessons/list";
import { OnlineLessonEdit } from "./onlineLessons/edit";
import { OnlineLessonShow } from "./onlineLessons/show";
import { OnlineLessonCreate } from "./onlineLessons/create";
import { SystemConfigList } from "./systemConfig/list";
import { SystemConfigEdit } from "./systemConfig/edit";
import { SystemConfigShow } from "./systemConfig/show";
import { SystemConfigCreate } from "./systemConfig/create";

const dataProvider = simpleRestProvider("/api");

const App = () => {
    return (
        <Admin dataProvider={dataProvider}>


            <Resource
                name="feedbacks"
                list={FeedbackList}
                edit={FeedbackEdit}
                recordRepresentation="title"
                icon={MessageSquare}
                show={FeedbackShow}
            />
            <Resource
                name="questions"
                list={QuestionList}
                edit={QuestionEdit}
                create={QuestionCreate}
                recordRepresentation="text"
                icon={HelpCircle}
                show={QuestionShow}
            />
            <Resource
                name="lessonCategory"
                list={LessonCategoryList}
                create={LessonCategoryCreate}
                edit={LessonCategoryEdit}
                recordRepresentation="text"
                icon={Layers}
                show={LessonCategoryShow}
            />
            <Resource
                name="lessons"
                list={LessonList}
                edit={LessonEdit}
                create={LessonCreate}
                recordRepresentation="text"
                icon={BookOpen}
                show={LessonShow}
            />
            <Resource
                name="lessonQuestionGroups"
                list={LessonQuestionGroupList}
                edit={LessonQuestionGroupEdit}
                create={LessonQuestionGroupCreate}
                recordRepresentation="lessonQuestionGroups"
                icon={ListTree}
                show={LessonQuestionGroupShow}
            />
            <Resource
                name="coupons"
                list={CouponList}
                edit={CouponEdit}
                create={CouponCreate}
                recordRepresentation="code"
                icon={Ticket}
                show={CouponShow}
            />
            <Resource
                name="plans"
                list={PlanList}
                create={PlanCreate}
                edit={PlanEdit}
                recordRepresentation="name"
                icon={Package}
                show={PlanShow}
            />
            <Resource
                name="organizationInfo"
                list={OrganizationInfoList}
                edit={OrganizationInfoEdit}
                create={OrganizationInfoCreate}
                recordRepresentation="name"
                icon={Building}
                show={OrganizationInfoShow}
            />
            <Resource
                name="organizationYears"
                list={OrganizationYearsList}
                edit={OrganizationYearsEdit}
                create={OrganizationYearsCreate}
                recordRepresentation="year"
                icon={Calendar}
                show={OrganizationYearsShow}
            />
            <Resource
                name="users"
                list={UsersList}
                edit={UsersEdit}
                recordRepresentation="name"
                icon={UsersIcon}
                show={UsersShow}
            />
            <Resource
                name="userSettings"
                list={UserSettingsList}
                edit={UserSettingsEdit}
                recordRepresentation="id"
                icon={Settings}
                show={UserSettingsShow}
            />
            <Resource
                name="subscriptions"
                list={SubscriptionsList}
                edit={SubscriptionsEdit}
                recordRepresentation="id"
                icon={CreditCard}
                show={SubscriptionsShow}
            />
            <Resource
                name="userLessonResults"
                list={UserLessonResultsList}
                edit={UserLessonResultsEdit}
                recordRepresentation="id"
                icon={ClipboardCheck}
                show={UserLessonResultsShow}
            />
            <Resource
                name="userWrongQuestions"
                list={UserWrongQuestionsList}
                edit={UserWrongQuestionsEdit}
                recordRepresentation="id"
                icon={AlertTriangle}
                show={UserWrongQuestionsShow}
            />
            <Resource
                name="onlineLessons"
                list={OnlineLessonList}
                edit={OnlineLessonEdit}
                create={OnlineLessonCreate}
                recordRepresentation="title"
                icon={LinkIcon}
                show={OnlineLessonShow}
            />
            <Resource
                name="systemConfig"
                list={SystemConfigList}
                edit={SystemConfigEdit}
                create={SystemConfigCreate}
                recordRepresentation="systemStep"
                icon={FileText}
                show={SystemConfigShow}
            />
            <CustomRoutes>
                <Route path="/organization-analytics" element={<AnalyticsWrapper />} />
            </CustomRoutes>
        </Admin>
    );
}

export default App;
