import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getProduct } from "@/lib/marketplace.functions";
import { acquireProduct, getMyProducts } from "@/lib/account.functions";
import { createOxaPayPayment } from "@/lib/oxapay.functions";
import { useGetSession } from "@/lib/use-session";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertCircle, 
  Download, 
  Package, 
  ShieldCheck,
  CheckCircle2,
  Users,
  Box,
  MessageSquareQuote,
  HelpCircle,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: () => getProduct({ data: { id } }),
  });

export const Route = createFileRoute("/products/$productId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(productQuery(params.productId)),
  component: ProductDetail,
});

function ProductDetail() {
  const { productId: productKey } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(productKey));
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session } = useGetSession();
  const isAuthenticated = session?.authenticated;
  
  const { data: ownedProducts } = useQuery({
    queryKey: ["my-products"],
    queryFn: () => getMyProducts(),
    enabled: Boolean(isAuthenticated),
  });
  
  const acquireMutation = useMutation({
    mutationFn: (productId: string) => acquireProduct({ data: { productId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", productKey] });
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      navigate({ to: "/dashboard/student" });
    },
    onError: (error: Error) => {
      toast({ title: "Acquisition failed", description: error.message, variant: "destructive" });
    }
  });

  const productId = product?.id || "";
  const isOwned = ownedProducts?.some((item: any) => item.product_id === productId) ?? false;
  const salesPage = (product?.sales_page ?? {}) as any;
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestPending, setGuestPending] = useState(false);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [guestError, setGuestError] = useState("");
  const [guestAccess, setGuestAccess] = useState<null | any>(null);

  const handleAcquire = () => {
    if (!isAuthenticated) {
      navigate({ to: "/auth/login" });
      return;
    }
    acquireMutation.mutate(productId);
  };

  const handleGuestAccess = async () => {
    // TODO(phase2): Implement guest access server function
    setGuestError("Guest access is not yet implemented.");
  };

  const handleCheckout = async () => {
    setGuestError("");
    if (!guestEmail || !/^\S+@\S+\.\S+$/.test(guestEmail)) {
      setGuestError("Please enter a valid email address — your product access is linked to it.");
      return;
    }
    setCheckoutPending(true);
    try {
      const result = await createOxaPayPayment({ data: { productId, email: guestEmail } });
      window.location.href = result.payLink;
    } catch (error) {
      setGuestError(error instanceof Error ? error.message : "Could not start payment. Please try again.");
      setCheckoutPending(false);
    }
  };

  if (!product) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-white pt-32 pb-20 flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-[#E53E3E] mb-4" />
          <h2 className="text-[24px] font-bold mb-2 text-black">Product not found</h2>
          <p className="text-[#394649]">The product you're looking for doesn't exist or has been removed.</p>
        </div>
      </PublicLayout>
    );
  }

  const isFree = product.price_minor === 0;
  const ctaText = salesPage?.ctaLabel || "Get instant access";
  const priceLabel = isFree
    ? "Free"
    : new Intl.NumberFormat("en-IN", { style: "currency", currency: product.currency || "INR", maximumFractionDigits: 2 }).format((product.price_minor || 0) / 100);
  const accessLabel = (product.trial_days || 0) > 0
    ? `${product.trial_days}-day free trial`
    : product.access_plan === "fixed_days"
      ? `${product.access_days} days access`
      : product.access_plan === "monthly"
        ? "Monthly access"
        : product.access_plan === "yearly"
          ? "Yearly access"
          : "Lifetime access";

  const renderCTA = () => {
    if (guestAccess) {
      return (
        <div className="space-y-3">
          <div className="rounded-lg border border-[#A9E6C8] bg-[#EFFBF5] p-4 text-sm text-[#176B45]">
            Access ready. Download links expire in one hour.
          </div>
          {guestAccess.files?.map((file: any) => (
            <a
              key={file.id}
              href={`/api/marketplace/digital-products/${product.id}/files/${file.id}/guest-download`}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 font-bold text-white hover:bg-[#10A364]"
            >
              <Download className="h-4 w-4" /> Download {file.filename}
            </a>
          ))}
        </div>
      );
    }
    if (isOwned) {
      return (
        <Button 
          onClick={() => navigate({ to: "/dashboard/student" })}
          className="w-full h-14 bg-primary hover:bg-[#10A364] text-white font-medium rounded-lg text-[16px] shadow-[0_8px_24px_rgba(21,207,116,0.25)] transition-transform hover:-translate-y-0.5"
        >
          Go to My Library
        </Button>
      );
    }
    if (isAuthenticated && isFree) {
      return (
        <Button 
          onClick={handleAcquire}
          disabled={acquireMutation.isPending}
          className="w-full h-14 bg-primary hover:bg-[#10A364] text-white font-medium rounded-lg text-[16px] shadow-[0_8px_24px_rgba(21,207,116,0.25)] transition-transform hover:-translate-y-0.5"
        >
          {acquireMutation.isPending ? "Acquiring..." : ctaText}
        </Button>
      );
    }
    return (
      <div className="space-y-3">
        <Input type="email" value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} placeholder="Email address" autoComplete="email" />
        <Input type="tel" value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)} placeholder="+91 mobile number" autoComplete="tel" />
        {guestError && <p className="text-sm text-red-600">{guestError}</p>}
        <Button
          onClick={() => void (isFree ? handleGuestAccess() : handleCheckout())}
          disabled={guestPending || checkoutPending}
          className="h-14 w-full rounded-lg bg-primary text-[16px] font-medium text-white hover:bg-[#10A364] disabled:cursor-not-allowed disabled:bg-[#BFC8C4]"
        >
          {isFree
            ? (guestPending ? "Preparing access..." : ctaText)
            : (checkoutPending ? "Opening secure payment..." : `Pay ${priceLabel} with Crypto`)}
        </Button>
        {!isFree && (product.trial_days || 0) > 0 && (
          <Button
            variant="outline"
            onClick={() => void handleGuestAccess()}
            disabled={guestPending || checkoutPending}
            className="h-12 w-full rounded-lg border-[#B9CCC3] bg-white font-semibold text-[#234238] hover:bg-[#F4FAF7]"
          >
            {guestPending ? "Preparing trial..." : `Start ${product.trial_days}-day free trial`}
          </Button>
        )}
        <p className="text-center text-xs leading-5 text-[#737373]">
          {isFree ? "No account required." : "Secure crypto payment by OxaPay (USDT, BTC, ETH & more)."} By continuing, you agree to the Terms and Privacy Policy.
        </p>
      </div>
    );
  };

  return (
    <PublicLayout>
      <div className="bg-[#FAFAFA] min-h-screen text-black">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-[#E1EBE6] bg-gradient-to-br from-white via-[#F7FBF9] to-[#EAF7F0] pb-16 pt-24 text-[#101C17] lg:pb-28 lg:pt-40">
          <div className="pointer-events-none absolute -left-40 top-24 h-96 w-96 rounded-full bg-[#CFF5E0]/60 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 top-0 h-[30rem] w-[30rem] rounded-full bg-[#E0F1FF]/60 blur-3xl" />
          
          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-20 items-center">
              
              <div className="order-1 lg:order-2 lg:col-span-5 relative w-full max-w-lg mx-auto lg:max-w-none">
                <div className="group flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[2rem] border border-[#D9E7E0] bg-[#FAFAFA] p-0 shadow-[0_24px_70px_rgba(20,72,51,0.13)] lg:aspect-square relative">
                  {product.cover_image_url ? (
                    <>
                      <img src={product.cover_image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 blur-xl scale-110 pointer-events-none" aria-hidden="true" />
                      <img src={product.cover_image_url} alt={product.title} className="relative z-10 h-full w-full object-contain drop-shadow-sm transition-transform duration-700 group-hover:scale-[1.02]" />
                    </>
                  ) : (
                    <Package className="h-24 w-24 text-[#C9DDD3] sm:h-32 sm:w-32" />
                  )}
                </div>
              </div>

              <div className="order-2 lg:order-1 lg:col-span-7 space-y-6 lg:space-y-8 text-center lg:text-left">
                {(product as any).subtype && (
                  <span className="inline-block rounded-full border border-[#BDE8D1] bg-[#E8F8EF] px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-[#087B46]">
                    {(product as any).subtype}
                  </span>
                )}
                
                <h1 className="text-[32px] font-bold leading-[1.15] tracking-tight text-[#0F1C16] sm:text-[40px] lg:text-[56px] lg:leading-[1.1]">
                  {product.title}
                </h1>
                
                {salesPage?.tagline && (
                  <p className="mx-auto max-w-2xl text-[18px] font-medium leading-relaxed text-[#5A6C64] sm:text-[20px] lg:mx-0 lg:text-[24px]">
                    {salesPage.tagline}
                  </p>
                )}
                
                {product.creator?.display_name && (
                  <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#123D32] text-[14px] font-bold text-white shadow-sm">
                      {product.creator.avatar_url ? (
                        <img src={product.creator.avatar_url} alt={product.creator.display_name} className="h-full w-full object-cover" />
                      ) : product.creator.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#344B41]">By {product.creator.display_name}</p>
                      {product.creator.username && <p className="text-xs text-[#6A7D74]">@{product.creator.username}</p>}
                      {product.creator.headline && <p className="mt-1 text-xs text-[#6A7D74]">{product.creator.headline}</p>}
                    </div>
                  </div>
                )}
                
                {salesPage?.benefits && (salesPage.benefits as string[]).length > 0 && (
                  <ul className="space-y-3 pt-4 inline-block text-left w-full max-w-lg mx-auto lg:max-w-none">
                    {(salesPage.benefits as string[]).map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3 text-[15px] text-[#344B41] sm:text-[16px]">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#10A364] shrink-0" />
                        <span className="mt-0 lg:mt-0.5">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 lg:py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
              
              <div className="order-1 lg:order-2 lg:col-span-5">
                <div className="lg:sticky lg:top-32 space-y-6">
                  
                  <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="p-6 sm:p-8 sm:pb-6 border-b border-[#E5E5E5]">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[32px] sm:text-[40px] font-bold text-black leading-none">{priceLabel}</span>
                        <span className="bg-[#E3F9EF] text-[#10A364] px-3 py-1 rounded-full text-[12px] sm:text-[13px] font-bold">
                          {isFree ? "Instant digital access" : "Secure payment required"}
                        </span>
                      </div>
                      
                      <div className="pt-2">
                        <p className="mb-4 text-sm font-semibold text-[#394649]">{accessLabel}</p>
                        {renderCTA()}
                      </div>
                      <p className="text-center text-[#737373] text-[13px] mt-4 flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> {isFree ? "No account required" : "Access only after verified payment"}
                      </p>
                    </div>

                    <div className="p-6 sm:p-8 bg-[#FAFAFA] space-y-6">
                      {(salesPage?.includedItems && (salesPage.includedItems as string[]).length > 0) ? (
                        <div className="space-y-4">
                          <h4 className="font-bold text-black flex items-center gap-2 text-[14px] sm:text-[15px]">
                            <Box className="w-4 h-4 text-primary" /> What's Included
                          </h4>
                          <ul className="space-y-3">
                            {(salesPage.includedItems as string[]).map((item, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-[14px] text-[#394649]">
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {(salesPage?.targetAudience && (salesPage.targetAudience as string[]).length > 0) ? (
                        <div className="space-y-4 pt-6 border-t border-[#E5E5E5]">
                          <h4 className="font-bold text-black flex items-center gap-2 text-[14px] sm:text-[15px]">
                            <Users className="w-4 h-4 text-primary" /> Who is this for?
                          </h4>
                          <ul className="space-y-3">
                            {(salesPage.targetAudience as string[]).map((audience, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-[14px] text-[#394649]">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                <span>{audience}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {(salesPage?.supportEmail || salesPage?.terms) && (
                    <div className="pt-4 space-y-3 px-2">
                      {salesPage.supportEmail && (
                        <p className="text-[13px] text-[#4D4D4D] flex flex-wrap items-center gap-2">
                          <Mail className="w-4 h-4 text-[#9794AA]" /> 
                          Questions? <a href={`mailto:${salesPage.supportEmail}`} className="text-primary hover:underline font-medium break-all">{salesPage.supportEmail}</a>
                        </p>
                      )}
                      {salesPage.terms && (
                        <p className="text-[12px] text-[#737373] leading-relaxed break-words whitespace-pre-wrap">
                          {salesPage.terms}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="order-2 lg:order-1 lg:col-span-7">
                <div className="space-y-12 sm:space-y-20">
                  {/* Detailed Description Sections */}
                  {salesPage?.sections && (salesPage.sections as any[]).length > 0 ? (
                    <div className="space-y-16">
                      {(salesPage.sections as any[]).map((section, i) => (
                        <div key={i}>
                          <h2 className="text-[28px] sm:text-[32px] font-bold mb-6 text-black">{section.heading}</h2>
                          <div className="text-[16px] sm:text-[18px] text-[#394649] leading-relaxed space-y-4 whitespace-pre-wrap">
                            {section.body}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : product.description ? (
                    <div>
                      <h2 className="text-[28px] sm:text-[32px] font-bold mb-6 text-black">About this product</h2>
                      <div className="text-[16px] sm:text-[18px] text-[#394649] leading-relaxed whitespace-pre-wrap">
                        {product.description}
                      </div>
                    </div>
                  ) : null}

                  {/* FAQs */}
                  {salesPage?.faqs && (salesPage.faqs as any[]).length > 0 && (
                    <div className="pt-8">
                      <h2 className="text-[28px] sm:text-[32px] font-bold mb-8 text-black">Frequently Asked Questions</h2>
                      <Accordion type="single" collapsible className="w-full space-y-4">
                        {(salesPage.faqs as any[]).map((faq, i) => (
                          <AccordionItem key={i} value={`faq-${i}`} className="bg-white border border-[#E5E5E5] rounded-xl px-6">
                            <AccordionTrigger className="text-left font-bold text-black hover:no-underline py-6 text-[17px] sm:text-[18px]">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-[#394649] text-[15px] sm:text-[16px] pb-6 leading-relaxed">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
