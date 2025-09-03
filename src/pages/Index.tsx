import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { Navigation } from "@/components/Layout/Navigation";
import { DashboardView } from "@/components/Dashboard/DashboardView";
import { IncidentsView } from "@/components/Incidents/IncidentsView";

// Mock user data - in production this would come from authentication
const mockUser = {
  name: "Incident Commander",
  role: "Incident Commander", 
  sites: ["NGL", "COT", "YRD", "BP", "HUB", "YST"]
};

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isArabic, setIsArabic] = useState(false);

  const handleLanguageToggle = () => {
    setIsArabic(!isArabic);
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardView isArabic={isArabic} />;
      case 'incidents':
        return <IncidentsView isArabic={isArabic} />;
      case 'tasks':
        return (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {isArabic ? "المهام والإجراءات" : "Tasks & SOPs"}
            </h2>
            <p className="text-muted-foreground">
              {isArabic ? "قريباً..." : "Coming soon..."}
            </p>
          </div>
        );
      case 'comms':
        return (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {isArabic ? "مركز الاتصالات" : "Communications Hub"}
            </h2>
            <p className="text-muted-foreground">
              {isArabic ? "قريباً..." : "Coming soon..."}
            </p>
          </div>
        );
      case 'situational':
        return (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {isArabic ? "الوعي الموقفي" : "Situational Awareness"}
            </h2>
            <p className="text-muted-foreground">
              {isArabic ? "قريباً..." : "Coming soon..."}
            </p>
          </div>
        );
      case 'dispatch':
        return (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {isArabic ? "الإرسال والموارد" : "Dispatch & Resources"}
            </h2>
            <p className="text-muted-foreground">
              {isArabic ? "قريباً..." : "Coming soon..."}
            </p>
          </div>
        );
      case 'access':
        return (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {isArabic ? "الوصول والمحيط" : "Access & Perimeter"}
            </h2>
            <p className="text-muted-foreground">
              {isArabic ? "قريباً..." : "Coming soon..."}
            </p>
          </div>
        );
      case 'muster':
        return (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {isArabic ? "التجمع والعدد" : "Muster & Headcount"}
            </h2>
            <p className="text-muted-foreground">
              {isArabic ? "قريباً..." : "Coming soon..."}
            </p>
          </div>
        );
      case 'reporting':
        return (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {isArabic ? "التقارير والمراجعة" : "Reporting & AAR"}
            </h2>
            <p className="text-muted-foreground">
              {isArabic ? "قريباً..." : "Coming soon..."}
            </p>
          </div>
        );
      case 'admin':
        return (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {isArabic ? "الإدارة" : "Administration"}
            </h2>
            <p className="text-muted-foreground">
              {isArabic ? "قريباً..." : "Coming soon..."}
            </p>
          </div>
        );
      default:
        return <DashboardView isArabic={isArabic} />;
    }
  };

  return (
    <div className={`min-h-screen bg-background ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="flex flex-col h-screen">
        <Header 
          user={mockUser} 
          onLanguageToggle={handleLanguageToggle}
          isArabic={isArabic}
        />
        <div className="flex flex-1 overflow-hidden">
          <Navigation 
            activeModule={activeModule}
            onModuleChange={setActiveModule}
            isArabic={isArabic}
          />
          <main className="flex-1 overflow-y-auto bg-muted/30">
            {renderActiveModule()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
