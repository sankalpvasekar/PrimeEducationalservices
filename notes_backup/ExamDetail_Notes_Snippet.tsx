// ExamDetail.tsx Notes Snippets (Pre-hiding)

// --- 1. Imports ---
import { FileText, Lock, Unlock, Headphones, Video } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PremiumPDFViewer } from '@/components/PremiumPDFViewer';

// --- 2. Interfaces ---
interface Note {
    id: number;
    title: string;
    description: string;
    note_type: 'PDF' | 'Audio' | 'Video';
    file: string | null;
    demo_file: string | null;
    link: string | null;
    subject: number;
    is_premium: boolean;
    subject_name: string;
}

// --- 3. State ---
const [selectedNoteType, setSelectedNoteType] = useState<string>('PDF');
const [showPremiumModal, setShowPremiumModal] = useState(false);
const [viewingNote, setViewingNote] = useState<Note | null>(null);

// --- 4. Query ---
const { data: notes } = useQuery({
    queryKey: ['notes', examId],
    queryFn: async () => {
        const response = await api.get(`/api/notes/?exam=${examId}`);
        return Array.isArray(response.data) ? response.data as Note[] : [];
    },
    enabled: !!examId
});

// --- 5. Filtering Logic ---
const demoNotes = notes?.filter(note => !note.is_premium || note.demo_file) || [];
const premiumNotes = notes?.filter(note => note.is_premium) || [];
const firstDemo = demoNotes[0];

const filteredNotes = notes?.filter(note => {
    const matchesType = note.note_type === selectedNoteType;
    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject;
    return matchesType && matchesSubject;
}) || [];

// --- 6. JSX: Tabs and Content ---
/*
<Tabs defaultValue="books" className="w-full">
    <div className="flex justify-center mb-1.5">
        <TabsList ...>
            <TabsTrigger value="books" ...>Books</TabsTrigger>
            <TabsTrigger value="notes" ...>Notes</TabsTrigger>
        </TabsList>
    </div>

    <TabsContent value="books"> ... </TabsContent>

    <TabsContent value="notes" className="w-full space-y-3 ...">
        <div className="flex justify-center mb-6">
            <div className="inline-flex bg-[#F5F1E9] p-1 rounded-xl shadow-inner border border-[#D7CCC8]">
                {['PDF', 'Audio', 'Video'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setSelectedNoteType(type)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${selectedNoteType === type ? 'bg-[#5D4037] text-white shadow-md' : 'text-[#8C837E] hover:text-[#5D4037]'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => (
                    <div key={note.id} className="group bg-white rounded-xl p-4 border border-[#E7E5E4] hover:border-[#5D4037]/30 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 rounded-lg bg-[#F5F1E9] text-[#5D4037] group-hover:bg-[#5D4037] group-hover:text-white transition-colors">
                                {note.note_type === 'PDF' && <FileText className="w-5 h-5" />}
                                {note.note_type === 'Audio' && <Headphones className="w-5 h-5" />}
                                {note.note_type === 'Video' && <Video className="w-5 h-5" />}
                            </div>
                            {note.is_premium ? (
                                <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#FEF3C7] text-[#B45309] text-[10px] font-bold uppercase tracking-wider">
                                    <Lock className="w-3 h-3" /> Premium
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#DCFCE7] text-[#166534] text-[10px] font-bold uppercase tracking-wider">
                                    <Unlock className="w-3 h-3" /> Free
                                </div>
                            )}
                        </div>

                        <h3 className="font-bold text-[#3a2d28] text-lg mb-1 line-clamp-1 group-hover:text-[#B45309] transition-colors">{note.title}</h3>
                        <p className="text-[#8C837E] text-xs line-clamp-2 mb-4 h-8">{note.description}</p>

                        <button
                            onClick={() => {
                                if (note.is_premium && !note.demo_file) {
                                    setShowPremiumModal(true);
                                } else {
                                    setViewingNote(note);
                                }
                            }}
                            className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${note.is_premium && !note.demo_file
                                ? 'bg-[#3a2d28] text-white hover:bg-[#2c221e]'
                                : 'bg-[#F5F1E9] text-[#5D4037] hover:bg-[#EDE9DE]'
                                }`}
                        >
                            {note.is_premium && !note.demo_file ? (
                                <>Unlock Content <Lock className="w-4 h-4" /></>
                            ) : (
                                <>View Material <PlayCircle className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center py-12 text-[#8C837E] italic">
                    No {selectedNoteType} notes available for this subject.
                </div>
            )}
        </div>
    </TabsContent>
</Tabs>
*/
