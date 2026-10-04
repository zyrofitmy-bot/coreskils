import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

// TODO(phase2): platform settings are not yet backed by a server function; this dialog
// is UI-only until an admin "settings" table/endpoint exists.
export function SettingFormDialog({
  settingKey,
  settingValue,
  children,
}: {
  settingKey?: string;
  settingValue?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      key: settingKey || "",
      value: settingValue || "",
    },
  });

  const onSubmit = form.handleSubmit(async () => {
    setIsPending(true);
    try {
      // TODO(phase2): wire up to a real admin settings server function.
      toast({ title: "Settings management isn't available yet.", variant: "destructive" });
    } finally {
      setIsPending(false);
      setOpen(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="border-[#E5E5E5] rounded-xl p-0 gap-0 overflow-hidden sm:max-w-[450px]">
        <DialogHeader className="p-6 pb-4 border-b border-[#E5E5E5] bg-[#FAFAFA]">
          <DialogTitle className="text-[20px] font-bold text-black">{settingKey ? 'Edit Setting' : 'Add/Update Setting'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="p-6 space-y-5 bg-white">
          <div className="space-y-2">
            <Label htmlFor="key" className="text-[14px] font-bold text-[#394649]">Key</Label>
            <Input id="key" {...form.register("key")} disabled={!!settingKey} className="h-11 border-[#E5E5E5] rounded-md text-[14px]" />
            {form.formState.errors.key && (
              <p className="text-[13px] text-[#E53E3E] font-medium">{form.formState.errors.key?.message as string}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="value" className="text-[14px] font-bold text-[#394649]">Value</Label>
            <Input id="value" {...form.register("value")} className="h-11 border-[#E5E5E5] rounded-md text-[14px]" />
            {form.formState.errors.value && (
              <p className="text-[13px] text-[#E53E3E] font-medium">{form.formState.errors.value?.message as string}</p>
            )}
          </div>
          <div className="pt-2">
            <Button type="submit" disabled={isPending} className="w-full h-11 bg-primary hover:bg-[#10A364] text-white font-medium rounded-md text-[14px] shadow-[0_4px_14px_rgba(21,207,116,0.25)]">
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
