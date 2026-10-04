import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { saveProduct } from "@/lib/creator.functions";

// TODO(phase2): full sales-page builder (sections, media, layout) isn't ported; basic description editor only.
export function SalesPageEditor({ product }: { product: any }) {
  const [description, setDescription] = useState(product?.description || "");
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const save = async () => {
    setIsPending(true);
    try {
      await saveProduct({ data: { id: product.id, title: product.title, description } });
      queryClient.invalidateQueries({ queryKey: ["c-products"] });
      toast({ title: "Sales page updated." });
    } catch (err: any) {
      toast({ title: err.message || "Could not update.", variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
      <Label htmlFor="sales-description" className="text-[14px] font-bold text-[#394649]">Sales page description</Label>
      <Textarea id="sales-description" rows={8} value={description} onChange={(e) => setDescription(e.target.value)} />
      <Button onClick={save} disabled={isPending} className="h-10 bg-primary text-white hover:bg-[#10A364]">
        {isPending ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
