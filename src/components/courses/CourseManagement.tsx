import { AddCourseDialog } from "./AddCourseDialog";
import { CourseContentManager } from "./CourseContentManager";
import { useState, useEffect } from "react";
import {
    Plus,
    MoreVertical,
    Search,
    Filter,
    FileText,
    Users,
    DollarSign,
    Video,
    BookOpen,
    Edit
} from "lucide-react";
import { SoftCard } from "@/components/ui/soft-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

// Extended course type for management view
interface ManagedCourse {
    _id: string; // MongoDB ID uses _id
    id?: string; // Fallback for frontend compatibility
    name: string;
    category: string;
    instructor: string;
    students: number;
    revenue: string;
    status: "Active" | "Draft" | "Archived";
    lastUpdated: string;
}

export function CourseManagement() {
    const [courses, setCourses] = useState<ManagedCourse[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<ManagedCourse | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch courses from Backend
    const fetchCourses = async () => {
        try {
            const response = await fetch('/api/courses');
            if (!response.ok) throw new Error('Failed to fetch courses');
            const data = await response.json();

            // Map MongoDB data to frontend format if needed
            const formattedData = data.map((item: any) => ({
                ...item,
                id: item._id, // Map _id to id
                lastUpdated: new Date(item.lastUpdated).toLocaleDateString()
            }));

            setCourses(formattedData);
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error("Could not load courses. Is the backend server running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedCourse) {
        return (
            <CourseContentManager
                courseId={selectedCourse.id || selectedCourse._id}
                courseName={selectedCourse.name}
                instructor={selectedCourse.instructor}
                onBack={() => setSelectedCourse(null)}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SoftCard className="p-4" hoverable={true}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Courses</p>
                            <h3 className="text-2xl font-bold">{courses.length}</h3>
                        </div>
                    </div>
                </SoftCard>

                <SoftCard className="p-4" hoverable={true}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Active Students</p>
                            <h3 className="text-2xl font-bold">{courses.reduce((acc, curr) => acc + (curr.students || 0), 0)}</h3>
                        </div>
                    </div>
                </SoftCard>

                <SoftCard className="p-4" hoverable={true}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-500">
                            <Video className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Lessons</p>
                            <h3 className="text-2xl font-bold">--</h3>
                        </div>
                    </div>
                </SoftCard>

                <SoftCard className="p-4" hoverable={true}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Course Revenue</p>
                            <h3 className="text-2xl font-bold">--</h3>
                        </div>
                    </div>
                </SoftCard>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses, instructors..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>
                    <Button className="gap-2" onClick={() => setIsAddCourseOpen(true)}>
                        <Plus className="w-4 h-4" />
                        Add New Course
                    </Button>
                </div>
            </div>

            {/* Course Table */}
            <SoftCard className="overflow-hidden" hoverable={false}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Instructor</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Loading courses...
                                </TableCell>
                            </TableRow>
                        ) : filteredCourses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No courses found. Click "Add New Course" to create one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCourses.map((course) => (
                                <TableRow
                                    key={course._id || course.id}
                                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => setSelectedCourse(course)}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{course.name}</p>
                                                <p className="text-xs text-muted-foreground">{course.lastUpdated}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal">
                                            {course.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="w-6 h-6">
                                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                                    {course.instructor.split(' ')[0][0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{course.instructor}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3 text-muted-foreground" />
                                            {course.students}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={
                                                course.status === 'Active' ? 'bg-green-500/15 text-green-600 hover:bg-green-500/25' :
                                                    course.status === 'Draft' ? 'bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/25' :
                                                        'bg-gray-500/15 text-gray-600 hover:bg-gray-500/25'
                                            }
                                            variant="outline"
                                        >
                                            {course.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{course.revenue}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedCourse(course);
                                                }}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Manage Content
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>View Analytics</DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Manage Students</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={(e) => e.stopPropagation()}>Delete Course</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )))}
                    </TableBody>
                </Table>
            </SoftCard>

            <AddCourseDialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen} />
        </div>
    );
}
