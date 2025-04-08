import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import RightPanel from "@/components/RightPanel";
import { BeamsBackground } from "@/components/ui/background";

export default function Home() {
  return (
    <main className="flex h-screen w-screen overflow-hidden">
      <div className="w-52 flex-shrink-0 bg-google-dark-bg z-10">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-y-auto relative">
        <BeamsBackground className="absolute inset-0 z-0" />

        <div className="relative z-10 h-full">
          <MainContent />
        </div>
      </div>

      <div className="w-64 flex-shrink-0 bg-google-dark-bg z-10">
        <RightPanel />
      </div>
    </main>
  );
}
