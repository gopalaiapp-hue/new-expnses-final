import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useLanguage } from "../../lib/language";

interface Slide {
    id: number;
    titleKey: string;
    descKey: string;
    icon: string;
    color: string;
}

const SLIDES: Slide[] = [
    {
        id: 1,
        titleKey: "track_together",
        descKey: "track_together_desc",
        icon: "🏠",
        color: "bg-primary/10 text-primary",
    },
    {
        id: 2,
        titleKey: "smart_budgeting",
        descKey: "smart_budgeting_desc",
        icon: "📉",
        color: "bg-green-500/10 text-green-600",
    },
    {
        id: 3,
        titleKey: "settle_debts",
        descKey: "settle_debts_desc",
        icon: "🤝",
        color: "bg-orange-500/10 text-orange-600",
    },
];

interface IntroSlideshowProps {
    onComplete: () => void;
}

export function IntroSlideshow({ onComplete }: IntroSlideshowProps) {
    const { t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <div className="w-full py-4">
            <div className="relative overflow-hidden min-h-[200px] flex flex-col items-center justify-center text-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="w-full px-4"
                    >
                        <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl ${SLIDES[currentIndex].color}`}>
                            {SLIDES[currentIndex].icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t(SLIDES[currentIndex].titleKey)}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {t(SLIDES[currentIndex].descKey)}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6 mb-6">
                {SLIDES.map((_, index) => (
                    <div
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "w-6 bg-primary" : "w-2 bg-primary/20"
                            }`}
                    />
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className={currentIndex === 0 ? "opacity-0" : "opacity-100"}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('back')}
                </Button>

                <Button onClick={handleNext} size="sm" className="px-6">
                    {currentIndex === SLIDES.length - 1 ? t('get_started') : t('next')}
                    {currentIndex !== SLIDES.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
            </div>
        </div>
    );
}
