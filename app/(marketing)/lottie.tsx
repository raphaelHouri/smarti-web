"use client";
import animationData from "@/public/duolingo.json";
// import Lottie from "lottie-react";
import dynamic from "next/dynamic";
// import Lottie from "lottie-react";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
const LottieJson = () => {
    return (
        <Lottie
            animationData={animationData}
            className="flex items-center justify-center flex-col h-40"
            loop={true}
        />);
}

export default LottieJson;