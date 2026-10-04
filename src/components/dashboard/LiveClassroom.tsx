import { Button } from "@/components/ui/button";
import { ArrowLeft, Video, AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";

// TODO(phase2): LiveKit and recording infra are not ported yet.
export function LiveClassroom({ id, backUrl }: { id: number, backUrl: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-lg mx-auto text-center space-y-4">
      <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
        <Video className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold">Classroom Placeholder</h2>
      <p className="text-muted-foreground">The secure live classroom feature (LiveKit integration) is planned for Phase 2.</p>
      <Link to={backUrl as any} className="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">Go Back</Link>
    </div>
  );
}
