import Quiz from "../_components/Quiz";
import { getQuizDataByLessonId } from "@/db/queries";
type Props = {
    params: Promise<{
        lessonId: string
    }>
}
const LessonIdPage = async ({
    params,
}: Props) => {

    const { lessonId } = await params;
    const quizDataByLessonId = getQuizDataByLessonId(lessonId);

    const [{ questionGroups, questionsDict, userPreviousAnswers, numQuestion }] = await Promise.all([quizDataByLessonId]);






    return (
        <Quiz

            initialLessonId={lessonId}
            initialCoins={10}
            questionGroups={questionGroups}
            questionsDict={questionsDict}
            userPreviousAnswers={userPreviousAnswers}
            systemNumQuestions={numQuestion ?? undefined}
        />
    );
}

export default LessonIdPage;