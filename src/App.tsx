import { useState, useEffect } from "react";
import { AppProvider, useApp } from "./lib/store";
import { Welcome } from "./components/onboarding/Welcome";
import { CreateFamily } from "./components/onboarding/CreateFamily";
import { JoinFamily } from "./components/onboarding/JoinFamily";
import { MainDashboard } from "./components/MainDashboard";
import { Toaster } from "./components/ui/sonner";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import { EdgeToEdge } from "@capawesome/capacitor-android-edge-to-edge-support";
import { LanguageProvider } from "./lib/language";

type OnboardingView = "welcome" | "create" | "join";

function AppContent() {
  const { currentUser, currentFamily, isLoading } = useApp();
  const [onboardingView, setOnboardingView] = useState<OnboardingView>("welcome");
  const [showTimeout, setShowTimeout] = useState(false);

  // Configure StatusBar for mobile devices
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Light });
      StatusBar.setBackgroundColor({ color: '#4F46E5' }); // Match primary color
      StatusBar.show();
    }
  }, []);

  // Configure EdgeToEdge for Android 15+
  useEffect(() => {
    const configureEdgeToEdge = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const { osVersion } = await Device.getInfo();
          if (+osVersion >= 15) {
            await EdgeToEdge.enable();
          }
        } catch (error) {
          console.warn('EdgeToEdge not supported or failed to enable:', error);
        }
      }
    };
    configureEdgeToEdge();
  }, []);

  // Show timeout message if loading takes too long
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, 5000); // Show help after 5 seconds

      return () => clearTimeout(timer);
    } else {
      setShowTimeout(false);
    }
  }, [isLoading]);

  const handleReset = () => {
    if (confirm("This will clear all app data and reload the page. Continue?")) {
      indexedDB.deleteDatabase("KharchaPalDB");
      localStorage.clear();
      window.location.reload();
    }
  };

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-tertiary/5 p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center p-6 rounded-full bg-primary-container/30 mb-6">
            <div className="text-7xl animate-pulse">💰</div>
          </div>
          <h2 className="text-2xl mb-2 text-primary">KharchaPal</h2>
          <p className="text-muted-foreground mb-4">Loading your expenses...</p>
          <div className="w-48 h-1 bg-surface-variant rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
          </div>
          {showTimeout && (
            <div className="mt-8 p-6 bg-error-container/20 border-2 border-destructive/20 rounded-xl elevation-2">
              <p className="text-sm mb-4 text-on-error-container">Taking longer than usual?</p>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition-all duration-200 elevation-1 hover:elevation-2"
              >
                Reset App Data
              </button>
              <p className="text-xs text-muted-foreground mt-4">
                Check the console (F12) for error details
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If user is logged in, show main dashboard
  if (currentUser && currentFamily) {
    return <MainDashboard />;
  }

  // Otherwise show onboarding flow
  return (
    <>
      {onboardingView === "welcome" && (
        <Welcome
          onCreateFamily={() => setOnboardingView("create")}
          onJoinFamily={() => setOnboardingView("join")}
        />
      )}

      {onboardingView === "create" && (
        <CreateFamily onComplete={() => { }} onBack={() => setOnboardingView("welcome")} />
      )}

      {onboardingView === "join" && (
        <JoinFamily
          onComplete={() => { }}
          onBack={() => setOnboardingView("welcome")}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <LanguageProvider>
        <AppContent />
        <Toaster position="top-center" />
      </LanguageProvider>
    </AppProvider>
  );
}
