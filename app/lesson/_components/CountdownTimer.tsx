import { useCountdownStore } from "@/store/use-countdown-timer";
import { useEffect } from "react";

const CountdownTimer = ({ initialTime, onFinish }: { initialTime: number; onFinish: () => void }) => {
    const { timeLeft, isRunning, setTimeLeft, setIsRunning, resetTimer } = useCountdownStore();

    useEffect(() => {
        resetTimer(initialTime); // Initialize the timer with the given initial time
    }, [initialTime, resetTimer]);

    useEffect(() => {
        if (!isRunning) return;

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    setIsRunning(false);
                    clearInterval(timer);
                    onFinish();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, setIsRunning, onFinish, setTimeLeft, timeLeft]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className={`transition-all duration-300 ${!isRunning ? "scale-110 text-red-500" : ""}`}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
    );
};

export default CountdownTimer;