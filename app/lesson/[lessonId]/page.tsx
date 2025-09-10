import Quiz from "../_components/Quiz";
import { getQuizDataByLessonId } from "@/db/queries";
type Props = {
    params: {
        lessonId: string
    }
}
const LessonIdPage = async ({
    params,
}: Props) => {

    const { lessonId } = await params;
    const quizDataByLessonId = getQuizDataByLessonId(lessonId);


    const [{ questionGroups, questionsDict }] = await Promise.all([quizDataByLessonId]);
    console.log(questionGroups, questionsDict)





    return (
        <Quiz

            initialLessonId={lessonId}
            initialHearts={10}
            questionGroups={questionGroups}
            questionsDict={questionsDict}
        />
    );
}

export default LessonIdPage;