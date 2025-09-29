"use client";
import animationData from "@/public/profile_setup.json";
import Lottie from "lottie-react";
const SettingsAnimation = () => {
    return (
        <Lottie
            animationData={animationData}
            className="flex items-center justify-center flex-col h-52 -mt-6 -mb-12"
            loop={true}
        />);
}

export default SettingsAnimation;