"use client"

import { cn } from "@/lib/utils";
import { useState, useTransition, useEffect, useMemo, useCallback, useLayoutEffect } from "react";
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'
import Header from "./Header";
import QuestionBubble from "./QuestionBubble";
import Challenge from "./ChallengeOpt";
import Footer from "./Footer";
import { toast } from "sonner";
import { useAudio, useMedia, useMount } from "react-use";
import ResultCard from "./result-card";
import { useRouter } from "next/navigation";
import { useHeartsModal } from "@/store/use-hearts";
import { usePracticeModal } from "@/store/use-practice-modal";
import CelebrateJson from "./lottie";
import { lessonQuestionGroups, questions } from "@/db/schemaSmarti";
import { z } from "zod";
import { useFinishLessonModal } from "@/store/use-finish-lesson-modal";
import { useRegisterModal } from "@/store/use-register-modal";
import { useAuth } from "@clerk/nextjs";
import { addResultsToUser, getOrCreateUserFromGuest, removeQuestionsWrongByQuestionId } from "@/db/queries";
import { Button } from "@/components/ui/button";
import CountdownTimer from "./CountdownTimer";
import { ChevronDown, ChevronUp } from "lucide-react";

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
    questionGroups: (typeof lessonQuestionGroups.$inferSelect & { categoryType: string, categoryId: string })[],
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
    const [status, setStatus] = useState<"correct" | "wrong" | "none">("none")
    const [resultList, setResultList] = useState<Array<"a" | "b" | "c" | "d" | null>>(questionGroups.flatMap(categoryValue => categoryValue.questionList.map(() => null)));
    const [selectedOption, setSelectedOption] = useState<"a" | "b" | "c" | "d" | null>()
    const [pending, startTransition] = useTransition();
    const [guest, setGuest] = useState(false);
    const [lessonId] = useState(initialLessonId)
    const [activeIndex, setActiveIndex] = useState(0)
    const [mode, setMode] = useState<"quiz" | "review" | "summary" | "practiceMode">("quiz")
    const [isExpanded, setIsExpanded] = useState(true)
    const { userId } = useAuth();
    const [startAt, setStartAt] = useState<Date | null>(null);
    const isMobile = useMedia("(max-width:1024px)");
    const isReallyMobile = useMedia("(max-width:640px)");
    const questionsMap = questionGroups.flatMap((categoryValue, index1) =>
        categoryValue.questionList.map((questionValue, index2) => ({
            placeY: index1,
            placeX: index2,
            category: categoryValue.categoryId,
            questionId: questionValue
        }))
    );

    const router = useRouter();
    if (!questionsMap || questionsMap.length === 0) {
        return <p>אין תרגילים להצגה</p>;
    }

    // ---- CURRENT QUESTION ----
    const total = questionsMap.length;
    const currentQuestion = questionsMap[activeIndex];
    const question = questionsDict[currentQuestion.questionId];
    if (!question) return <p>השאלה לא נמצאה</p>;

    const options = optionsSchema.parse(question.options);
    if (!options) return <p>אפשרויות התשובה אינן קיימות</p>

    const { open: OpenHeartsModal } = useHeartsModal();
    const { open: OpenFinishLessonModal, isApproved: isFinishApproved, clearApprove, approve } = useFinishLessonModal();
    const { open: OpenPracticeModal, isOpen, close } = usePracticeModal();
    const { open: OpenRegisterModal } = useRegisterModal();
    useLayoutEffect(() => {
        if (lessonId == 'practiceMode') {
            setMode("practiceMode")
        }
    }, []);
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
                await addResultsToUser(lessonId, userId, resultList, questionsMap.map(q => q.questionId), startAt);
                setMode("summary");
                clearApprove();
            }
            if (isFinishApproved && !userId) {
                setMode("summary");
                clearApprove();
            }
        };
        handleFinishApproval();
    }, [isFinishApproved]);
    useEffect(() => {
        const handleUserEffect = async () => {
            if (userId && guest) {
                // createUser
                await getOrCreateUserFromGuest(initialLessonId);
                await addResultsToUser(lessonId, userId, resultList, questionsMap.map(q => q.questionId), startAt);
                setGuest(false);

            } else {
                setGuest(true);
            }
        };
        handleUserEffect();
    }, [userId]);
    const progressPct = useMemo(
        () => {
            return ((activeIndex + (!!selectedOption ? 1 : 0)) / total) * 100
        },
        [activeIndex, total, selectedOption]
    );
    const totalTime = useMemo(() => {
        if (mode !== "quiz") return null; // Only calculate in quiz mode
        return questionGroups.reduce((total, group) => total + group.time, 0);
    }, [mode, questionGroups]);

    // Reset expanded state when question changes
    useEffect(() => {
        setIsExpanded(false);
    }, [activeIndex]);

    const goTo = (idx: number) => {
        setStatus("none");
        setSelectedOption(resultList[idx] ? resultList[idx] : undefined);
        if (idx < 0 || idx >= total) return;
        setActiveIndex(idx);
    };

    const onPrev = async () => {
        if (mode == "practiceMode") {
            const wrongQuestionId = questionsMap[activeIndex].questionId;
            // Assuming you have a function to remove a question from the wrongQuestion db
            await removeQuestionsWrongByQuestionId(wrongQuestionId)
            if (activeIndex == total - 1) {
                router.push(`/practice`)
            }
            onNextNav();
        };
        goTo(activeIndex - 1);
    };
    const onNextNav = () => {
        if (activeIndex < total - 1) {
            goTo(activeIndex + 1);
        } else {
            if (mode === "review") setMode("summary");
            if (mode === "practiceMode") OpenPracticeModal();
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
        router.push(`/learn`)
    }

    const { width, height } = useWindowSize();

    // Responsive: 2-cols on mobile (<640px), 3-cols for tablets (<1024px), 5-cols for desktop
    const getGridCols = () => {
        if (isReallyMobile) return "grid-cols-5";
        if (isMobile) return "grid-cols-5";
        return "grid-cols-5";
    };

    const renderResultGrid = () => {
        if (lessonId === "practiceMode") return null;

        return (
            <div
                className={cn(
                    "w-full p-4 lg:p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10 shadow-xl",
                    "sm:max-w-md mx-auto", // center + limit on mobile/tablet
                )}
            >
                {questionGroups.map((categoryValue, categoryIndex) => (
                    <div key={categoryIndex} className="mb-6">
                        <h3 className={cn(
                            "text-base lg:text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2 lg:mb-4"
                        )}>
                            {categoryValue.categoryType}
                        </h3>
                        <div className={`grid gap-2 lg:gap-4 ${getGridCols()}`}>
                            {categoryValue.questionList.map((_, questionIndex) => {
                                const index = categoryValue.questionList
                                    .slice(0, questionIndex + 1)
                                    .reduce((acc, _, i) => acc + (i === 0 ? 0 : 1), 0) +
                                    questionGroups
                                        .slice(0, categoryIndex)
                                        .reduce((acc, group) => acc + group.questionList.length, 0);
                                const result = resultList[index];
                                const isAnswered = result !== null;
                                const isCurrent = index === activeIndex;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            if (mode === "quiz") {
                                                goTo(index);
                                            } else if (!userId) {
                                                OpenRegisterModal();
                                            } else {
                                                setMode("review");
                                                goTo(index);
                                            }
                                        }}
                                        className={cn(
                                            "relative group flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all duration-300 hover:scale-105",
                                            isCurrent
                                                ? "border-2 border-slate-500 shadow-lg z-10"
                                                : "border border-transparent",
                                            mode === "quiz"
                                                ? isAnswered
                                                    ? 'bg-sky-500/20 hover:bg-sky-500/40'
                                                    : 'bg-gray-500/10 hover:bg-gray-500/20'
                                                : result
                                                    ? result === "a"
                                                        ? 'bg-green-500/10 hover:bg-green-500/20'
                                                        : 'bg-red-500/10 hover:bg-red-500/20'
                                                    : 'bg-red-500/10 hover:bg-red-500/20',
                                            "min-h-[38px] sm:min-h-[38px] min-w-[38px] sm:min-w-[38px] text-base sm:text-base"
                                        )}
                                        style={{
                                            fontSize: isReallyMobile ? "0.95rem" : undefined,
                                            minWidth: isReallyMobile ? 34 : 38,
                                            minHeight: isReallyMobile ? 34 : 38,
                                            padding: isReallyMobile ? "0.15rem 0.25rem" : undefined,
                                        }}
                                    >
                                        <span className="text-sm font-medium">
                                            {index + 1}
                                        </span>
                                        {mode !== "quiz" && result && (
                                            <span
                                                className={cn(
                                                    "text-xl",
                                                    result === "a" ? "text-green-400" : "text-red-400"
                                                )}
                                            >
                                                {result === "a" ? '✓' : '✗'}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
                <p className="text-center text-xs lg:text-sm text-neutral-400 dark:text-neutral-500 mt-2">
                    הקישו על מספר שאלה כדי {mode === "quiz" ? "לנווט" : "לסקור את תשובתכם"}
                </p>
                {mode === "review" ? (
                    <div className="flex justify-center pt-2">
                        <Button
                            className="w-full lg:w-auto text-xs sm:text-sm"
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
                <div className="flex flex-col gap-y-8 items-center justify-center h-full max-w-xl mx-auto px-2 sm:px-4">
                    <CelebrateJson />
                    <div className="space-y-4 text-center animate-fade-in pt-12 sm:pt-20">
                        <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                            עבודה מצוינת! 🎉
                        </h1>
                        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300">
                            השלמתם את השיעור בהצלחה
                        </p>
                    </div>
                    <div className="flex flex-row items-center  sm:gap-x-6 gap-x-3 w-full max-w-xs sm:max-w-md">
                        <ResultCard
                            variant="points"
                            value={resultList.reduce((acc, answer) => acc + (answer === 'a' || answer != null ? 10 : 0), 0)}
                        />
                        <ResultCard
                            variant="hearts"
                            value={resultList.reduce((acc, answer, index) => acc + (answer === 'a' ? (index <= 1 ? 5 : 5 + Math.round(acc / 3)) : 0), 0)}
                        />
                    </div>
                    <div className="mb-2">
                        {renderResultGrid()}
                    </div>
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
            {totalTime && (
                <div className="w-full flex justify-center">
                    <div className="relative px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm">
                        <CountdownTimer
                            initialTime={totalTime}
                            onFinish={() => {
                                OpenFinishLessonModal();
                            }}
                        />
                    </div>
                </div>
            )}
            <div className="flex-1">
                <div className="h-full justify-center flex items-center">
                    <div className="lg:min-h-[300px] w-full lg:w-[1200px] lg:px-0 px-2 sm:px-6 flex flex-col gap-y-6">

                        {/* Side result grid – mobile position change */}
                        <div className="block md:hidden mb-2">
                            {/* Mobile: show the grid above the question */}
                            {mode !== "practiceMode" && renderResultGrid()}
                        </div>
                        <div className="hidden md:block absolute right-2 lg:right-6 top-1/4 transform -translate-y-1/2 w-[150px] sm:w-[220px] lg:w-[300px]">
                            <div className="w-full mx-auto">
                                {mode !== "practiceMode" && renderResultGrid()}
                            </div>
                        </div>

                        <div>
                            {/* Show COMPREHENSION content in box with expand/collapse */}
                            {question.format === "COMPREHENSION" && question.content && (
                                <div className="flex flex-col justify-center w-full mb-6 sm:mb-8 gap-2">
                                    <div className="flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsExpanded(!isExpanded)}
                                            className="text-xs sm:text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
                                        >
                                            {isExpanded ? (
                                                <>
                                                    הציגו פחות
                                                    <ChevronUp className="inline ml-1 align-middle w-4 h-4 text-sky-700 dark:text-sky-300" />
                                                </>
                                            ) : (
                                                <>
                                                    הציגו הכל
                                                    <ChevronDown className="inline ml-1 align-middle w-4 h-4 text-sky-700 dark:text-sky-300" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <div className="flex justify-center w-full">
                                        <div
                                            className="relative bg-gradient-to-tr from-white via-sky-50 to-blue-50 dark:from-[#12131a] dark:via-[#182446] dark:to-[#222c40] border border-sky-100 dark:border-sky-800 rounded-2xl lg:rounded-3xl shadow-xl w-full flex gap-3 lg:gap-6 items-start px-2 py-2 sm:px-4 sm:py-3 lg:px-7 lg:py-6 overflow-y-auto"
                                            style={{
                                                transition: "max-height 0.3s ease-in-out",
                                                maxHeight: isExpanded ? "" : "200px"
                                            }}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="whitespace-pre-line font-normal text-base sm:text-lg tracking-wide text-neutral-900 dark:text-neutral-100" style={{ lineHeight: 1.65 }}>
                                                    {question.content}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Show SHAPES type question as image centered above the question from bucket */}
                            {question.format === "SHAPES" && question.content && (
                                <div className="flex flex-col items-center justify-center w-full mb-6 sm:mb-8 gap-2">
                                    <div className="flex justify-center">
                                        <img
                                            src={question.content}
                                            alt="שאלת צורות"
                                            className="max-h-40 sm:max-h-52 lg:max-h-64 max-w-full object-contain rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-md bg-white dark:bg-neutral-900"
                                        />
                                    </div>
                                </div>
                            )}

                            <h1 className="lg:text-3xl text-lg lg:text-start font-bold text-neutral-700 dark:text-neutral-300 mb-3 sm:mb-4">
                                <QuestionBubble question={question.question} />
                            </h1>

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
                onCheck={onContinue}
                onPrev={onPrev}
                onNext={onNextNav}
                handleWatchAgain={handleWatchAgain}
                activeIndex={activeIndex}
                total={total}
            />
        </>
    );
}

export default Quiz;
