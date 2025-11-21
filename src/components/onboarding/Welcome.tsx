import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { motion } from "motion/react";
import { Sparkles, Users, Wallet } from "lucide-react";

interface WelcomeProps {
  onCreateFamily: () => void;
  onJoinFamily: () => void;
}

export function Welcome({ onCreateFamily, onJoinFamily }: WelcomeProps) {
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
            <CardTitle className="text-3xl">KharchaPal</CardTitle>
            <CardDescription className="mt-3 text-base">
              Your simple household expense tracker for the whole family
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-2 pb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button 
                onClick={onCreateFamily} 
                className="w-full h-14 bg-primary hover:bg-primary/90 elevation-2 hover:elevation-3 transition-all duration-200 rounded-xl"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                I'm Family Head - Create Family
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                variant="outline"
                className="w-full h-14 border-2 border-outline/50 bg-surface-variant/20 transition-all duration-200 rounded-xl cursor-not-allowed opacity-60"
              >
                <Users className="h-5 w-5 mr-2" />
                Join Family - Coming Soon
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="pt-8 space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary-container/20 border border-primary/10">
                  <span className="inline-flex p-2 rounded-full bg-primary/10 shrink-0">
                    <Wallet className="h-4 w-4 text-primary" />
                  </span>
                  <p className="text-sm text-on-surface">
                    Track expenses & income together with your family
                  </p>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-tertiary-container/20 border border-tertiary/10">
                  <span className="inline-flex p-2 rounded-full bg-tertiary/10 shrink-0 text-sm">
                    💳
                  </span>
                  <p className="text-sm text-on-surface">
                    Split payments across UPI, Cash & Card
                  </p>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary-container/20 border border-secondary/10">
                  <span className="inline-flex p-2 rounded-full bg-secondary/10 shrink-0 text-sm">
                    🤝
                  </span>
                  <p className="text-sm text-on-surface">
                    Manage IOUs and set budgets
                  </p>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground mt-6">
          Offline-first • Privacy-focused • Made for Indian families
        </p>
      </motion.div>
    </div>
  );
}
