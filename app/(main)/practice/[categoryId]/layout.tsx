import FeedWrapper from "@/components/FeedWrapper";

interface PracticeProps {
    children: React.ReactNode;
}

const PracticeLayout = ({
    children
}: PracticeProps) => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col h-full w-full">
                <FeedWrapper>
                    <div className="w-full flex flex-col items-center">
                        <h1 className="text-center font-bold text-neutral-800 dark:text-slate-200 text-2xl my-6">
                            Practice Makes Perfect! 🏋️‍♂️
                        </h1>
                        <p className="text-muted-foreground text-center text-lg mb-4">
                            Review and re-attempt questions you got wrong.
                        </p>
                    </div>
                </FeedWrapper>
                {children}
            </div>
        </div>
    );
}


export default PracticeLayout;