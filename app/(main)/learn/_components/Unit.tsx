
import { lessons, lessonCategory } from "@/db/schemaSmarti"

import { UnitBanner } from "./UnitBanner"
import LessonButton from "./LessonButton"

interface UnitProps {
    id: string
    title: string
    description: string

    lessons: (typeof lessons.$inferSelect & {
        completed: boolean
        rightQuestions: number | undefined
        totalQuestions: number | undefined
    })[],
}
const Unit = ({
    title,
    description,
    lessons,
}: UnitProps) => {
    return (
        <div>
            <UnitBanner title={title} description={description} />
            <div className="flex flex-col items-center relative">
                {lessons.map((lesson, index) => {

                    const isCurrent = !lesson.completed && index === 0 || (index > 0 && !lesson.completed && lessons[index - 1]?.completed);
                    const isLocked = !lesson.completed && !isCurrent;

                    return (
                        <LessonButton
                            key={lesson.id}
                            id={lesson.id}
                            index={index}
                            totalCount={lessons.length - 1}
                            locked={isLocked}
                            current={isCurrent}
                            rightQuestions={lesson.rightQuestions}
                            totalQuestions={lesson.totalQuestions}
                            isPremium={(lesson as any).isPremium}
                        />
                    )
                })}
            </div>
        </div>
    );
}

export default Unit;