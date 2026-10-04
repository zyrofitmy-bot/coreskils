import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Edit2, MoreVertical, Plus, Trash, Video, XCircle, CheckCircle, Users, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { LessonVideoUpload } from "@/components/dashboard/LessonVideoUpload";

// TODO(phase2): Types and hooks don't exist yet
export type LiveClass = {
  id: number;
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  timezone: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  recordingStatus: 'idle' | 'recording' | 'processing' | 'ready' | 'failed';
  recordingUrl?: string;
  recordingLessonId?: number;
  moduleId?: number;
};

export function LiveClassesTab({ productId, role = 'creator' }: { productId: number, role?: 'creator' | 'admin' }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // TODO(phase2): Mocking data and hooks
  const classes: LiveClass[] = [];
  const isLoading = false;
  const builder = { modules: [] as any[] };

  useEffect(() => {
    if (!classes?.some((item) => item.recordingStatus === "recording" || item.recordingStatus === "processing")) return;
    const timer = window.setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["creatorLiveClasses", productId] });
    }, 5_000);
    return () => window.clearInterval(timer);
  }, [classes, productId, queryClient]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-black">Live Classes</h2>
          <p className="text-[#4D4D4D] text-[14px] mt-1">Schedule and manage live sessions for this course.</p>
        </div>
        <LiveClassFormDialog productId={productId} modules={builder?.modules || []} open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button className="border border-[#DADADA] text-[#394649] bg-white hover:bg-gray-50 h-9 px-4 rounded-md font-medium text-[13px]"><Plus className="w-4 h-4 mr-2" /> Schedule Class</Button>
        </LiveClassFormDialog>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : !classes || classes.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[#E5E5E5] rounded-xl bg-[#FAFAFA]">
          <Video className="w-10 h-10 text-[#9794AA] mx-auto mb-3" />
          <h3 className="font-bold text-[16px] text-black">No live classes scheduled</h3>
          <p className="text-[14px] text-[#4D4D4D] mb-4">Start by scheduling a live class for your students.</p>
          <LiveClassFormDialog productId={productId} modules={builder?.modules || []} open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <Button variant="outline" className="border border-[#DADADA] text-[#394649] bg-white hover:bg-gray-50 h-10 px-6 rounded-md font-medium text-[14px]">Schedule Class</Button>
          </LiveClassFormDialog>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((cls) => (
            <LiveClassItem key={cls.id} liveClass={cls} productId={productId} role={role} modules={builder?.modules || []} />
          ))}
        </div>
      )}
    </div>
  );
}

function LiveClassItem({ liveClass, productId, role, modules }: { liveClass: LiveClass, productId: number, role: 'creator' | 'admin', modules?: any[] }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);

  // TODO(phase2): Mocking mutations
  const deleteClass = { mutate: (args: any, options?: any) => options?.onSuccess?.(), isPending: false };
  const cancelClass = { mutate: (args: any, options?: any) => options?.onSuccess?.(), isPending: false };
  const completeClass = { mutate: (args: any, options?: any) => options?.onSuccess?.(), isPending: false };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["creatorLiveClasses", productId] });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this class? This cannot be undone.")) {
      deleteClass.mutate({ id: liveClass.id }, {
        onSuccess: () => {
          toast({ title: "Class deleted" });
          invalidate();
        },
        onError: (err: any) => toast({ title: "Could not delete", description: err.message, variant: "destructive" })
      });
    }
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel this class?")) {
      cancelClass.mutate({ id: liveClass.id }, {
        onSuccess: () => {
          toast({ title: "Class cancelled" });
          invalidate();
        },
        onError: (err: any) => toast({ title: "Could not cancel", description: err.message, variant: "destructive" })
      });
    }
  };

  const handleComplete = () => {
    if (confirm("End this live class now? All connected students will be disconnected.")) {
      completeClass.mutate({ id: liveClass.id }, {
        onSuccess: () => {
          toast({ title: "Live class ended" });
          invalidate();
        },
        onError: (err: any) => toast({ title: "Could not complete", description: err.message, variant: "destructive" })
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-[#FFEFEB] text-[#FE543D] animate-pulse';
      case 'completed': return 'bg-[#E3F9EF] text-primary';
      case 'cancelled': return 'bg-gray-100 text-[#9794AA]';
      default: return 'bg-[#EAEFF8] text-[#224EA1]';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-[#E5E5E5] rounded-lg shadow-sm gap-4 hover:shadow-md transition-shadow">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-bold text-[16px] text-black">{liveClass.title}</h3>
          <Badge className={`font-bold text-[10px] uppercase tracking-wider border-none shadow-none ${getStatusColor(liveClass.status)}`}>
            {liveClass.status === 'live' ? 'LIVE NOW' : liveClass.status}
          </Badge>
          {(liveClass.recordingStatus !== "idle" || liveClass.status === "completed") && (
            <Badge
              variant="outline"
              className={
                liveClass.recordingStatus === "ready"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : liveClass.recordingStatus === "failed"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
              }
            >
              {liveClass.recordingStatus === "ready"
                ? "Recording saved in lessons"
                : liveClass.recordingStatus === "failed"
                  ? "Automatic recording failed"
                  : liveClass.recordingStatus === "recording"
                    ? "Recording now"
                    : liveClass.recordingStatus === "processing"
                      ? "Recording processing"
                      : "No automatic recording"}
            </Badge>
          )}
        </div>
        <p className="text-[14px] text-[#4D4D4D] line-clamp-1">{liveClass.description || "No description provided."}</p>
        <div className="flex items-center gap-4 mt-3 text-[13px] text-[#4D4D4D] font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#9794AA]" />
            {format(parseISO(liveClass.startsAt), "MMM d, yyyy")}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#9794AA]" />
            {format(parseISO(liveClass.startsAt), "h:mm a")}{liveClass.endsAt ? ` - ${format(parseISO(liveClass.endsAt), "h:mm a")}` : ""} ({liveClass.timezone})
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <AttendanceDialog liveClass={liveClass} />
        {(liveClass.status === "completed" || liveClass.status === "live") && (
          <RecordingUploadDialog liveClass={liveClass} productId={productId} />
        )}
        {liveClass.status === "live" && (
          <Button variant="destructive" size="sm" onClick={handleComplete} disabled={completeClass.isPending} className="h-9 px-4 bg-[#E53E3E] hover:bg-red-600 rounded-md font-medium text-[13px]">
            <CheckCircle className="mr-2 h-4 w-4" />
            {completeClass.isPending ? "Ending..." : "End Live Class"}
          </Button>
        )}
        {liveClass.status === 'scheduled' || liveClass.status === 'live' ? (
          <Link to={"/dashboard/" + role as any}>
            <Button className={`h-9 px-4 rounded-md font-medium text-[13px] ${liveClass.status === 'live' ? 'bg-[#FE543D] hover:bg-red-600 text-white shadow-[0_4px_14px_rgba(254,84,61,0.25)]' : 'bg-primary hover:bg-[#10A364] text-white shadow-[0_4px_14px_rgba(21,207,116,0.25)]'}`} size="sm">
              <Video className="w-4 h-4 mr-2" />
              {liveClass.status === 'live' ? 'Join Class' : 'Enter Studio'}
            </Button>
           </Link>
        ) : liveClass.recordingUrl ? (
          <Button variant="outline" size="sm" className="border border-[#DADADA] text-[#394649] bg-white hover:bg-gray-50 h-9 px-4 rounded-md font-medium text-[13px]" asChild>
            <a href={liveClass.recordingUrl} target="_blank" rel="noopener noreferrer">View Recording</a>
          </Button>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-[#9794AA] hover:text-black hover:bg-gray-100"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <LiveClassFormDialog productId={productId} liveClass={liveClass} modules={modules || []} open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer font-medium text-[13px]">
                <Edit2 className="w-4 h-4 mr-2" /> Edit Details
              </DropdownMenuItem>
            </LiveClassFormDialog>
            {liveClass.status === 'scheduled' && (
              <DropdownMenuItem onClick={handleCancel} className="cursor-pointer font-medium text-[13px]">
                <XCircle className="w-4 h-4 mr-2" /> Cancel Class
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-[#E5E5E5]" />
            <DropdownMenuItem className="text-[#E53E3E] focus:text-[#E53E3E] focus:bg-red-50 cursor-pointer font-medium text-[13px]" onClick={handleDelete}>
              <Trash className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function AttendanceDialog({ liveClass }: { liveClass: LiveClass }) {
  const [open, setOpen] = useState(false);
  
  // TODO(phase2): Mocking data and hooks
  const data: any[] = [];
  const isLoading = false;
  
  const students = data?.filter((entry: any) => entry.role === "student") ?? [];
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Users className="w-4 h-4 mr-2" />Attendance</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Attendance — {liveClass.title}</DialogTitle>
          <DialogDescription>Join history and total connected time for this class.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">Loading attendance…</div>
        ) : !data?.length ? (
          <div className="py-10 text-center text-muted-foreground">No one has joined this class yet.</div>
        ) : (
          <div className="max-h-[55vh] overflow-auto rounded-lg border border-border">
            <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground">
              <span>Participant</span><span>Time</span><span>Joins</span>
            </div>
            {data.map((entry: any) => (
              <div key={entry.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-border px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{entry.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{entry.email}</p>
                </div>
                <span className="text-sm">{formatDuration(entry.durationSeconds)}</span>
                <Badge variant="secondary">{entry.joinCount}</Badge>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">{students.length} student{students.length === 1 ? "" : "s"} attended.</p>
      </DialogContent>
    </Dialog>
  );
}

export function RecordingUploadDialog({
  liveClass,
  productId,
  compact = false,
  open: controlledOpen,
  onOpenChange,
  recordedFile,
}: {
  liveClass: LiveClass;
  productId: number;
  compact?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  recordedFile?: File | null;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [lessonId, setLessonId] = useState("");
  
  // TODO(phase2): Mocking data and hooks
  const builder = { modules: [] as any[] };
  
  const lessons = builder?.modules.flatMap((module: any) =>
    (module.lessons ?? []).map((lesson: any) => ({ lesson, moduleTitle: module.title }))
  ) ?? [];
  const selected = lessons.find((item: any) => item.lesson.id === Number(lessonId));

  useEffect(() => {
    if (!open || lessonId || lessons.length === 0) return;
    const preferred =
      lessons.find(({ lesson }: any) => lesson.id === liveClass.recordingLessonId) ??
      lessons.find(({ lesson }: any) => lesson.moduleId === liveClass.moduleId) ??
      lessons[0];
    setLessonId(String(preferred.lesson.id));
  }, [open, lessonId, lessons, liveClass.moduleId, liveClass.recordingLessonId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-2" />{compact ? "Upload recording" : "Add recording"}</Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-xl overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Add class recording to a lesson</DialogTitle>
          <DialogDescription>
            Select a curriculum lesson, then upload the completed class recording securely.
          </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 space-y-4">
          <div className="min-w-0 space-y-2">
            <Label>Destination lesson</Label>
            <Select value={lessonId} onValueChange={setLessonId}>
              <SelectTrigger className="w-full min-w-0 [&>span]:block [&>span]:truncate">
                <SelectValue placeholder="Choose a lesson" />
              </SelectTrigger>
              <SelectContent>
                {lessons
                  .filter(({ lesson }: any) => !liveClass.recordingLessonId || lesson.id === liveClass.recordingLessonId || lesson.moduleId === liveClass.moduleId)
                  .map(({ lesson, moduleTitle }: any) => (
                  <SelectItem key={lesson.id} value={String(lesson.id)}>
                    {moduleTitle} — {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selected ? (
            <LessonVideoUpload
              lesson={selected.lesson}
              productId={productId}
              initialFile={recordedFile || null}
              onUploadComplete={() => setOpen(false)}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Select the lesson where students should watch this class recording.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function LiveClassFormDialog({ 
  productId, 
  liveClass, 
  children,
  open,
  onOpenChange,
  defaultModuleId,
  modules
}: { 
  productId: number, 
  liveClass?: LiveClass, 
  children: React.ReactNode,
  open: boolean,
  onOpenChange: (open: boolean) => void,
  defaultModuleId?: number | null,
  modules?: any[]
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // TODO(phase2): Mocking mutations
  const createClass = { mutate: (args: any, options?: any) => options?.onSuccess?.(), isPending: false };
  const updateClass = { mutate: (args: any, options?: any) => options?.onSuccess?.(), isPending: false };
  
  const isEditing = !!liveClass;

  const [title, setTitle] = useState(liveClass?.title || "");
  const [description, setDescription] = useState(liveClass?.description || "");
  const [moduleId, setModuleId] = useState<number | null>(liveClass?.moduleId ?? defaultModuleId ?? null);
  
  // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return format(parseISO(dateStr), "yyyy-MM-dd'T'HH:mm");
    } catch {
      return "";
    }
  };

  const [startsAt, setStartsAt] = useState(formatDate(liveClass?.startsAt) || format(new Date(Date.now() + 86400000), "yyyy-MM-dd'T'10:00"));
  const [endsAt, setEndsAt] = useState(formatDate(liveClass?.endsAt) || "");
  const [timezone, setTimezone] = useState(liveClass?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      description,
      moduleId,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      timezone,
      productId,
    };

    if (isEditing) {
      updateClass.mutate({ id: liveClass.id, data }, {
        onSuccess: () => {
          toast({ title: "Class updated" });
          queryClient.invalidateQueries({ queryKey: ["creatorLiveClasses", productId] });
          onOpenChange(false);
        },
        onError: (err: any) => toast({ title: "Update failed", description: err.message, variant: "destructive" })
      });
    } else {
      createClass.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "Class scheduled" });
          queryClient.invalidateQueries({ queryKey: ["creatorLiveClasses", productId] });
          onOpenChange(false);
          setTitle("");
          setDescription("");
        },
        onError: (err: any) => toast({ title: "Schedule failed", description: err.message, variant: "destructive" })
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Live Class" : "Schedule Live Class"}</DialogTitle>
            <DialogDescription>
              Fill in the details for your live session. Students will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Introduction to React" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will be covered..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="module">Curriculum Module (Optional)</Label>
              <Select value={moduleId ? String(moduleId) : "none"} onValueChange={(val) => setModuleId(val === "none" ? null : Number(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {modules?.map((mod) => (
                    <SelectItem key={mod.id} value={String(mod.id)}>{mod.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startsAt">Starts At</Label>
                <Input id="startsAt" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endsAt">Ends At (Optional)</Label>
                <Input id="endsAt" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createClass.isPending || updateClass.isPending}>
              {isEditing ? "Save Changes" : "Schedule Class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
