import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getCourseBuilder, saveCourse, setCourseStatus, addModule, renameModule, deleteModule as deleteModuleFn, 
  addLesson, updateLesson, deleteLesson as deleteLessonFn 
} from "@/lib/creator.functions";
import { listCategories } from "@/lib/marketplace.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, CheckCircle2, ListVideo, Plus, Settings, Video, FileText,
  Trash, Edit2, Check, AlertCircle, PlayCircle, ChevronDown, ChevronUp, GripVertical
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LessonVideoUpload } from "@/components/dashboard/LessonVideoUpload";
import { LessonResourceUpload } from "@/components/dashboard/LessonResourceUpload";
import { LiveClassesTab } from "@/components/dashboard/LiveClassesTab";

export function CourseBuilder({
  productId,
  backRoute = "/dashboard/creator",
  backLabel = "Course Builder",
  role = "creator"
}: {
  productId: number,
  backRoute?: string,
  backLabel?: string,
  role?: 'creator' | 'admin'
}) {
  const [activeTab, setActiveTab] = useState<"basics" | "curriculum" | "live" | "publish">("basics");

  const { data: builder, isLoading, error } = useQuery({ 
    queryKey: ["creatorCourseBuilder", productId], 
    queryFn: () => getCourseBuilder({ courseId: String(productId) }) 
  });
  const readiness = { ready: true }; // TODO(phase2): Implement readiness check

  if (isLoading) {
    return <div className="p-20 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (error || !builder) {
    return <div className="p-20 text-center text-destructive">Failed to load course builder.</div>;
  }

  const { product, course, modules } = builder;

  return (
    <div className="mx-auto max-w-6xl min-w-0 space-y-5 pb-20 pt-2 sm:space-y-8 sm:pt-4">
      <div className="flex min-w-0 items-start gap-3 border-b border-[#E5E5E5] pb-5 sm:items-center sm:gap-4 sm:pb-6">
        <Link to={backRoute} className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-[#E5E5E5] bg-white hover:bg-gray-50 text-[#394649] transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
         </Link>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-4">
            <h1 className="min-w-0 break-words text-[22px] font-bold leading-tight tracking-tight text-black sm:text-[28px] md:text-[32px]">{product.title}</h1>
            <Badge className={product.status === 'published' ? 'bg-[#E3F9EF] text-primary hover:bg-[#E3F9EF] border-none shadow-none font-medium' : 'bg-gray-100 text-[#9794AA] hover:bg-gray-100 border-none shadow-none font-medium'}>
              {product.status}
            </Badge>
          </div>
          <p className="text-[14px] text-[#4D4D4D]">{backLabel}</p>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:gap-8">
        <div className="-mx-1 flex w-auto gap-2 overflow-x-auto px-1 pb-2 md:mx-0 md:block md:w-64 md:space-y-1 md:overflow-visible md:px-0 md:pb-0">
          <TabButton
            active={activeTab === "basics"}
            onClick={() => setActiveTab("basics")}
            icon={Settings}
            label="Course Details"
          />
          <TabButton
            active={activeTab === "curriculum"}
            onClick={() => setActiveTab("curriculum")}
            icon={ListVideo}
            label="Curriculum"
          />
          <TabButton
            active={activeTab === "live"}
            onClick={() => setActiveTab("live")}
            icon={Video}
            label="Live Classes"
          />
          <TabButton
            active={activeTab === "publish"}
            onClick={() => setActiveTab("publish")}
            icon={CheckCircle2}
            label="Publish"
            badge={true ? undefined : <AlertCircle className="w-4 h-4 text-amber-500" />}
          />
        </div>

        <div className="min-h-[500px] min-w-0 flex-1 rounded-xl border border-[#E5E5E5] bg-white p-4 shadow-sm sm:p-6 md:p-8">
          {activeTab === "basics" && <BasicsTab productId={productId} product={product} course={course} />}
          {activeTab === "curriculum" && <CurriculumTab productId={productId} modules={modules || []} />}
          {activeTab === "live" && <LiveClassesTab productId={productId} role={role} />}
          {activeTab === "publish" && <PublishTab productId={productId} product={product} readiness={readiness} />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, badge }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex min-w-max items-center justify-between rounded-md px-4 py-3 text-[14px] font-medium transition-all md:w-full ${
        active
          ? "bg-[#E3F9EF] text-primary shadow-sm"
          : "text-[#394649] hover:bg-gray-50 hover:text-primary"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-[18px] h-[18px]" />
        {label}
      </div>
      {badge}
    </button>
  );
}

function BasicsTab({ productId, product, course }: { productId: number, product: any, course: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateBasics = useMutation({ mutationFn: (args: { productId: number, data: any }) => saveCourse({ ...args.data, id: String(args.productId) }) });
  
  // TODO(phase2): Mocking upload mutations
  const requestUpload = { mutateAsync: async (args: any) => { throw new Error("Thumbnail upload TODO(phase2)"); }, isPending: false } as any;
  const finalizeUpload = { mutateAsync: async (args: any) => { throw new Error("Thumbnail upload TODO(phase2)"); }, isPending: false } as any;
  
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });

  const [title, setTitle] = useState(product.title || "");
  const [description, setDescription] = useState(product.description || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnailUrl || "");
  const [level, setLevel] = useState(course?.level || "beginner");
  const [outcomes, setOutcomes] = useState<string[]>(course?.outcomes || []);
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>( (course?.faqs as any) || []);
  const [categoryId, setCategoryId] = useState<string>(course?.categoryId ? String(course.categoryId) : "");
  const [publicSlug, setPublicSlug] = useState(product.publicSlug || "");
  const [priceRupees, setPriceRupees] = useState(product.priceMinor ? String(product.priceMinor / 100) : "0");
  const [accessPlan, setAccessPlan] = useState(product.accessPlan || "lifetime");
  const [accessDays, setAccessDays] = useState(product.accessDays ? String(product.accessDays) : "30");
  const [trialDays, setTrialDays] = useState(product.trialDays ? String(product.trialDays) : "0");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    if (course?.thumbnailUrl) {
      setThumbnailUrl(course.thumbnailUrl);
    }
  }, [course?.thumbnailUrl]);

  const handleSave = () => {
    updateBasics.mutate({
      productId,
      data: {
        title,
        description,
        thumbnailUrl: thumbnailUrl || null,
        level,
        outcomes,
        faqs,
        categoryId: categoryId ? Number(categoryId) : null,
        publicSlug,
        priceMinor: Math.round(Number(priceRupees || 0) * 100),
        currency: "INR",
        accessPlan,
        accessDays: accessPlan === "fixed_days" ? Number(accessDays) : null,
        trialDays: Number(trialDays || 0),
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["creatorCourseBuilder", productId] });
        toast({ title: "Saved", description: "Course details updated." });
      },
      onError: (error: Error) => {
        toast({
          title: "Could not save course",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const addOutcome = () => setOutcomes([...outcomes, ""]);
  const updateOutcome = (index: number, val: string) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = val;
    setOutcomes(newOutcomes);
  };
  const removeOutcome = (index: number) => {
    setOutcomes(outcomes.filter((_, i) => i !== index));
  };

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const updateFaq = (index: number, field: "question" | "answer", val: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: val };
    setFaqs(newFaqs);
  };
  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-black">Course Details</h2>
          <p className="text-[#4D4D4D] text-[14px] mt-1">Define your course identity and what students will learn.</p>
        </div>
        <Button onClick={handleSave} disabled={updateBasics.isPending} className="h-11 px-6 bg-primary hover:bg-[#10A364] text-white font-medium rounded-md text-[14px] shadow-[0_4px_14px_rgba(21,207,116,0.25)]">
          {updateBasics.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-5 rounded-xl border border-[#DCE8E1] bg-[#F8FCFA] p-5">
        <div>
          <p className="font-bold text-[16px] text-black">Pricing & public listing</p>
          <p className="mt-1 text-[13px] text-[#4D4D4D]">Choose how students access this course and where it appears publicly.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-11 w-full rounded-md border border-[#D8E2DD] bg-white px-3 text-sm">
              <option value="">Select category</option>
              {categories.map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Public course URL</Label>
            <div className="flex min-w-0 overflow-hidden rounded-md border border-[#D8E2DD] bg-white">
              <span className="hidden items-center bg-[#EEF5F1] px-3 text-xs text-[#607269] sm:flex">/courses/</span>
              <Input value={publicSlug} onChange={(event) => setPublicSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-"))} className="min-w-0 border-0 focus-visible:ring-0" placeholder="course-name" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Course price (₹)</Label>
            <Input type="number" min="0" step="1" value={priceRupees} onChange={(event) => setPriceRupees(event.target.value)} />
            <p className="text-xs text-[#607269]">Enter 0 for a free course.</p>
          </div>
          <div className="space-y-2">
            <Label>Access plan</Label>
            <select value={accessPlan} onChange={(event) => setAccessPlan(event.target.value)} className="h-11 w-full rounded-md border border-[#D8E2DD] bg-white px-3 text-sm">
              <option value="lifetime">Lifetime access</option>
              <option value="monthly">Monthly access (30 days)</option>
              <option value="yearly">Yearly access</option>
              <option value="fixed_days">Custom access period</option>
            </select>
          </div>
          {accessPlan === "fixed_days" && (
            <div className="space-y-2">
              <Label>Access duration (days)</Label>
              <Input type="number" min="1" value={accessDays} onChange={(event) => setAccessDays(event.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <Label>Free trial (days)</Label>
            <Input type="number" min="0" max="90" value={trialDays} onChange={(event) => setTrialDays(event.target.value)} />
            <p className="text-xs text-[#607269]">Enter 0 to disable free trial.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-[14px] font-bold text-[#394649]">Course Title</Label>
          <Input
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Advanced TypeScript Patterns"
            className="text-[16px] font-bold text-black h-12 border-[#E5E5E5] rounded-md"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc" className="text-[14px] font-bold text-[#394649]">Description</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What is this course about?"
            className="min-h-[120px] resize-none text-[15px] border-[#E5E5E5] rounded-md text-black"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label className="text-[14px] font-bold text-[#394649]">Course Thumbnail</Label>

            <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed border-[#E5E5E5] bg-[#FAFAFA] p-4 text-center">
              {thumbnailUrl && !uploadProgress ? (
                <>
                  <img src={thumbnailUrl} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-xl" />
                  <img src={thumbnailUrl} alt="Thumbnail preview" className="absolute inset-0 h-full w-full object-contain" />
                  <div className="relative z-10 bg-white/90 backdrop-blur-sm p-4 rounded-lg border border-[#E5E5E5] shadow-sm">
                    <p className="text-[13px] font-bold text-black mb-3">Thumbnail is set</p>
                    <div className="flex justify-center">
                      <Label htmlFor="file-upload" className="cursor-pointer bg-primary text-white hover:bg-[#10A364] h-9 px-5 inline-flex items-center justify-center rounded-md text-[13px] font-medium transition-colors shadow-sm">
                        Replace Image
                      </Label>
                    </div>
                  </div>
                </>
              ) : uploadProgress !== null ? (
                <div className="w-full max-w-[200px] space-y-2">
                  <div className="flex justify-between text-[12px] font-bold text-black">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : (
                <>
                  <PlayCircle className="w-10 h-10 text-[#9794AA] mb-2" />
                  <div className="space-y-1">
                    <p className="text-[14px] font-bold text-black">Upload a thumbnail</p>
                    <p className="text-[12px] text-[#4D4D4D]">Recommended: 1280x720px (16:9)</p>
                  </div>
                  <Label htmlFor="file-upload" className="mt-2 cursor-pointer bg-white border border-[#DADADA] text-[#394649] hover:bg-gray-50 h-9 px-5 inline-flex items-center justify-center rounded-md text-[13px] font-medium transition-colors shadow-sm">
                    Select Image
                  </Label>
                </>
              )}
              <input 
                id="file-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={() => toast({ title: "Thumbnail upload TODO(phase2)" })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[14px] font-bold text-[#394649]">Course Level</Label>
            <div className="grid grid-cols-3 gap-3">
              {['beginner', 'intermediate', 'advanced'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`h-11 rounded-md border text-[13px] font-medium transition-all ${
                    level === l 
                      ? "border-primary bg-[#E3F9EF] text-primary shadow-sm" 
                      : "border-[#E5E5E5] bg-white text-[#4D4D4D] hover:border-[#DADADA]"
                  }`}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[14px] font-bold text-[#394649]">Learning Outcomes</Label>
            <Button variant="ghost" size="sm" onClick={addOutcome} className="text-primary hover:text-[#10A364] hover:bg-green-50 h-8 font-bold text-[13px]">
              <Plus className="w-4 h-4 mr-1" /> Add Outcome
            </Button>
          </div>
          <div className="grid gap-3">
            {outcomes.map((outcome, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={outcome}
                  onChange={e => updateOutcome(i, e.target.value)}
                  placeholder="What will students learn?"
                  className="text-[14px] border-[#E5E5E5] rounded-md"
                />
                <Button variant="ghost" size="icon" onClick={() => removeOutcome(i)} className="text-[#9794AA] hover:text-[#E53E3E] hover:bg-red-50">
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {outcomes.length === 0 && (
              <p className="text-[13px] text-[#9794AA] italic py-2 text-center border-2 border-dashed border-[#E5E5E5] rounded-lg">No outcomes added yet. Click Add Outcome to start.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[14px] font-bold text-[#394649]">Frequently Asked Questions</Label>
            <Button variant="ghost" size="sm" onClick={addFaq} className="text-primary hover:text-[#10A364] hover:bg-green-50 h-8 font-bold text-[13px]">
              <Plus className="w-4 h-4 mr-1" /> Add FAQ
            </Button>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-4 border border-[#E5E5E5] rounded-lg bg-[#FAFAFA] space-y-3 relative group">
                <Button variant="ghost" size="icon" onClick={() => removeFaq(i)} className="absolute top-2 right-2 text-[#9794AA] hover:text-[#E53E3E] opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash className="w-4 h-4" />
                </Button>
                <div className="space-y-2">
                  <Label className="text-[12px] font-bold text-[#4D4D4D] uppercase">Question</Label>
                  <Input
                    value={faq.question}
                    onChange={e => updateFaq(i, "question", e.target.value)}
                    placeholder="e.g. Is there any prerequisite?"
                    className="bg-white text-[14px] border-[#E5E5E5]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] font-bold text-[#4D4D4D] uppercase">Answer</Label>
                  <Textarea
                    value={faq.answer}
                    onChange={e => updateFaq(i, "answer", e.target.value)}
                    placeholder="Provide a helpful answer..."
                    className="bg-white text-[14px] border-[#E5E5E5] resize-none"
                    rows={2}
                  />
                </div>
              </div>
            ))}
            {faqs.length === 0 && (
              <p className="text-[13px] text-[#9794AA] italic py-2 text-center border-2 border-dashed border-[#E5E5E5] rounded-lg">No FAQs added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CurriculumTab({ productId, modules }: { productId: number, modules: any[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const addModuleMutation = useMutation({ mutationFn: (title: string) => addModule({ courseId: String(productId), title }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["creatorCourseBuilder", productId] }) });
  const renameModuleMutation = useMutation({ mutationFn: (args: { moduleId: number, title: string }) => renameModule({ moduleId: String(args.moduleId), title: args.title }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["creatorCourseBuilder", productId] }) });
  const deleteModuleMutation = useMutation({ mutationFn: (moduleId: number) => deleteModuleFn({ moduleId: String(moduleId) }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["creatorCourseBuilder", productId] }) });
  
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [isAddingModule, setIsAddingModule] = useState(false);

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) return;
    addModuleMutation.mutate(newModuleTitle, {
      onSuccess: () => {
        setNewModuleTitle("");
        setIsAddingModule(false);
        toast({ title: "Module added" });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-black">Course Curriculum</h2>
          <p className="text-[#4D4D4D] text-[14px] mt-1">Organize your course into modules and lessons.</p>
        </div>
        {!isAddingModule ? (
          <Button onClick={() => setIsAddingModule(true)} className="h-9 px-4 bg-primary hover:bg-[#10A364] text-white font-medium rounded-md text-[13px] shadow-[0_4px_14px_rgba(21,207,116,0.25)]">
            <Plus className="w-4 h-4 mr-2" /> Add Module
          </Button>
        ) : (
          <div className="flex gap-2 w-full sm:w-auto">
            <Input 
              value={newModuleTitle} 
              onChange={e => setNewModuleTitle(e.target.value)}
              placeholder="Module title..."
              className="h-9 text-[13px]"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAddModule()}
            />
            <Button size="sm" onClick={handleAddModule} disabled={addModuleMutation.isPending}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setIsAddingModule(false)}>Cancel</Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {modules.map((module, idx) => (
          <ModuleItem 
            key={module.id} 
            module={module} 
            productId={productId} 
            index={idx}
            onRename={(title) => renameModuleMutation.mutate({ moduleId: module.id, title })}
            onDelete={() => deleteModuleMutation.mutate(module.id)}
          />
        ))}
        {modules.length === 0 && !isAddingModule && (
          <div className="text-center py-16 border-2 border-dashed border-[#E5E5E5] rounded-xl bg-[#FAFAFA]">
            <ListVideo className="w-10 h-10 text-[#9794AA] mx-auto mb-3" />
            <h3 className="font-bold text-[16px] text-black">Your curriculum is empty</h3>
            <p className="text-[14px] text-[#4D4D4D] mb-6">Start by adding your first module.</p>
            <Button onClick={() => setIsAddingModule(true)} variant="outline" className="border border-[#DADADA] text-[#394649] bg-white hover:bg-gray-50 h-10 px-6 rounded-md font-medium text-[14px]">
              <Plus className="w-4 h-4 mr-2" /> Create First Module
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ModuleItem({ module, productId, index, onRename, onDelete }: any) {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addLessonMutation = useMutation({ 
    mutationFn: (title: string) => addLesson({ moduleId: String(module.id), title, isPreview: false }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["creatorCourseBuilder", productId] })
  });

  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [isAddingLesson, setIsAddingLesson] = useState(false);

  const handleAddLesson = () => {
    if (!newLessonTitle.trim()) return;
    addLessonMutation.mutate(newLessonTitle, {
      onSuccess: () => {
        setNewLessonTitle("");
        setIsAddingLesson(false);
        toast({ title: "Lesson added" });
        setIsExpanded(true);
      }
    });
  };

  const handleSaveRename = () => {
    if (title.trim() && title !== module.title) {
      onRename(title);
    }
    setIsEditing(false);
  };

  return (
    <div className="border border-[#E5E5E5] rounded-lg bg-white shadow-sm overflow-hidden">
      <div className={`flex items-center justify-between p-4 ${isExpanded ? "bg-[#FAFAFA] border-b border-[#E5E5E5]" : ""}`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <GripVertical className="w-4 h-4 text-[#9794AA] cursor-grab" />
          {isEditing ? (
            <div className="flex gap-2 flex-1">
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                className="h-8 text-[14px] font-bold"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSaveRename()}
              />
              <Button size="sm" className="h-8" onClick={handleSaveRename}>Save</Button>
            </div>
          ) : (
            <h3 className="font-bold text-[16px] text-black truncate cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
              Module {index + 1}: {module.title}
            </h3>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9794AA]" onClick={() => setIsAddingLesson(true)}>
            <Plus className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9794AA]">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => confirm("Delete module?") && onDelete()}>
                <Trash className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9794AA]" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-2 space-y-1">
          {module.lessons?.map((lesson: any, lIdx: number) => (
            <LessonItem key={lesson.id} lesson={lesson} productId={productId} index={lIdx} />
          ))}
          
          {isAddingLesson ? (
            <div className="p-3 bg-[#F8FCFA] border border-dashed border-primary/30 rounded-md flex gap-2">
              <Input 
                value={newLessonTitle}
                onChange={e => setNewLessonTitle(e.target.value)}
                placeholder="Lesson title..."
                className="h-9 text-[13px]"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAddLesson()}
              />
              <Button size="sm" onClick={handleAddLesson} disabled={addLessonMutation.isPending}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAddingLesson(false)}>Cancel</Button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAddingLesson(true)}
              className="w-full flex items-center justify-center py-3 border border-dashed border-[#E5E5E5] rounded-md text-[13px] text-[#9794AA] hover:text-primary hover:border-primary/50 hover:bg-gray-50 transition-all"
            >
              <Plus className="w-3 h-3 mr-2" /> Add Lesson
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function LessonItem({ lesson, productId, index }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateLessonMutation = useMutation({ 
    mutationFn: (data: any) => updateLesson({ lessonId: String(lesson.id), ...data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["creatorCourseBuilder", productId] })
  });

  const deleteLessonMutation = useMutation({ 
    mutationFn: () => deleteLessonFn({ lessonId: String(lesson.id) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["creatorCourseBuilder", productId] })
  });

  const handleSaveRename = () => {
    if (title.trim() && title !== lesson.title) {
      updateLessonMutation.mutate({ title });
    }
    setIsEditing(false);
  };

  const togglePreview = () => {
    updateLessonMutation.mutate({ isPreview: !lesson.isPreview });
  };

  return (
    <div className={`group rounded-md border ${isExpanded ? "border-primary/20 bg-primary/[0.02]" : "border-transparent hover:border-[#E5E5E5] hover:bg-gray-50"}`}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <PlayCircle className={`w-4 h-4 ${lesson.assets?.some((a:any) => a.kind === 'video') ? "text-primary" : "text-[#9794AA]"}`} />
          {isEditing ? (
            <div className="flex gap-2 flex-1">
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                className="h-8 text-[14px]"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSaveRename()}
              />
              <Button size="sm" className="h-8" onClick={handleSaveRename}>Save</Button>
            </div>
          ) : (
            <span className="text-[14px] text-[#394649] truncate cursor-pointer font-medium" onClick={() => setIsExpanded(!isExpanded)}>
              {index + 1}. {lesson.title}
            </span>
          )}
          {lesson.isPreview && (
            <Badge className="h-5 px-1.5 text-[9px] bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">PREVIEW</Badge>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-[#9794AA]" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-3 h-3" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-[#9794AA]">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={togglePreview}>
                <Check className={`w-4 h-4 mr-2 ${lesson.isPreview ? "opacity-100" : "opacity-0"}`} />
                Free Preview
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => confirm("Delete lesson?") && deleteLessonMutation.mutate()}>
                <Trash className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-[#9794AA]" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-10 pb-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <LessonVideoUpload lesson={lesson} productId={productId} />
          <LessonResourceUpload lesson={lesson} productId={productId} />
        </div>
      )}
    </div>
  );
}

function PublishTab({ productId, product, readiness }: { productId: number, product: any, readiness: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const setStatusMutation = useMutation({ 
    mutationFn: (status: string) => setCourseStatus({ courseId: String(productId), status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creatorCourseBuilder", productId] });
      toast({ title: "Status updated" });
    }
  });

  const isPublished = product.status === 'published';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-[24px] font-bold text-black">Publish Course</h2>
        <p className="text-[#4D4D4D] text-[14px] mt-1">Make your course available for students to purchase and learn.</p>
      </div>

      <div className={`p-6 rounded-xl border-2 ${readiness.ready ? "border-green-100 bg-green-50" : "border-amber-100 bg-amber-50"}`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${readiness.ready ? "bg-primary text-white" : "bg-amber-500 text-white"}`}>
            {readiness.ready ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-bold text-[18px] text-black">
              {readiness.ready ? "Ready to publish!" : "Finish setup to publish"}
            </h3>
            <p className="text-[14px] text-[#4D4D4D] mt-1">
              {readiness.ready 
                ? "All required fields are completed. You can now publish your course to the marketplace."
                : "Some required details are missing. Please complete them before publishing."}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-[16px] text-black">Visibility Status</p>
            <p className="text-[14px] text-[#4D4D4D] mt-0.5">Control if your course is visible to the public.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[14px] font-bold ${isPublished ? "text-primary" : "text-[#9794AA]"}`}>
              {isPublished ? "Published" : "Draft"}
            </span>
            <Switch 
              checked={isPublished}
              disabled={!readiness.ready || setStatusMutation.isPending}
              onCheckedChange={(checked) => setStatusMutation.mutate(checked ? 'published' : 'draft')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
