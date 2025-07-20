"use client";
import animationData from "@/public/duo.json";
import dynamic from "next/dynamic";
// import Lottie from "lottie-react";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
const DuoLottie = () => {
    return (
        <Lottie
            animationData={animationData}
            className="h-20 flex items-center"
            loop={true}
        />);
}

export default DuoLottie;