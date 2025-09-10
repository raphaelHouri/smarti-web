"use client"

import { userSubscription } from "@/db/schema"
import { challengesOptions } from '../../../db/schema';
import { useState, useTransition, useEffect, useMemo, useCallback } from "react";
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'
import Header from "./Header";
import QuestionBubble from "./QuestionBubble";
import Challenge from "./ChallengeOpt";
import Footer from "./Footer";
import { upsertChallengeProgress } from "@/actions/challenge-progress";
import { toast } from "sonner";
import { useAudio, useMount } from "react-use";
import ResultCard from "./result-card";
import { useRouter } from "next/navigation";
import { useHeartsModal } from "@/store/use-hearts";
import { usePracticeModal } from "@/store/use-practice-modal";
import CelebrateJson from "./lottie";
import { lessonQuestionGroups, questions } from "@/db/schemaSmarti";
import { set, z } from "zod";
import { useFinishLessonModal } from "@/store/use-finish-lesson-modal";
import { useRegisterModal } from "@/store/use-register-modal";
import { useAuth, useClerk } from "@clerk/nextjs";
import { getUser } from "@/db/queries";

const optionsSchema = z.object({
    a: z.string(),
    b: z.string(),
    c: z.string(),
    d: z.string(),
});

export type Options = z.infer<typeof optionsSchema>;
interface QuizProps {
    initialLessonId: string
    initialHearts: number
    questionGroups: (typeof lessonQuestionGroups.$inferSelect)[]
    questionsDict: { [q: string]: typeof questions.$inferSelect };
}

const Quiz = ({
    initialLessonId,
    initialHearts,
    questionGroups,
    questionsDict
}: QuizProps) => {
    const [hearts, setHearts] = useState(initialHearts);
    const [challenges] = useState(questionGroups[0]);
    const [status, setStatus] = useState<"correct" | "wrong" | "none">("none")
    const [resultList, setResultList] = useState<Array<"a" | "b" | "c" | "d" | null>>(Array(questionGroups[0].questionList.length).fill(null));
    const [selectedOption, setSelectedOption] = useState<"a" | "b" | "c" | "d">()
    const [pending, startTransition] = useTransition();
    const [guest, setGuest] = useState(false);
    const [lessonId] = useState(initialLessonId)
    const [activeIndex, setActiveIndex] = useState(0)
    const { userId } = useAuth();


    const router = useRouter();
    if (!challenges || !challenges.questionList || challenges.questionList.length === 0) {
        return <p>no challenges displayed</p>;
    }

    // ---- CURRENT QUESTION ----
    const total = challenges.questionList.length;
    const currentQuestionId = challenges.questionList[activeIndex];
    const question = questionsDict[currentQuestionId];
    if (!question) return <p>Question not found</p>;

    const options = optionsSchema.parse(question.options);
    if (!options) return <p> option not exists</p>

    const { open: OpenHeartsModal } = useHeartsModal();
    const { open: OpenPracticeModal } = usePracticeModal();
    const { open: OpenFinishLessonModal, isApproved: isFinishApproved } = useFinishLessonModal();
    const { open: OpenRegisterModal } = useRegisterModal();

    useMount(() => {
        const initialPercentage = Math.floor(Math.random() * 101)
        if (true || initialPercentage === 100) {
            OpenPracticeModal();
        }
    })
    useEffect(() => {
        const handleUserEffect = async () => {
            if (userId && guest) {
                // need to save the resultList
                console.log(resultList);
                // createUser
                await getUser()
                
                
                setGuest(false);

            } else {
                setGuest(true);
            }
        };
        handleUserEffect();
    }, [userId]);
    // const answeredCount = useMemo(
    //     () => resultList.filter((v) => v !== null).length,
    //     [resultList]
    // );
    const progressPct = useMemo(
        () => {

            return ((activeIndex + (!!selectedOption ? 1 : 0)) / total) * 100
        },
        [activeIndex, total, selectedOption]
    );

    const goTo = (idx: number) => {
        console.log("Going to index:", idx);
        setStatus("none");
        setSelectedOption(resultList[idx] ? resultList[idx] : undefined);
        if (idx < 0 || idx >= total) return;
        setActiveIndex(idx);
    };

    const onPrev = () => goTo(activeIndex - 1);
    const onNextNav = () => {
        if (activeIndex < total - 1) goTo(activeIndex + 1);
        else OpenFinishLessonModal();
    };


    const handleWatchAgain = () => {
        if (!userId) {
            OpenRegisterModal()

        } else {
            goTo(0);
        }

    }

    const onCheck = () => {
        startTransition(() => {
            upsertChallengeProgress(challenges.lessonId)
                .then((res) => {
                    if (res?.error) {
                        OpenHeartsModal();
                        return;
                    }
                    setStatus("correct")
                    const initialPercentage = Math.floor(Math.random() * 101)
                    if (initialPercentage === 100) {
                        setHearts((prev) => Math.min(prev + 1, 5))
                    }
                })
                .catch(() => toast.error("Something went wrong"))
        });
        router.push(`/learn`)
    }

    const { width, height } = useWindowSize();

    // ---- FINISH SCREEN ----
    // FIX LETTER ACTIVE = 0
    if (activeIndex === total || isFinishApproved) {
        return (
            <>
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={1000}
                    tweenDuration={10000}
                />
                <div className="flex flex-col gap-y-4 lg:gap-y-8 items-center justify-center h-full max-w-lg mx-auto">
                    <CelebrateJson />
                    <h1 className="text-xl text-center lg:text-3xl font-bold text-neutral-700 dark:text-slate-200">
                        Great Job! <br /> You&apos;ve completed the lesson.
                    </h1>
                    <div className="flex items-center gap-x-4 w-full">
                        <ResultCard variant="points" value={total * 10} />
                        <ResultCard variant="hearts" value={hearts} />
                    </div>
                </div>
                <Footer
                    lessonId={lessonId}
                    status="completed"
                    onCheck={onCheck}
                    handleWatchAgain={handleWatchAgain}
                />
            </>
        )
    }

    const title = question.question

    const onSelect = (option: "a" | "b" | "c" | "d") => {
        setStatus("none");
        setResultList((current) => {
            const newList = [...current];
            newList[activeIndex] = option;
            return newList;
        });
        setSelectedOption(option);
    }

    // Footer primary button continues (wired to same next logic) (UPDATED)
    const onContinue = () => {
        onNextNav();
    }

    const isPro = true

    return (
        <>
            <Header
                hearts={hearts}
                percentage={progressPct /* UPDATED */}
                hasActiveSubscription={isPro}
            />
            <div className="flex-1">
                <div className="h-full justify-center flex items-center">
                    <div className="lg:min-h-[300px] w-full lg:w-[600px] lg:px-0 px-6 flex flex-col gap-y-6">

                        <h1 className="lg:text-3xl text-lg lg:text-start font-bold text-neutral-700 dark:text-neutral-300">
                            {title}
                        </h1>

                        <div>
                            {'ASSIST' === 'ASSIST' && (
                                <QuestionBubble question={question.question} />
                            )}
                            <Challenge
                                options={options}
                                questionDetails={question}
                                onSelect={onSelect}
                                disabled={pending}
                                status={status}
                                selectedOption={selectedOption}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Footer
                disabled={pending}
                status={status}
                onCheck={onContinue}         // your existing "continue/check" handler
                onPrev={onPrev}              // new: create goTo(activeIndex-1)
                onNext={onNextNav}           // new: create goTo(activeIndex+1) or finish modal
                handleWatchAgain={handleWatchAgain}
                activeIndex={activeIndex}
                total={total}
                lessonId={lessonId}
            />
        </>
    );
}

export default Quiz;
