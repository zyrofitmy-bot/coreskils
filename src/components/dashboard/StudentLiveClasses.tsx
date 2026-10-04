import { Video } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function StudentLiveClasses() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-4">
      <div>
        <h2 className="text-[32px] md:text-[40px] font-bold text-black tracking-tight leading-tight">Upcoming Live Classes</h2>
        <p className="text-[16px] text-[#4D4D4D] mt-1">Live sessions from your enrolled courses.</p>
      </div>
      <div className="text-center py-20 bg-white border border-[#E5E5E5] rounded-xl shadow-sm">
        <Video className="w-12 h-12 text-[#9794AA] mx-auto mb-4" />
        <h3 className="font-bold text-[18px] text-black mb-2">Live Classes (Phase 2)</h3>
        <p className="text-[14px] text-[#4D4D4D] mb-6">The live class scheduling and classroom infrastructure is coming in the next update.</p>
        <Link to="/courses" className="h-[44px] px-8 bg-primary hover:bg-[#10A364] text-white font-medium rounded-md text-[14px] shadow-[0_4px_14px_rgba(21,207,116,0.25)] inline-flex items-center justify-center">Browse Courses</Link>
      </div>
    </div>
  );
}
