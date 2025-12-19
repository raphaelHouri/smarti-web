import Quiz from "../_components/Quiz";
import { getQuizDataByLessonId, getUserSettingsById } from "@/db/queries";
import { auth } from "@clerk/nextjs/server";
type Props = {
    params: Promise<{
        lessonId: string
    }>
}
const LessonIdPage = async ({
    params,
}: Props) => {

    const { lessonId } = await params;
    const { userId } = await auth();
    const quizDataByLessonId = getQuizDataByLessonId(lessonId);
    const userSettingsData = userId ? getUserSettingsById(userId) : Promise.resolve(null);

    const [{ questionGroups, questionsDict, userPreviousAnswers, numQuestion }, userSettings] = await Promise.all([quizDataByLessonId, userSettingsData]);

    const lessonClock = userSettings?.lessonClock ?? true;



    return (
        <Quiz
            initialLessonId={lessonId}
            initialCoins={10}
            questionGroups={questionGroups}
            questionsDict={questionsDict}
            userPreviousAnswers={userPreviousAnswers}
            systemNumQuestions={numQuestion ?? undefined}
            lessonClock={lessonClock}
        />
    );
}

export default LessonIdPage;