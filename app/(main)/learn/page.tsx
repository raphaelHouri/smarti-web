import { redirect } from "next/navigation";
import LoadingPage from "./loading";
import { getFirstCategory, getUser } from "@/db/queries";


const LearnPage = async () => {

    const userData = getUser();


    const [user] = await Promise.all([userData]);





    if (!user || ('user' in user && !(user as any)?.user?.lessonCategoryId)) {
        console.log("Category not found, redirecting to courses");
        redirect("/courses");
    }
    if (user && 'lessonCategoryId' in user && user.lessonCategoryId) {
        redirect(`/learn/${user.lessonCategoryId}`);
    }
    return <LoadingPage />

}

export default LearnPage;
