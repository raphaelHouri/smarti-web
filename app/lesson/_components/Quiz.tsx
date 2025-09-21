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
import { useAudio, useMedia, useMount } from "react-use";
import ResultCard from "./result-card";
import { useRouter } from "next/navigation";
import { useHeartsModal } from "@/store/use-hearts";
import { usePracticeModal } from "@/store/use-practice-modal";
import CelebrateJson from "./lottie";
import { lessonQuestionGroups, questions } from "@/db/schemaSmarti";
import { date, set, z } from "zod";
import { useFinishLessonModal } from "@/store/use-finish-lesson-modal";
import { useRegisterModal } from "@/store/use-register-modal";
import { useAuth, useClerk } from "@clerk/nextjs";
import { addResultsToUser, getOrCreateUserFromGuest } from "@/db/queries";
import { Button } from "@/components/ui/button";

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
    userPreviousAnswers: ("a" | "b" | "c" | "d" | null)[] | null;
}

const Quiz = ({
    initialLessonId,
    initialHearts,
    questionGroups,
    questionsDict,
    userPreviousAnswers = null
}: QuizProps) => {
    const [hearts, setHearts] = useState(initialHearts);
    const [challenges] = useState(questionGroups[0]);
    const [status, setStatus] = useState<"correct" | "wrong" | "none">("none")
    const [resultList, setResultList] = useState<Array<"a" | "b" | "c" | "d" | null>>(Array(questionGroups[0].questionList.length).fill(null));
    const [selectedOption, setSelectedOption] = useState<"a" | "b" | "c" | "d" | null>()
    const [pending, startTransition] = useTransition();
    const [guest, setGuest] = useState(false);
    const [lessonId] = useState(initialLessonId)
    const [activeIndex, setActiveIndex] = useState(0)
    const [mode, setMode] = useState<"quiz" | "review" | "summary">("quiz")
    const { userId } = useAuth();
    const [startAt, setStartAt] = useState<Date | null>(null);
    const isMobile = useMedia("(max-width:1024px)");

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
    const { open: OpenFinishLessonModal, isApproved: isFinishApproved, clearApprove, approve } = useFinishLessonModal();
    const { open: OpenRegisterModal, } = useRegisterModal();

    useMount(() => {
        if (userPreviousAnswers) {
            setMode("summary")
            setResultList([...userPreviousAnswers])
        }
        const initialPercentage = Math.floor(Math.random() * 101)
        if (true || initialPercentage === 100) {
            // OpenPracticeModal();
        }
        setStartAt(new Date());
    })
    useEffect(() => {
        const handleFinishApproval = async () => {
            if (isFinishApproved && userId) {
                await addResultsToUser(lessonId, userId, resultList, challenges.questionList, startAt);
                setMode("summary");
                clearApprove();
            }
        };
        handleFinishApproval();
    }, [isFinishApproved]);
    useEffect(() => {
        const handleUserEffect = async () => {
            if (userId && guest) {
                // need to save the resultList
                console.log(resultList);
                // createUser
                await getOrCreateUserFromGuest(initialLessonId);
                await addResultsToUser(lessonId, userId, resultList, challenges.questionList, startAt);
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

        if (activeIndex < total - 1) {

            goTo(activeIndex + 1);
        } else {
            if (mode === "review") setMode("summary");
            else OpenFinishLessonModal();
        }
    };


    const handleWatchAgain = async () => {
        if (mode === "review") {
            setMode("summary");
        }
        if (!userId) {
            OpenRegisterModal();
        } else {
            setMode("review");
            goTo(0);
        }

    }

    const handlePracticeAgain = () => {
        if (!userId) {
            OpenRegisterModal()

        } else {
            setMode("quiz");
            setResultList(Array(total).fill(null));
            setStatus("none");
            setSelectedOption(null);
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

    const renderResultGrid = () => {
        return (
            <div className="w-full p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
                <div className="grid grid-cols-5 gap-4 mb-6">
                    {resultList.map((result, index) => {
                        const isAnswered = result !== null;
                        return (
                            <button
                                key={index}
                                onClick={() => {
                                    if (mode === "quiz") {
                                        goTo(index);
                                    } else {
                                        setMode("review");
                                        goTo(index);
                                    }
                                }}
                                className={`relative group flex flex-col items-center justify-center px-3 py-1 rounded-xl
                                    transition-all duration-300 hover:scale-110
                                    ${mode === "quiz"
                                        ? isAnswered
                                            ? 'bg-sky-500/20 hover:bg-sky-500/40 border-sky-500/60 border-1'
                                            : 'bg-gray-500/10 hover:bg-gray-500/20'
                                        : result
                                            ? result === "a"
                                                ? 'bg-green-500/10 hover:bg-green-500/20'
                                                : 'bg-red-500/10 hover:bg-red-500/20'
                                            : 'bg-red-500/10 hover:bg-red-500/20'
                                    }
                                `}
                            >
                                <span className="text-sm font-medium">
                                    {index + 1}
                                </span>
                                {mode !== "quiz" && result && (
                                    <span
                                        className={`text-xl ${result === "a"
                                            ? 'text-green-400'
                                            : 'text-red-400'
                                            }`}
                                    >
                                        {result === "a" ? '✓' : '✗'}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
                <p className="text-center text-sm text-neutral-400 dark:text-neutral-500">
                    Tap any question number to {mode === "quiz" ? "navigate" : "review your answer"}
                </p>
                {mode === "review" ? (
                    <div className="flex justify-center pt-2">
                        <Button
                            className="w-full lg:w-auto"
                            onClick={() => router.back()}
                            size={isMobile ? "sm" : "lg"}
                            variant="secondary"
                        >
                            חזור לדף התרגול
                        </Button>
                    </div>
                ) : null}
            </div>
        );
    };

    // ---- FINISH SCREEN ----
    // FIX LETTER ACTIVE = 0
    if (mode === "summary") {
        return (
            <>
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={1000}
                    tweenDuration={10000}
                />
                <div className="flex flex-col gap-y-8 items-center justify-center h-full max-w-xl mx-auto px-4">
                    <CelebrateJson />
                    <div className="space-y-4 text-center animate-fade-in">
                        <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                            Fantastic Work! 🎉
                        </h1>
                        <p className="text-lg text-neutral-600 dark:text-neutral-300">
                            You've mastered this lesson
                        </p>
                    </div>,,
                    <div className="flex items-center gap-x-6 w-full max-w-md">
                        <ResultCard
                            variant="points"
                            value={resultList.reduce((acc, answer) => acc + (answer === 'a' || answer != null ? 10 : 0), 0)}
                        />
                        <ResultCard
                            variant="hearts"
                            value={resultList.reduce((acc, answer, index) => acc + (answer === 'a' ? (index <= 1 ? 5 : 5 + Math.round(acc / 3)) : 0), 0)}
                        />
                    </div>
                    {renderResultGrid()}
                </div>
                <Footer
                    mode={mode}
                    status="completed"
                    onCheck={onCheck}
                    handleWatchAgain={handleWatchAgain}
                    handlePracticeAgain={handlePracticeAgain}
                />
            </>
        )
    }

    const title = question.question

    const onSelect = (option: "a" | "b" | "c" | "d") => {
        if (mode === "review") {
            toast.info("הינך במצב צפייה, לא ניתן לבצע פעולות נוספות");
            return;
        }
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

                        {/* {mode === "review" && ( */}
                        <div className="hidden md:block absolute right-6 top-1/4 transform -translate-y-1/2 w-[300px]">
                            <div className="w-full mx-auto">
                                {renderResultGrid()}
                            </div>
                        </div>
                        {/* )} */}

                        <div>
                            {'ASSIST' === 'ASSIST' && (
                                <QuestionBubble question={question.question} />
                            )}
                            <Challenge
                                mode={mode}
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
                mode={mode}
                disabled={pending}
                status={status}
                onCheck={onContinue}         // your existing "continue/check" handler
                onPrev={onPrev}              // new: create goTo(activeIndex-1)
                onNext={onNextNav}           // new: create goTo(activeIndex+1) or finish modal
                handleWatchAgain={handleWatchAgain}
                activeIndex={activeIndex}
                total={total}
            />
        </>
    );
}

export default Quiz;
