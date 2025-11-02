
import Quiz from "@/app/lesson/_components/Quiz";
import { getUserWrongQuestionsByCategoryId } from "@/db/queries";
import FeedbackButton from "@/components/feedbackButton";
type Props = {
    params: Promise<{ categoryId: string }>
}
const PracticeCategoryIdPage = async ({
    params,
}: Props) => {

    const { categoryId } = await params;
    const quizDataByCategoryId = getUserWrongQuestionsByCategoryId(categoryId);


    const [{ questionGroups: rawQuestionGroups, questionsDict, userPreviousAnswers }] = await Promise.all([quizDataByCategoryId]);

    // Normalize API shape: ensure `categoryId` exists (fallback from `category`)
    const questionGroups = (rawQuestionGroups as any[]).map((g) => ({
        ...g,
        categoryId: g.categoryId ?? g.category,
    }));





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