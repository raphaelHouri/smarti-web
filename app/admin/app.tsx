"use client"
import { Admin, EditGuesser, ListGuesser, Resource, ShowGuesser } from "react-admin";
import simpleRestProvider from "ra-data-simple-rest";
import { FeedbackList } from "./feedbacks/list";
import { FeedbackEdit } from "./feedbacks/edit";
import { FeedbackShow } from "./feedbacks/show";
import { QuestionEdit } from "./questions/edit";
import { QuestionShow } from "./questions/show";
import { QuestionList } from "./questions/list";
import { Cat } from "lucide-react";
import { LessonCategoryList } from "./lessonCategory/list";
import { LessonCategoryEdit } from "./lessonCategory/edit";
import { LessonCategoryShow } from "./lessonCategory/show";
import { QuestionCreate } from "./questions/create";
import { LessonList } from "./lessons/list";
import { LessonEdit } from "./lessons/edit";
import { LessonShow } from "./lessons/show";
import { LessonQuestionGroupList } from "./lessonQuestionGroups/list";
import { LessonQuestionGroupShow } from "./lessonQuestionGroups/show";
import { LessonQuestionGroupEdit } from "./lessonQuestionGroups/edit";

const dataProvider = simpleRestProvider("/api");

const App = () => {
    return (
        <Admin dataProvider={dataProvider}>

            {/* <Resource
                name="challenges"
                list={ChallengesList}
                create={ChallengesCreate}
                edit={ChallengesEdit}
                recordRepresentation="question"
            />
            <Resource
                name="challengesOptions"
                list={ChallengesOptionsList}
                create={ChallengesOptionsCreate}
                edit={ChallengesOptionsEdit}
                recordRepresentation="text"
            /> */}
            <Resource
                name="feedbacks"
                list={FeedbackList}
                edit={FeedbackEdit}
                recordRepresentation="title"
                show={FeedbackShow}
            />
            <Resource
                name="questions"
                list={QuestionList}
                edit={QuestionEdit}
                create={QuestionCreate}
                recordRepresentation="text"
                show={QuestionShow}
            />
            <Resource
                name="lessonCategory"
                list={LessonCategoryList}
                edit={LessonCategoryEdit}
                recordRepresentation="text"
                show={LessonCategoryShow}
            />
            <Resource
                name="lessons"
                list={LessonList}
                edit={LessonEdit}
                recordRepresentation="text"
                show={LessonShow}
            />
            <Resource
                name="lessonQuestionGroups"
                list={LessonQuestionGroupList}
                edit={LessonQuestionGroupEdit}
                recordRepresentation="text"
                show={LessonQuestionGroupShow}
            />
            Admin
        </Admin>
    );
}

export default App;
