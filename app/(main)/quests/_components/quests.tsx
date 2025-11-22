"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { quests } from "@/constants";
import { Progress } from "@/components/ui/progress";
import { useRegisterModal } from "@/store/use-register-modal";
import { useAuth } from "@clerk/nextjs";
import QuestIcon from "@/components/QuestIcon";

type Props = {
    experience: number
}

const QuestsSection = ({ experience }: Props) => {
    const { open: OpenRegisterModal } = useRegisterModal();
    const { userId } = useAuth();


    return (
        <div className="border-2 rounded-xl p-4 pb-4 mb-6 space-y-4 ">
            <div className="flex items-center justify-between
            w-full space-y-2">
                <h3 className="text-lg font-bold">
                    שלבים
                </h3>
                {!userId ? (
                    <Button
                        onClick={OpenRegisterModal}
                        variant="primaryOutline"
                        size="sm"
                        className="mb-2"
                    >
                        צפייה                    </Button>
                ) : <Link href="/quests">
                    <Button
                        variant="primaryOutline"
                        size="sm"
                        className="mb-2"
                    >
                        צפייה
                    </Button>
                </Link>}

            </div>
            <ul className="w=full">
                <Link href="/learn">
                    {quests.map((quest) => {
                        const progress = (experience / quest.value) * 100;
                        return (
                            <div key={quest.title}
                                className="w-full flex items-center p-4 gap-x-4 border-t-2"
                            >
                                <QuestIcon
                                    animationPath={quest.animation}
                                    width={40}
                                    height={40}
                                />
                                <div className="flex flex-col gap-y-2 w-full">
                                    <p className="font-bold text-lg text-neutral-700 dark:text-slate-200">
                                        {quest.title} ⭐️
                                    </p>
                                    <Progress value={progress} className="h-3" />
                                </div>
                            </div>
                        )
                    })}
                </Link>
            </ul>
        </div>
    );
}

export default QuestsSection;