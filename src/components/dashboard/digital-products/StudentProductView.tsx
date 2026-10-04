import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Package } from "lucide-react";
import { getMyProducts } from "@/lib/account.functions";

// TODO(phase2): secure file downloads aren't ported yet; shows product details only.
export function StudentProductView({ productId }: { productId: string }) {
  const { data: myProducts = [], isLoading } = useQuery({ queryKey: ["my-products"], queryFn: () => getMyProducts() });
  const entitlement = myProducts.find((e: any) => e.products?.id === productId || e.product_id === productId);
  const product = entitlement?.products;

  if (isLoading) {
    return <div className="p-12 text-center text-[#9794AA]">Loading your product...</div>;
  }

  if (!product) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-black mb-2">Product not found</h2>
        <Link to="/dashboard/student" className="text-primary hover:underline">Return to Library</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="flex items-center gap-4 text-[#4D4D4D] text-[14px]">
        <Link to="/dashboard/student" className="hover:text-primary flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to Products</Link>
      </div>

      <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 shadow-sm sm:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 aspect-square bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg overflow-hidden flex items-center justify-center shrink-0 relative">
            {product.cover_image_url ? (
              <img src={product.cover_image_url} alt={product.title} className="relative z-10 w-full h-full object-contain drop-shadow-sm" />
            ) : (
              <Package className="w-20 h-20 text-primary/30" />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-6">
            <div>
              <h1 className="mb-3 break-words text-[26px] font-bold leading-tight tracking-tight text-black sm:text-[32px]">{product.title}</h1>
              <p className="text-[16px] text-[#4D4D4D]">{product.short_summary || product.description}</p>
            </div>
            <div className="rounded-lg border border-dashed border-[#E5E5E5] bg-[#FAFAFA] p-5 text-center text-sm text-[#737373]">
              Downloadable files are coming soon.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
