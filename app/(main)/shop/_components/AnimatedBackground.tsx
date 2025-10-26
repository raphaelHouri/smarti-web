"use client";

import { Brain, Rocket, Star, Lightbulb, Trophy, BookOpen, Sparkles, Target, Zap, Award, GraduationCap, Atom } from "lucide-react";
import { useEffect, useState } from "react";

const icons = [
    { Icon: Brain, size: 40, delay: 0, color: '#9333EA' },
    { Icon: Rocket, size: 35, delay: 0.5, color: '#3B82F6' },
    { Icon: Star, size: 30, delay: 1, color: '#F59E0B' },
    { Icon: Lightbulb, size: 40, delay: 1.5, color: '#10B981' },
    { Icon: Trophy, size: 35, delay: 2, color: '#EF4444' },
    { Icon: BookOpen, size: 30, delay: 2.5, color: '#8B5CF6' },
    { Icon: Sparkles, size: 35, delay: 3, color: '#EC4899' },
    { Icon: Target, size: 28, delay: 0.8, color: '#06B6D4' },
    { Icon: Zap, size: 32, delay: 1.3, color: '#FBBF24' },
    { Icon: Award, size: 36, delay: 1.8, color: '#F97316' },
    { Icon: GraduationCap, size: 34, delay: 2.3, color: '#6366F1' },
    { Icon: Atom, size: 38, delay: 2.8, color: '#14B8A6' },
    { Icon: Brain, size: 25, delay: 0.4, color: '#A855F7' },
    { Icon: Rocket, size: 30, delay: 1.1, color: '#60A5FA' },
    { Icon: Star, size: 28, delay: 1.7, color: '#FCD34D' },
    { Icon: Lightbulb, size: 33, delay: 2.1, color: '#34D399' },
    { Icon: Trophy, size: 29, delay: 2.6, color: '#FB7185' },
    { Icon: BookOpen, size: 32, delay: 3.2, color: '#C084FC' },
];

export const AnimatedBackground = () => {
    const [positions, setPositions] = useState<{ top: number; left: number; delay: number; rotation: number }[]>([]);

    useEffect(() => {
        // Generate random positions for icons, avoiding center horizontally
        const newPositions = icons.map(() => {
            let top, left;

            // Generate position avoiding horizontal center (middle 40% width)
            do {
                top = Math.random() * 80 + 10; // 10% to 90% of viewport height
                left = Math.random() * 85 + 7.5; // 7.5% to 92.5% of viewport width
            } while (
                left >= 30 && left <= 70 && top <= 60 // Avoid center horizontally but only in upper 60%
            );

            return {
                top,
                left,
                delay: Math.random() * 5,
                rotation: Math.random() * 360, // Random rotation for each icon
            };
        });
        setPositions(newPositions);
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {icons.map(({ Icon, size, delay, color }, index) => {
                const position = positions[index];
                if (!position) return null;

                return (
                    <div
                        key={index}
                        className="absolute animate-float-gentle opacity-15"
                        style={{
                            top: `${position.top}%`,
                            left: `${position.left}%`,
                            animationDelay: `${position.delay}s`,
                            color: color,
                            transform: `rotate(${position.rotation}deg)`,
                        }}
                    >
                        <Icon size={size} />
                    </div>
                );
            })}
        </div>
    );
};
