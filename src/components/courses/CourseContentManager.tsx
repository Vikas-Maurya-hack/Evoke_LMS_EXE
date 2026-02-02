import { useState } from "react";
import { ArrowLeft, Plus, Video, FileText, GripVertical, MoreVertical, Play, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { SoftCard } from "@/components/ui/soft-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Lesson {
    id: string;
    title: string;
    type: "video" | "document" | "quiz";
    duration?: string;
    order: number;
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
    isExpanded: boolean;
    order: number;
}

interface CourseContentManagerProps {
    courseId: string;
    courseName: string;
    instructor: string;
    onBack: () => void;
}

export function CourseContentManager({ courseId, courseName, instructor, onBack }: CourseContentManagerProps) {
    const [modules, setModules] = useState<Module[]>([
        {
            id: "1",
            title: "Introduction to the Course",
            isExpanded: true,
            order: 1,
            lessons: [
                { id: "1-1", title: "Welcome & Course Overview", type: "video", duration: "5:30", order: 1 },
                { id: "1-2", title: "How to Use This Course", type: "document", order: 2 },
            ],
        },
        {
            id: "2",
            title: "Getting Started",
            isExpanded: false,
            order: 2,
            lessons: [
                { id: "2-1", title: "Setting Up Your Environment", type: "video", duration: "12:45", order: 1 },
                { id: "2-2", title: "First Steps", type: "video", duration: "8:20", order: 2 },
            ],
        },
    ]);

    const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
    const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [newModuleTitle, setNewModuleTitle] = useState("");
    const [newLesson, setNewLesson] = useState({ title: "", type: "video" as const, duration: "" });

    const toggleModule = (moduleId: string) => {
        setModules(modules.map(m =>
            m.id === moduleId ? { ...m, isExpanded: !m.isExpanded } : m
        ));
    };

    const handleAddModule = () => {
        if (!newModuleTitle.trim()) {
            toast.error("Please enter a module title");
            return;
        }

        const newModule: Module = {
            id: Date.now().toString(),
            title: newModuleTitle,
            lessons: [],
            isExpanded: true,
            order: modules.length + 1,
        };

        setModules([...modules, newModule]);
        setNewModuleTitle("");
        setIsAddModuleOpen(false);
        toast.success("Module added successfully");
    };

    const handleAddLesson = () => {
        if (!newLesson.title.trim() || !selectedModuleId) {
            toast.error("Please enter a lesson title");
            return;
        }

        setModules(modules.map(m => {
            if (m.id === selectedModuleId) {
                const newLessonItem: Lesson = {
                    id: `${m.id}-${Date.now()}`,
                    title: newLesson.title,
                    type: newLesson.type,
                    duration: newLesson.duration || undefined,
                    order: m.lessons.length + 1,
                };
                return { ...m, lessons: [...m.lessons, newLessonItem] };
            }
            return m;
        }));

        setNewLesson({ title: "", type: "video", duration: "" });
        setIsAddLessonOpen(false);
        toast.success("Lesson added successfully");
    };

    const deleteModule = (moduleId: string) => {
        setModules(modules.filter(m => m.id !== moduleId));
        toast.success("Module deleted");
    };

    const deleteLesson = (moduleId: string, lessonId: string) => {
        setModules(modules.map(m => {
            if (m.id === moduleId) {
                return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
            }
            return m;
        }));
        toast.success("Lesson deleted");
    };

    const getLessonIcon = (type: string) => {
        switch (type) {
            case "video":
                return <Video className="w-4 h-4 text-blue-500" />;
            case "document":
                return <FileText className="w-4 h-4 text-orange-500" />;
            case "quiz":
                return <Play className="w-4 h-4 text-green-500" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{courseName}</h1>
                    <p className="text-muted-foreground">by {instructor}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SoftCard className="p-4" hoverable>
                    <p className="text-sm text-muted-foreground">Total Modules</p>
                    <p className="text-2xl font-bold">{modules.length}</p>
                </SoftCard>
                <SoftCard className="p-4" hoverable>
                    <p className="text-sm text-muted-foreground">Total Lessons</p>
                    <p className="text-2xl font-bold">{modules.reduce((acc, m) => acc + m.lessons.length, 0)}</p>
                </SoftCard>
                <SoftCard className="p-4" hoverable>
                    <p className="text-sm text-muted-foreground">Course ID</p>
                    <p className="text-sm font-mono truncate">{courseId}</p>
                </SoftCard>
            </div>

            {/* Add Module Button */}
            <div className="flex justify-end">
                <Button onClick={() => setIsAddModuleOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Module
                </Button>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
                {modules.map((module) => (
                    <SoftCard key={module.id} className="overflow-hidden" hoverable={false}>
                        {/* Module Header */}
                        <div
                            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => toggleModule(module.id)}
                        >
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                            {module.isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                            <div className="flex-1">
                                <h3 className="font-semibold">{module.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {module.lessons.length} lesson{module.lessons.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedModuleId(module.id);
                                        setIsAddLessonOpen(true);
                                    }}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Lesson
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteModule(module.id);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Module
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Lessons */}
                        {module.isExpanded && (
                            <div className="border-t">
                                {module.lessons.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground">
                                        <p>No lessons yet.</p>
                                        <Button
                                            variant="link"
                                            onClick={() => {
                                                setSelectedModuleId(module.id);
                                                setIsAddLessonOpen(true);
                                            }}
                                        >
                                            Add your first lesson
                                        </Button>
                                    </div>
                                ) : (
                                    module.lessons.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            className="flex items-center gap-3 p-3 pl-12 hover:bg-muted/30 transition-colors border-b last:border-b-0"
                                        >
                                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                                            {getLessonIcon(lesson.type)}
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{lesson.title}</p>
                                                {lesson.duration && (
                                                    <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => deleteLesson(module.id, lesson.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </SoftCard>
                ))}

                {modules.length === 0 && (
                    <SoftCard className="p-8 text-center" hoverable={false}>
                        <p className="text-muted-foreground mb-4">No modules yet. Start by adding your first module.</p>
                        <Button onClick={() => setIsAddModuleOpen(true)} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Module
                        </Button>
                    </SoftCard>
                )}
            </div>

            {/* Add Module Dialog */}
            <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Module</DialogTitle>
                        <DialogDescription>
                            Create a new module to organize your course content.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="module-title">Module Title</Label>
                            <Input
                                id="module-title"
                                placeholder="e.g., Introduction to React"
                                value={newModuleTitle}
                                onChange={(e) => setNewModuleTitle(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModuleOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddModule}>Add Module</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Lesson Dialog */}
            <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Lesson</DialogTitle>
                        <DialogDescription>
                            Add a new lesson to your module.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="lesson-title">Lesson Title</Label>
                            <Input
                                id="lesson-title"
                                placeholder="e.g., Setting Up Your Environment"
                                value={newLesson.title}
                                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lesson-type">Lesson Type</Label>
                            <Select
                                value={newLesson.type}
                                onValueChange={(value: "video" | "document" | "quiz") =>
                                    setNewLesson({ ...newLesson, type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="document">Document</SelectItem>
                                    <SelectItem value="quiz">Quiz</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {newLesson.type === "video" && (
                            <div className="space-y-2">
                                <Label htmlFor="lesson-duration">Duration (optional)</Label>
                                <Input
                                    id="lesson-duration"
                                    placeholder="e.g., 10:30"
                                    value={newLesson.duration}
                                    onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddLessonOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddLesson}>Add Lesson</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
