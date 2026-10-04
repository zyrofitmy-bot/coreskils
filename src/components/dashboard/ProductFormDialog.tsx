import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { saveProduct } from "@/lib/creator.functions";
import { listCategories } from "@/lib/marketplace.functions";

const schema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(1, "Add a description before publishing"),
  shortSummary: z.string().max(180, "Keep the summary under 180 characters").optional(),
  coverImageUrl: z.union([z.literal(""), z.string().url("Enter a valid image URL")]).optional(),
  categoryId: z.string().optional(),
  accessPlan: z.enum(["lifetime", "fixed_days", "monthly", "yearly"]),
  accessDays: z.coerce.number().int().min(1).max(3650).optional(),
  priceRupees: z.coerce.number().min(0, "Price cannot be negative").max(10_000_000, "Price is too high"),
}).superRefine((value, context) => {
  if (value.accessPlan === "fixed_days" && !value.accessDays) {
    context.addIssue({ code: "custom", path: ["accessDays"], message: "Enter the number of access days" });
  }
});

export function ProductFormDialog({
  type,
  product,
  children,
}: {
  type: "course" | "digital";
  product?: { id: string; title: string; description?: string | null; short_summary?: string | null; cover_image_url?: string | null; category_id?: string | null; access_plan?: "lifetime" | "fixed_days" | "monthly" | "yearly"; access_days?: number | null; price_minor?: number | null };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: product?.title || "",
      description: product?.description || "",
      shortSummary: product?.short_summary || "",
      coverImageUrl: product?.cover_image_url || "",
      categoryId: product?.category_id || "",
      accessPlan: product?.access_plan || "lifetime",
      accessDays: product?.access_days || undefined,
      priceRupees: (product?.price_minor || 0) / 100,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        title: product.title,
        description: product.description || "",
        shortSummary: product.short_summary || "",
        coverImageUrl: product.cover_image_url || "",
        categoryId: product.category_id || "",
        accessPlan: product.access_plan || "lifetime",
        accessDays: product.access_days || undefined,
        priceRupees: (product.price_minor || 0) / 100,
      });
    }
  }, [product, form, open]);

  const onSubmit = form.handleSubmit(async (data) => {
    setIsPending(true);
    try {
      const res = await saveProduct({
        data: {
          id: product?.id,
          title: data.title,
          description: data.description,
          shortSummary: data.shortSummary,
          categoryId: data.categoryId || null,
          type,
          priceMinor: type === "digital" ? Math.round(data.priceRupees * 100) : 0,
          coverImageUrl: data.coverImageUrl || null,
          accessPlan: data.accessPlan,
          accessDays: data.accessPlan === "fixed_days" ? data.accessDays : null,
        },
      });
      toast({ title: `${type === 'course' ? 'Course' : 'Product'} ${product ? 'updated' : 'created'} successfully.` });
      queryClient.invalidateQueries({ queryKey: ["c-products"] });
      setOpen(false);
      if (!product) {
        form.reset();
        if (type === "digital") {
          navigate({ to: "/dashboard/creator/products/$id/manage", params: { id: res.id } } as any); // TODO(phase2): manage route
        }
      }
    } catch {
      toast({ title: `Failed to ${product ? 'update' : 'create'}.`, variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden border-[#E5E5E5] rounded-xl p-0 gap-0 sm:max-w-[450px]">
        <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-[#E5E5E5] bg-[#FAFAFA]">
          <DialogTitle className="text-[20px] font-bold text-black">{product ? 'Edit' : 'Create'} {type === 'course' ? 'Course' : 'Digital Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5 bg-white">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[14px] font-bold text-[#394649]">Title</Label>
            <Input id="title" {...form.register("title")} className="h-11 border-[#E5E5E5] rounded-md text-[14px]" />
            {form.formState.errors.title && (
              <p className="text-[13px] text-[#E53E3E] font-medium">{form.formState.errors.title?.message as string}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[14px] font-bold text-[#394649]">Description</Label>
            <Input id="description" {...form.register("description")} className="h-11 border-[#E5E5E5] rounded-md text-[14px]" />
            {form.formState.errors.description && <p className="text-[13px] font-medium text-[#E53E3E]">{form.formState.errors.description.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-[14px] font-bold text-[#394649]">Category</Label>
            <Select value={form.watch("categoryId") ?? ""} onValueChange={(v) => form.setValue("categoryId", v, { shouldDirty: true })}>
              <SelectTrigger className="h-11 border-[#E5E5E5] rounded-md text-[14px]"><SelectValue placeholder="No category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {type === "digital" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="shortSummary" className="text-[14px] font-bold text-[#394649]">Short Summary</Label>
                <Input id="shortSummary" placeholder="A quick description for marketplace cards" {...form.register("shortSummary")} className="h-11 border-[#E5E5E5] rounded-md text-[14px]" />
                {form.formState.errors.shortSummary && <p className="text-[13px] font-medium text-[#E53E3E]">{form.formState.errors.shortSummary.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverImageUrl" className="text-[14px] font-bold text-[#394649]">Cover Image URL</Label>
                {/* TODO(phase2): direct file upload for product thumbnails is not yet wired up; URL only for now. */}
                <Input id="coverImageUrl" placeholder="https://example.com/cover.jpg" {...form.register("coverImageUrl")} className="h-11 border-[#E5E5E5] rounded-md text-[14px]" />
                {form.formState.errors.coverImageUrl && <p className="text-[13px] font-medium text-[#E53E3E]">{form.formState.errors.coverImageUrl.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceRupees" className="text-[14px] font-bold text-[#394649]">Price (INR)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-semibold text-[#52635B]">₹</span>
                  <Input
                    id="priceRupees"
                    type="number"
                    min={0}
                    max={10_000_000}
                    step="0.01"
                    {...form.register("priceRupees")}
                    className="h-11 rounded-md border-[#E5E5E5] pl-8 text-[14px]"
                  />
                </div>
                {form.formState.errors.priceRupees && <p className="text-[13px] font-medium text-[#E53E3E]">{form.formState.errors.priceRupees.message as string}</p>}
                <p className="text-[12px] text-[#737373]">Use ₹0 for a free product.</p>
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label className="text-[14px] font-bold text-[#394649]">Access Duration</Label>
            <Select value={form.watch("accessPlan")} onValueChange={(value) => form.setValue("accessPlan", value as "lifetime" | "fixed_days" | "monthly" | "yearly", { shouldDirty: true })}>
              <SelectTrigger className="h-11 border-[#E5E5E5] rounded-md text-[14px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lifetime">Lifetime / one-time access</SelectItem>
                <SelectItem value="fixed_days">Fixed number of days</SelectItem>
                <SelectItem value="monthly">Monthly access</SelectItem>
                <SelectItem value="yearly">Yearly access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.watch("accessPlan") === "fixed_days" && (
            <div className="space-y-2">
              <Label htmlFor="accessDays" className="text-[14px] font-bold text-[#394649]">Access Days</Label>
              <Input id="accessDays" type="number" min={1} max={3650} {...form.register("accessDays")} className="h-11 border-[#E5E5E5] rounded-md text-[14px]" />
              {form.formState.errors.accessDays && <p className="text-[13px] font-medium text-[#E53E3E]">{form.formState.errors.accessDays.message as string}</p>}
            </div>
          )}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 border-t border-[#E5E5E5] bg-white px-4 sm:px-6 py-4">
            <Button type="submit" disabled={isPending} className="w-full h-11 bg-primary hover:bg-[#10A364] text-white font-medium rounded-md text-[14px] shadow-[0_4px_14px_rgba(21,207,116,0.25)]">
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
