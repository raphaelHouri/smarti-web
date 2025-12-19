
import Quiz from "@/app/lesson/_components/Quiz";
import { getUserWrongQuestionsByCategoryId, getUserSettingsById } from "@/db/queries";
import FeedbackButton from "@/components/feedbackButton";
import { auth } from "@clerk/nextjs/server";
type Props = {
    params: Promise<{ categoryId: string }>
}
const PracticeCategoryIdPage = async ({
    params,
}: Props) => {

    const { categoryId } = await params;
    const { userId } = await auth();
    const quizDataByCategoryId = getUserWrongQuestionsByCategoryId(categoryId);
    const userSettingsData = userId ? getUserSettingsById(userId) : Promise.resolve(null);

    const [{ questionGroups: rawQuestionGroups, questionsDict, userPreviousAnswers, numQuestion }, userSettings] = await Promise.all([quizDataByCategoryId, userSettingsData]);

    const lessonClock = userSettings?.lessonClock ?? true;

    // Normalize API shape: ensure `categoryId` exists (fallback from `category`)
    const questionGroups = (rawQuestionGroups as any[]).map((g) => ({
        ...g,
        categoryId: g.categoryId ?? g.category,
    }));





    return (
        <Quiz
            initialLessonId={"practiceMode"}
            initialCoins={10}
            questionGroups={questionGroups}
            questionsDict={questionsDict}
            userPreviousAnswers={userPreviousAnswers}
            systemNumQuestions={numQuestion ?? undefined}
            lessonClock={lessonClock}
        />
    );
}

export default PracticeCategoryIdPage;