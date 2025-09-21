"use client";


import { CardPage } from "./card";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateUserCategory } from "@/actions/user-progress";
import { toast } from "sonner";
import { lessonCategory, users } from "@/db/schemaSmarti";

interface ListProps {
    lessonCategories: typeof lessonCategory.$inferSelect[];
    lessonCategoryId?: typeof users.$inferSelect.lessonCategoryId,
}


export const List = ({
    lessonCategories,
    lessonCategoryId,
}: ListProps) => {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const onClick = (id: string) => {
        if (pending) return;
        //suppose ID is already active then we throw to existing learn page
        if (id === lessonCategoryId) {
            return router.push(`/learn/${id}`);
        }
        startTransition(() => {
            updateUserCategory(id).
                catch(() => toast.error("Something went wrong"))
        })
    }

    return (
        <div className="pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
            {lessonCategories.map((lessonCategory) => (
                <CardPage
                    key={lessonCategory.id}
                    id={lessonCategory.id}
                    title={lessonCategory.categoryType}
                    imageSrc={lessonCategory.imageSrc}
                    disabled={pending}
                    onClick={onClick}
                    active={lessonCategory.id === lessonCategoryId}
                />
            ))}
        </div>
    )
}