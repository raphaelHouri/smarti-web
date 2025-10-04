import { Button } from "@/components/ui/button"
import { NotebookText } from "lucide-react"
import Link from "next/link"

interface UnitBannerProps {
    title: string,
    description: string,
}

export const UnitBanner = ({
    title,
    description
}: UnitBannerProps) => {
    return (
        <div className="w-full rounded-xl bg-green-500 p-1 text-white
        flex flex-col items-start space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-5 dark:text-slate-700">
            <div className="space-y-1 sm:space-y-2.5">
                <h3 className="text-lg font-bold tracking-wide sm:text-2xl">{title}</h3>
                <p className="text-sm sm:text-lg">{description}</p>
            </div>
            <Link href="/lesson">
                <Button
                    size="sm"
                    variant="secondary"
                    className="border border-b-2 dark:border-b-2 dark:border-slate-700 active:border-b-2 hidden sm:flex sm:size-lg sm:border-b-4"
                >
                    <NotebookText className="mr-2 sm:mr-4" />
                    Continue
                </Button>
            </Link>
        </div>
    )
}