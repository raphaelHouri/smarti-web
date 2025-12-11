"use client";


import { CardPage } from "./card";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { updateUserCategory } from "@/actions/user-progress";
import { toast } from "sonner";
import { lessonCategory, users } from "@/db/schemaSmarti";

interface ListProps {
    lessonCategories: typeof lessonCategory.$inferSelect[];
    lessonCategoryId?: string | null,
}


export const List = ({
    lessonCategories,
    lessonCategoryId,
}: ListProps) => {
    const router = useRouter();
    const pathname = usePathname();

    // Robustly extract `/learn/<id>` from the current path, if prop not given
    lessonCategoryId = useMemo(() => {
        if (lessonCategoryId) return lessonCategoryId;
        const m = pathname.match(/^\/learn\/([^\/?#]+)/);
        return m?.[1]; // undefined if not on /learn/<id>
    }, [lessonCategoryId, pathname]);
    const [pending, startTransition] = useTransition();
    const onClick = (id: string) => {
        if (pending) return;
        //suppose ID is already active then we throw to existing learn page
        if (id === lessonCategoryId) {
            return router.push(`/learn/${id}`);
        }
        startTransition(() => {
            updateUserCategory(id).
                catch((error) => {
                    if (typeof error?.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) return;
                    toast.error("Error updating user category:", error);
                    // toast.error("Something went wrong1");
                });
        });
    }

    return (
        <div className="pt-1 grid sm:grid-cols-2  2xl:grid-cols-4 3xl:grid-cols-4  gap-1 sm:mb-6 mb-4">
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