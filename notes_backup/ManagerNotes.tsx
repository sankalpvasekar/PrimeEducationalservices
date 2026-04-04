
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, FileText, Headphones, Video, Star, Lock, Eye } from 'lucide-react';
import {
    Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Note {
    id: number;
    title: string;
    description: string;
    note_type: 'PDF' | 'Audio' | 'Video';
    file: string | null;
    demo_file: string | null;
    link: string | null;
    exam: number;
    subject: number | null;
    is_premium: boolean;
    subject_name: string;
}

interface Exam {
    id: number;
    name: string;
}

interface Subject {
    id: number;
    name: string;
    exam: number;
}

const ManagerNotes = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    // Dialog States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);

    // Form State
    const [selectedExam, setSelectedExam] = useState<string>('');
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        note_type: 'PDF',
        exam: '',
        is_premium: false,
    });
    const [noteFile, setNoteFile] = useState<File | null>(null);

    const fetchData = async () => {
        try {
            const [notesRes, subjectsRes, examsRes] = await Promise.all([
                api.get('/api/notes/'),
                api.get('/api/subjects/'),
                api.get('/api/exams/'),
            ]);
            setNotes(Array.isArray(notesRes.data) ? notesRes.data : []);
            setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
            setExams(Array.isArray(examsRes.data) ? examsRes.data : []);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to fetch notes", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target as HTMLInputElement;
        if (type === 'checkbox') {
            setFormData({ ...formData, [id]: (e.target as HTMLInputElement).checked });
        } else {
            setFormData({ ...formData, [id]: value });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNoteFile(e.target.files[0]);
        }
    };

    const cleanForm = () => {
        setFormData({
            title: '',
            description: '',
            note_type: 'PDF',
            exam: '',
            is_premium: false,
        });
        setSelectedExam('');
        setEditingNoteId(null);
        setNoteFile(null);
    };

    const handleSaveNote = async () => {
        if (!formData.title || !formData.note_type || !formData.exam) {
            toast({ title: "Missing Fields", description: "Please fill all required fields (Title, Type, and Exam)", variant: "destructive" });
            return;
        }

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                const value = formData[key as keyof typeof formData];

                // Explicitly handle boolean or specific falsey checks
                if (key === 'is_premium') {
                    // Send as string 'true' or 'false'
                    data.append(key, String(value));
                } else if (value !== null && value !== '' && value !== undefined) {
                    // Only append other fields if they have actual content
                    data.append(key, String(value));
                }
            });

            if (noteFile) {
                data.append('file', noteFile);
            }

            if (editingNoteId) {
                await api.patch(`/api/notes/${editingNoteId}/`, data, {
                    headers: { 'Content-Type': undefined } // Override default JSON header
                });
                toast({ title: "Success", description: "Note updated successfully" });
            } else {
                await api.post('/api/notes/', data, {
                    headers: { 'Content-Type': undefined } // Override default JSON header
                });
                toast({ title: "Success", description: "Note added successfully" });
            }

            setIsAddOpen(false);
            cleanForm();
            fetchData();
        } catch (error: any) {
            console.error("Note creation error:", error);
            let errorMessage = `Failed to ${editingNoteId ? 'update' : 'create'} note`;
            if (error.response?.data) {
                // Try to extract specific field errors
                const serverErrors = error.response.data;
                if (typeof serverErrors === 'object') {
                    const firstError = Object.entries(serverErrors)[0];
                    if (firstError) {
                        errorMessage += `: ${firstError[0]} - ${firstError[1]}`;
                    }
                }
            }
            toast({ title: "Error", description: errorMessage, variant: "destructive" });
        }
    };

    const handleEditNote = (note: Note) => {
        setSelectedExam(note.exam.toString());
        setFormData({
            title: note.title,
            description: note.description || '',
            note_type: note.note_type,
            exam: note.exam.toString(),
            is_premium: note.is_premium,
        });
        setEditingNoteId(note.id);
        setIsDemoMode(!note.is_premium && note.note_type === 'PDF' && !note.description); // Guess demo mode based on fields
        setIsAddOpen(true);
    };

    const handleDeleteNote = async (id: number) => {
        if (!confirm("Are you sure you want to delete this note?")) return;
        try {
            await api.delete(`/api/notes/${id}/`);
            toast({ title: "Deleted", description: "Note removed successfully" });
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete note", variant: "destructive" });
        }
    };

    const filteredSubjects = selectedExam
        ? subjects.filter(s => s.exam === parseInt(selectedExam))
        : subjects;

    if (isLoading) return <div className="p-8 text-center text-leather">Loading Notes...</div>;

    return (
        <div className="space-y-8 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-leather">Notes Management</h1>
                <Dialog open={isAddOpen} onOpenChange={(open) => {
                    setIsAddOpen(open);
                    if (!open) cleanForm();
                }}>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Button className="flex-1 sm:flex-none bg-[#5D4037] text-white hover:bg-[#4E342E]" onClick={() => {
                            cleanForm();
                            setFormData(prev => ({ ...prev, is_premium: false, note_type: 'PDF' }));
                            setIsDemoMode(true);
                            setIsAddOpen(true);
                        }}>
                            <Star className="h-4 w-4 mr-2" /> Demo
                        </Button>
                        <DialogTrigger asChild>
                            <Button className="flex-1 sm:flex-none bg-gold text-white hover:bg-gold/90" onClick={() => {
                                cleanForm();
                                setFormData(prev => ({ ...prev, is_premium: true }));
                                setIsDemoMode(false);
                            }}>
                                <Plus className="h-4 w-4 mr-2" /> New Note
                            </Button>
                        </DialogTrigger>
                    </div>
                    <DialogContent className="parchment-bg max-w-2xl w-[95%] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-leather font-display">
                                {editingNoteId ? 'Edit Note' : (isDemoMode ? 'Add Demo Note' : 'Add New Note')}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                            <div className="space-y-2 sm:col-span-2">
                                <Label className="text-leather-dark font-medium">Title *</Label>
                                <Input id="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Modern History Part 1" className="border-leather/20 focus:border-leather" />
                            </div>

                            {!isDemoMode && (
                                <div className="space-y-2 sm:col-span-2">
                                    <Label className="text-leather-dark font-medium">Description</Label>
                                    <Textarea id="description" value={formData.description} onChange={handleInputChange} placeholder="Brief details about the note content" className="border-leather/20 focus:border-leather" />
                                </div>
                            )}

                            {!isDemoMode && (
                                <div className="space-y-2">
                                    <Label className="text-leather-dark font-medium">Note Type *</Label>
                                    <Select
                                        onValueChange={(val) => setFormData({ ...formData, note_type: val as any })}
                                        value={formData.note_type}
                                    >
                                        <SelectTrigger className="border-leather/20"><SelectValue placeholder="Select Type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PDF">PDF Document</SelectItem>
                                            <SelectItem value="Audio">Audio Lecture</SelectItem>
                                            <SelectItem value="Video">Video Course</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2 sm:col-span-2">
                                <Label className="text-leather-dark font-medium">Exam Category *</Label>
                                <Select
                                    onValueChange={(val) => {
                                        setSelectedExam(val);
                                        setFormData({ ...formData, exam: val });
                                    }}
                                    value={formData.exam}
                                >
                                    <SelectTrigger className="border-leather/20"><SelectValue placeholder="Select Exam" /></SelectTrigger>
                                    <SelectContent>
                                        {exams.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>


                            <div className="space-y-2 sm:col-span-2">
                                <Label className="text-leather-dark font-medium">Note File (PDF/Audio/Video)</Label>
                                <Input type="file" onChange={handleFileChange} className="border-leather/20" />
                            </div>
                        </div>
                        <Button onClick={handleSaveNote} className="w-full bg-leather text-white hover:bg-leather-dark transform transition-all active:scale-95">
                            {editingNoteId ? 'Update Note' : (isDemoMode ? 'Upload Demo PDF' : 'Upload Study Material')}
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="gold-border bg-card/50">
                <CardContent className="p-0 sm:p-6">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="hidden sm:table-header-group">
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Premium</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notes.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-4 text-stone-400 italic">No notes uploaded yet.</TableCell></TableRow>}
                                {Array.isArray(notes) && notes.map((note) => (
                                    <TableRow key={note.id} className="flex flex-col sm:table-row border-b border-gold/10 sm:border-b-0 p-4 sm:p-0 hover:bg-gold/5 transition-colors">
                                        <TableCell className="sm:table-cell py-1 sm:py-4 font-medium text-leather max-w-xs truncate">
                                            <span className="sm:hidden font-semibold mr-2 text-xs text-muted-foreground uppercase">Note:</span>
                                            <div className="inline-flex items-center gap-2">
                                                {note.note_type === 'PDF' && <FileText className="h-4 w-4 text-red-500" />}
                                                {note.note_type === 'Audio' && <Headphones className="h-4 w-4 text-blue-500" />}
                                                {note.note_type === 'Video' && <Video className="h-4 w-4 text-green-500" />}
                                                {note.title}
                                            </div>
                                        </TableCell>
                                        <TableCell className="sm:table-cell py-1 sm:py-4">
                                            <span className="sm:hidden font-semibold mr-2 text-xs text-muted-foreground uppercase">Type:</span>
                                            <span className="text-xs uppercase font-bold tracking-wider">{note.note_type}</span>
                                        </TableCell>
                                        <TableCell className="sm:table-cell py-1 sm:py-4">
                                            <span className="sm:hidden font-semibold mr-2 text-xs text-muted-foreground uppercase">Category:</span>
                                            {exams.find(e => e.id === note.exam)?.name}
                                        </TableCell>
                                        <TableCell className="sm:table-cell py-1 sm:py-4">
                                            <span className="sm:hidden font-semibold mr-2 text-xs text-muted-foreground uppercase">Subject:</span>
                                            <span className="text-stone-500">{note.subject_name || '-'}</span>
                                        </TableCell>
                                        <TableCell className="sm:table-cell py-1 sm:py-4">
                                            <span className="sm:hidden font-semibold mr-2 text-xs text-muted-foreground uppercase">Status:</span>
                                            {note.is_premium ? (
                                                <span className="flex items-center gap-1 text-[#D9853B] font-bold text-xs bg-gold/10 px-2 py-1 rounded-full w-fit">
                                                    <Star className="h-3 w-3 fill-current" /> PREMIUM
                                                </span>
                                            ) : (
                                                <span className="text-stone-400 text-xs px-2 py-1 bg-stone-100 rounded-full w-fit">FREE DEMO</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="sm:table-cell py-1 sm:py-4 text-right">
                                            <span className="sm:hidden font-semibold mr-2 text-xs text-muted-foreground uppercase">Actions:</span>
                                            <div className="flex sm:justify-end gap-1">
                                                <a href={note.file || note.link || '#'} target="_blank" rel="noopener noreferrer" title="View Main Content">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Eye className="h-4 w-4 text-stone-600" />
                                                    </Button>
                                                </a>
                                                <Button variant="ghost" size="icon" onClick={() => handleEditNote(note)} title="Edit" className="h-8 w-8">
                                                    <Pencil className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note.id)} title="Delete" className="h-8 w-8">
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
};

export default ManagerNotes;
