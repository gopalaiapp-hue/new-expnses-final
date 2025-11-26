import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { motion } from "motion/react";
import { Sparkles, Users, Wallet } from "lucide-react";
import { IntroSlideshow } from "./IntroSlideshow";
import { useLanguage } from "../../lib/language";

interface WelcomeProps {
  onCreateFamily: () => void;
  onJoinFamily: () => void;
}

export function Welcome({ onCreateFamily, onJoinFamily }: WelcomeProps) {
  const { t } = useLanguage();
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-tertiary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="elevation-4 overflow-hidden border-2 border-outline-variant/50">
          <CardHeader className="text-center pb-6 pt-8 bg-gradient-to-b from-primary-container/20 to-transparent">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-7xl mb-4"
            >
              💰
            </motion.div>
            <CardTitle className="text-3xl">{t('welcome_title')}</CardTitle>
            <CardDescription className="mt-3 text-base">
              {t('welcome_desc')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2 pb-8">
            {/* Intro Slideshow or Options */}
            {!showOptions ? (
              <IntroSlideshow onComplete={() => setShowOptions(true)} />
            ) : (
              <div className="pt-4 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Button
                    onClick={onCreateFamily}
                    className="w-full h-14 bg-primary hover:bg-primary/90 elevation-2 hover:elevation-3 transition-all duration-200 rounded-xl"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    {t('create_family')}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    onClick={onJoinFamily}
                    variant="outline"
                    className="w-full h-14 border-2 border-primary/20 hover:bg-primary/5 transition-all duration-200 rounded-xl"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    {t('join_family')}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOptions(false)}
                    className="w-full text-muted-foreground"
                  >
                    Back to Intro
                  </Button>
                </motion.div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {t('offline_first')}
        </p>
      </motion.div>
    </div>
  );
}
