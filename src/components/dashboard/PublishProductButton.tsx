import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { setProductStatus } from "@/lib/creator.functions";

export function PublishProductButton({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const handlePublish = async () => {
    setIsPending(true);
    try {
      await setProductStatus({ data: { id, status: "published" } });
      toast({ title: "Published successfully." });
      queryClient.invalidateQueries({ queryKey: ["c-products"] });
    } catch {
      toast({ title: "Failed to publish.", variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  };

  if (status === 'published') {
    return (
      <Button variant="outline" disabled className="h-9 px-4 rounded-md font-medium text-[13px] border-[#DADADA] text-[#9794AA] bg-gray-50">
        Published
      </Button>
    );
  }

  return (
    <Button
      onClick={handlePublish}
      disabled={isPending}
      className="h-9 px-4 bg-primary hover:bg-[#10A364] text-white font-medium rounded-md text-[13px] shadow-[0_4px_14px_rgba(21,207,116,0.25)]"
    >
      {isPending ? "Publishing..." : "Publish"}
    </Button>
  );
}
