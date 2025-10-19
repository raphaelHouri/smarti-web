
import Quiz from "@/app/lesson/_components/Quiz";
import { getUserWrongQuestionsByCategoryId } from "@/db/queries";
type Props = {
    params: {
        categoryId: string
    }
}
const PracticeCategoryIdPage = async ({
    params,
}: Props) => {

    const { categoryId } = await params;
    const quizDataByCategoryId = getUserWrongQuestionsByCategoryId(categoryId);
    



    const [{ questionGroups, questionsDict, userPreviousAnswers }] = await Promise.all([quizDataByCategoryId]);

    console.log(questionGroups, questionsDict)





    return (
        <Quiz

            initialLessonId={"practiceMode"}
            initialHearts={10}
            questionGroups={questionGroups}
            questionsDict={questionsDict}
            userPreviousAnswers={userPreviousAnswers}
        />
    );
}

export default PracticeCategoryIdPage;