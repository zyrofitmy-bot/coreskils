import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getMyCreatorProducts } from "@/lib/creator.functions";
import { ProductFormDialog } from "@/components/dashboard/ProductFormDialog";
import { PublishProductButton } from "@/components/dashboard/PublishProductButton";
import { Button } from "@/components/ui/button";

// TODO(phase2): digital file management (upload/list/delete files) isn't ported yet.
export function CreatorProductManage({ productId }: { productId: string }) {
  const { data: products = [] } = useQuery({ queryKey: ["c-products"], queryFn: () => getMyCreatorProducts() });
  const product = products.find((p: any) => p.id === productId);

  if (!product) {
    return <div className="p-12 text-center text-[#9794AA]">Loading product...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <Link to="/dashboard/creator" className="flex items-center gap-1 text-[14px] text-[#4D4D4D] hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>
      <div className="rounded-xl border border-[#E5E5E5] bg-white p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[28px] font-bold text-black">{product.title}</h1>
          <div className="flex gap-2">
            <ProductFormDialog type="digital" product={product}>
              <Button variant="outline" className="h-10">Edit details</Button>
            </ProductFormDialog>
            <PublishProductButton id={product.id} status={product.status} />
          </div>
        </div>
        <p className="text-[14px] text-[#4D4D4D]">{product.description}</p>
        <div className="rounded-lg border border-dashed border-[#E5E5E5] bg-[#FAFAFA] p-10 text-center text-sm text-[#737373]">
          File uploads and sales page editing are coming soon.
        </div>
      </div>
    </div>
  );
}
