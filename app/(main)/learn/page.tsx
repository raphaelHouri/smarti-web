import { redirect } from "next/navigation";
import LoadingPage from "./loading";
import { getFirstCategory, getOrCreateUserFromGuest } from "@/db/queries";


const LearnPage = async () => {

    const userData = await getOrCreateUserFromGuest();


    const [user] = await Promise.all([userData]);





    if (!user || ('user' in user && !(user as any)?.user?.lessonCategoryId)) {
        const firstCategory = await getFirstCategory();
        console.log("Category not found, redirecting to courses");
        redirect(`/learn/${firstCategory?.id}`);
    }
    if (user && 'lessonCategoryId' in user && user.lessonCategoryId) {
        redirect(`/learn/${user.lessonCategoryId}`);
    }
    return <LoadingPage />

}

export default LearnPage;
