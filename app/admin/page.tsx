'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, Upload, FileText, Image as ImageIcon, Loader2, ArrowLeft, Trash2, CheckCircle2, MoreVertical, Plus, Eye, Pencil, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Category {
  id: number;
  title: string;
  subtitle: string;
  banner_url?: string;
  description?: string;
  price: number;
}

interface Pdf {
  id: number;
  title: string;
  price: string;
  cloudinary_url: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  is_blocked: boolean;
}

interface Order {
  id: number;
  order_id: string;
  customer_name: string;
  customer_email: string;
  section_title: string;
  amount: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'content' | 'users' | 'orders'>('content');
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrderData] = useState<Order[]>([]);
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showCreateSection, setShowCreateSection] = useState(false);

  // Form states
  const [newSec, setNewSec] = useState({ title: '', subtitle: '', banner_url: '' });
  const [pdfTitle, setPdfTitle] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editPrice, setEditPrice] = useState('499');
  const [editingPdfId, setEditingPdfId] = useState<number | null>(null);
  const [editPdfTitle, setEditPdfTitle] = useState('');
  const [pendingPdf, setPendingPdf] = useState<File | null>(null);

  const handleFatalAuth = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
        toast.error('Session expired or unauthorized');
        router.push('/login');
    });
  }, [router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) { handleFatalAuth(); return; }

      if (activeTab === 'content') {
        const res = await fetch('/api/admin/categories');
        if (res.status === 401 || res.status === 403) { handleFatalAuth(); return; }
        const data = await res.json();
        setCategories(data.categories || []);
      } else if (activeTab === 'users') {
        const res = await fetch('/api/admin/users');
        if (res.status === 401 || res.status === 403) { handleFatalAuth(); return; }
        const data = await res.json();
        setUsers(data.users || []);
      } else if (activeTab === 'orders') {
        const res = await fetch('/api/admin/orders');
        if (res.status === 401 || res.status === 403) { handleFatalAuth(); return; }
        const data = await res.json();
        setOrderData(data.orders || []);
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, handleFatalAuth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (selectedCat) {
      const cat = categories.find(c => c.id === selectedCat);
      if (cat) {
         setEditTitle(cat.title);
         setEditSubtitle(cat.subtitle || '');
         setEditPrice(cat.price !== null && cat.price !== undefined ? cat.price.toString() : '499');
      }
      fetch(`/api/admin/pdfs?sectionId=${selectedCat}`)
        .then(res => res.json())
        .then(data => setPdfs(data.pdfs || []));
    }
  }, [selectedCat, categories]);

  const handleCreateSection = async () => {
    if (!newSec.title) { toast.error('Title is required'); return; }
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSec)
      });
      if (res.ok) {
        toast.success('Section created!');
        setShowCreateSection(false);
        setNewSec({ title: '', subtitle: '', banner_url: '' });
        fetchData();
      }
    } catch (err) {
      toast.error('Creation failed');
    }
  };

  const handleUpdateSection = async () => {
    if (!selectedCat) return;
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId: selectedCat, title: editTitle, subtitle: editSubtitle, price: parseInt(editPrice) || 0 })
      });
      if (res.ok) {
        toast.success('Section metadata updated');
        fetchData();
      }
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !selectedCat) return;
    setUploading(true);

    try {
      // 1. Get Signature
      const sigRes = await fetch('/api/admin/upload-signature');
      const sigData = await sigRes.json();
      if (!sigRes.ok) throw new Error(sigData.error || 'Failed to get upload signature');

      // 2. Upload to Cloudinary
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.api_key);
      formData.append('timestamp', sigData.timestamp);
      formData.append('signature', sigData.signature);
      formData.append('folder', 'prime-edu');

      const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloud_name}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const cldData = await cldRes.json();
      if (!cldRes.ok) throw new Error(cldData.error?.message || 'Cloudinary upload failed');

      // 3. Save to DB
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedCat,
          type: 'banner',
          fileUrl: cldData.secure_url
        })
      });

      if (res.ok) {
        toast.success('Banner updated');
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handlePdfUpload = async () => {
    if (!pendingPdf || !selectedCat || !pdfTitle) {
      toast.error('Missing title or file');
      return;
    }
    setUploading(true);

    try {
      // 1. Get Signature
      const sigRes = await fetch('/api/admin/upload-signature');
      const sigData = await sigRes.json();
      if (!sigRes.ok) throw new Error(sigData.error || 'Failed to get upload signature');

      // 2. Upload to Cloudinary (resource_type: raw for PDF/PPT)
      const formData = new FormData();
      formData.append('file', pendingPdf);
      formData.append('api_key', sigData.api_key);
      formData.append('timestamp', sigData.timestamp);
      formData.append('signature', sigData.signature);
      formData.append('folder', 'prime-edu');

      const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloud_name}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const cldData = await cldRes.json();
      if (!cldRes.ok) throw new Error(cldData.error?.message || 'Cloudinary upload failed');

      // 3. Save to DB
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedCat,
          type: 'pdf',
          title: pdfTitle,
          fileUrl: cldData.secure_url
        })
      });

      if (res.ok) {
        toast.success('Material Added Successfully');
        setPdfTitle('');
        setPendingPdf(null);
        const resP = await fetch(`/api/admin/pdfs?sectionId=${selectedCat}`);
        const d = await resP.json();
        setPdfs(d.pdfs || []);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Upload failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error during upload');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleBlock = async (userId: number, isBlocked: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isBlocked: !isBlocked })
      });
      if (res.ok) {
        toast.success(`User ${!isBlocked ? 'blocked' : 'unblocked'}`);
        fetchData();
      }
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleUpdatePdf = async (pdfId: number) => {
    try {
      const res = await fetch('/api/admin/pdfs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfId, title: editPdfTitle })
      });
      if (res.ok) {
        toast.success('PDF updated');
        setEditingPdfId(null);
        if (selectedCat) {
           const resP = await fetch(`/api/admin/pdfs?sectionId=${selectedCat}`);
           const d = await resP.json();
           setPdfs(d.pdfs || []);
        }
      }
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const startEditingPdf = (pdf: Pdf) => {
    setEditingPdfId(pdf.id);
    setEditPdfTitle(pdf.title);
  };

  const handleDeletePdf = async (pdfId: number) => {
    if (!confirm('Are you sure you want to delete this PDF?')) return;
    try {
      const res = await fetch('/api/admin/pdfs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfId })
      });
      if (res.ok) {
        toast.success('PDF deleted');
        if (selectedCat) {
           const resP = await fetch(`/api/admin/pdfs?sectionId=${selectedCat}`);
           const d = await resP.json();
           setPdfs(d.pdfs || []);
        }
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading && activeTab === 'content' && categories.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]"><Loader2 className="animate-spin text-[#C5A059]" size={40} /></div>;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-3 md:p-6 lg:p-10 font-sans overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        {/* DASHBOARD HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#5D4037] flex items-center gap-3">
              <ShieldCheck className="text-[#C5A059]" size={36} /> Executive Dashboard
            </h1>
          </div>
          
          <div className="flex p-1 bg-white border border-[#C5A059]/10 rounded-2xl shadow-sm">
            {(['content', 'users', 'orders'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[#5D4037] text-white shadow-lg' : 'text-[#A1887F] hover:text-[#5D4037]'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT TAB */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Catalog List */}
            <div className={`lg:col-span-4 space-y-4 ${selectedCat ? 'hidden lg:block' : 'block'}`}>
              <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-bold text-[#5D4037] uppercase tracking-wider">Exam Categories</h2>
                <button 
                  onClick={() => setShowCreateSection(!showCreateSection)}
                  className="hidden lg:flex text-xs font-bold text-[#C5A059] items-center gap-1.5 hover:underline"
                >
                  <Plus size={14} /> {showCreateSection ? 'Cancel' : 'Create New'}
                </button>
              </div>

              {showCreateSection ? (
                <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-[#C5A059]/30 space-y-4">
                  <div className="space-y-3">
                    <input 
                      type="text" placeholder="Section Title (e.g. UPSC Prelims)" 
                      className="w-full bg-[#FDFBF7] border border-[#C5A059]/20 rounded-xl px-4 py-3 text-sm focus:outline-none"
                      value={newSec.title} onChange={e => setNewSec({...newSec, title: e.target.value})}
                    />
                    <input 
                      type="text" placeholder="Subtitle" 
                      className="w-full bg-[#FDFBF7] border border-[#C5A059]/20 rounded-xl px-4 py-3 text-sm focus:outline-none"
                      value={newSec.subtitle} onChange={e => setNewSec({...newSec, subtitle: e.target.value})}
                    />
                  </div>
                  <button onClick={handleCreateSection} className="w-full bg-[#C5A059] text-white py-3 rounded-xl text-sm font-bold">Confirm Creation</button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCat(cat.id)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${selectedCat === cat.id ? 'bg-white border-[#5D4037] shadow-lg' : 'bg-white/50 border-[#C5A059]/10'}`}
                    >
                      <div className="overflow-hidden">
                        <p className={`font-bold text-sm truncate ${selectedCat === cat.id ? 'text-[#5D4037]' : 'text-[#3E2723]'}`}>{cat.title}</p>
                        <p className="text-[11px] text-[#A1887F] font-medium truncate">{cat.subtitle || 'General Material'}</p>
                      </div>
                      <MoreVertical size={16} className={selectedCat === cat.id ? 'text-[#C5A059]' : 'text-[#A1887F]/20'} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Editor Area */}
            <div className={`lg:col-span-8 ${selectedCat ? 'block' : 'hidden lg:block'}`}>
              {selectedCat ? (
                <div className="bg-white rounded-[2rem] border border-[#C5A059]/20 shadow-xl p-5 md:p-10 space-y-8 md:space-y-10">
                  <button 
                    onClick={() => setSelectedCat(null)}
                    className="lg:hidden flex items-center gap-2 text-xs font-bold text-[#C5A059] mb-4 uppercase tracking-widest"
                  >
                    <ArrowLeft size={14} /> Back to Categories
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pb-8 md:pb-10 border-b border-[#C5A059]/10 items-start">
                    {/* Metadata */}
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#A1887F] uppercase tracking-widest pl-1">Display Title</label>
                        <input 
                          type="text" className="w-full bg-[#FDFBF7] border border-[#C5A059]/10 rounded-2xl px-5 py-3.5 text-base font-bold text-[#3E2723] focus:border-[#C5A059]/40 focus:ring-4 focus:ring-[#C5A059]/5 transition-all outline-none" 
                          value={editTitle} 
                          onChange={e => setEditTitle(e.target.value)}
                          onBlur={handleUpdateSection}
                          placeholder="Section Title"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#A1887F] uppercase tracking-widest pl-1">Tagline</label>
                        <input 
                          type="text" className="w-full bg-[#FDFBF7] border border-[#C5A059]/10 rounded-2xl px-5 py-3.5 text-sm text-[#A1887F] focus:border-[#C5A059]/40 focus:ring-4 focus:ring-[#C5A059]/5 transition-all outline-none" 
                          value={editSubtitle} 
                          onChange={e => setEditSubtitle(e.target.value)}
                          onBlur={handleUpdateSection}
                          placeholder="Curriculum Tagline"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#A1887F] uppercase tracking-widest pl-1">Section Price (₹)</label>
                        <input 
                          type="text" className="w-full bg-[#FDFBF7] border border-[#C5A059]/10 rounded-2xl px-5 py-3.5 text-sm text-[#5D4037] font-bold focus:border-[#C5A059]/40 focus:ring-4 focus:ring-[#C5A059]/5 transition-all outline-none" 
                          value={editPrice} 
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            setEditPrice(val);
                          }}
                          onBlur={handleUpdateSection}
                          placeholder="499"
                        />
                      </div>
                    </div>

                    {/* Banner */}
                    <div className="flex flex-col items-center justify-center h-full">
                       <label className="text-[10px] font-bold text-[#A1887F] uppercase tracking-widest self-start pl-1 mb-1">Section Banner</label>
                       <div className="w-full aspect-[2/1] relative bg-[#FDFBF7] border-2 border-dashed border-[#C5A059]/30 rounded-3xl overflow-hidden group">
                         {categories.find(c => c.id === selectedCat)?.banner_url ? (
                           <div className="relative w-full h-full">
                             <Image 
                               src={categories.find(c => c.id === selectedCat)!.banner_url!} 
                               alt="Banner" 
                               fill 
                               unoptimized
                               className="object-cover transition-transform group-hover:scale-105" 
                             />
                             <div className="absolute top-2 right-2 flex gap-2">
                               <a 
                                 href={categories.find(c => c.id === selectedCat)!.banner_url} 
                                 target="_blank" 
                                 className="bg-white/90 p-1.5 rounded-lg text-[10px] font-bold text-[#5D4037] shadow-sm hover:bg-white"
                               >
                                 Open Raw
                               </a>
                             </div>
                           </div>
                         ) : (
                           <div className="absolute inset-0 flex flex-col items-center justify-center text-[#C5A059]/40">
                             <ImageIcon size={48} className="mb-2" />
                             <p className="text-[10px] font-bold uppercase">No Banner Configured</p>
                           </div>
                         )}
                         <label className="absolute inset-0 flex items-center justify-center bg-[#5D4037]/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Upload size={24} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} disabled={uploading} />
                         </label>
                       </div>
                    </div>
                  </div>

                  {/* Catalog Inventory */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-base font-bold text-[#5D4037] flex items-center gap-2">
                        <FileText size={20} className="text-[#C5A059]" /> Catalog Inventory
                      </h3>
                      <span className="bg-[#FFFBF2] text-[#C5A059] text-[10px] font-bold px-3 py-1 rounded-full border border-[#C5A059]/20">{pdfs.length} Modules</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pdfs.map((pdf) => (
                        <div key={pdf.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#FDFBF7] rounded-2xl border border-[#C5A059]/10 group gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2.5 bg-white rounded-xl border border-[#C5A059]/10 text-[#C5A059] shadow-sm flex-shrink-0"><FileText size={20} /></div>
                            <div className="min-w-0 flex-1">
                              {editingPdfId === pdf.id ? (
                                <div className="space-y-2">
                                  <input 
                                    className="w-full bg-white border border-[#C5A059]/30 rounded-lg px-2 py-1 text-sm font-bold text-[#5D4037] outline-none"
                                    value={editPdfTitle} onChange={e => setEditPdfTitle(e.target.value)}
                                  />
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm font-bold text-[#5D4037] truncate">{pdf.title}</p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 justify-end sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                            {editingPdfId === pdf.id ? (
                              <>
                                <button onClick={() => handleUpdatePdf(pdf.id)} className="p-2 text-emerald-600 hover:text-emerald-700 bg-white rounded-lg border border-emerald-100" title="Save Changes">
                                  <Check size={16} />
                                </button>
                                <button onClick={() => setEditingPdfId(null)} className="p-2 text-red-500 hover:text-red-600 bg-white rounded-lg border border-red-100" title="Cancel">
                                  <X size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEditingPdf(pdf)} className="p-2 text-[#C5A059] hover:text-[#5D4037] bg-white rounded-lg border border-[#C5A059]/20" title="Edit Info">
                                  <Pencil size={16} />
                                </button>
                                <Link href={`/view/${pdf.id}`} target="_blank" className="p-2 text-[#C5A059] hover:text-[#5D4037] bg-white rounded-lg border border-[#C5A059]/20" title="Review PDF">
                                  <Eye size={16} />
                                </Link>
                                <button onClick={() => handleDeletePdf(pdf.id)} className="p-2 text-red-500 hover:text-red-700 bg-white rounded-lg border border-red-100" title="Delete PDF">
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                                           <div className="p-4 bg-white border-2 border-dashed border-[#C5A059]/30 rounded-[1.5rem] space-y-4 flex flex-col justify-center">
                         <div className="space-y-1">
                           <label className="text-[10px] font-bold text-[#A1887F] uppercase tracking-widest pl-1">Document Title</label>
                           <input 
                             type="text" placeholder="e.g. History Notes Part 1" 
                             className="w-full bg-[#FDFBF7] border border-[#C5A059]/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]/50"
                             value={pdfTitle} onChange={e => setPdfTitle(e.target.value)}
                           />
                         </div>

                         <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                             <div className="flex-1 mt-4">
                                <label className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all border-2 border-dashed ${pendingPdf ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-[#C5A059]/20 text-[#A1887F] hover:bg-[#FDFBF7]'}`}>
                                  {pendingPdf ? <CheckCircle2 size={14} /> : <FileText size={14} />} 
                                  <span className="text-[11px] font-bold truncate max-w-[100px]">
                                    {pendingPdf ? pendingPdf.name : 'Select File'}
                                  </span>
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept=".pdf,.ppt,.pptx" 
                                    onChange={(e) => setPendingPdf(e.target.files?.[0] || null)} 
                                  />
                                </label>
                              </div>
                            </div>

                            <button 
                              onClick={handlePdfUpload}
                              disabled={uploading || !pendingPdf || !pdfTitle}
                              className={`w-full py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md ${uploading || !pendingPdf || !pdfTitle ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-[#5D4037] text-white hover:bg-[#3E2723] active:scale-95'}`}
                            >
                              {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />} 
                              {uploading ? 'Processing sync...' : pendingPdf ? 'Click to Confirm Sync' : 'Complete All Fields'}
                            </button>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-white/40 border-2 border-dashed border-[#C5A059]/10 rounded-[3rem]">
                   <Plus size={48} className="text-[#C5A059]/20 mb-4" />
                   <h2 className="text-xl text-[#5D4037] font-bold">Select a Segment</h2>
                   <p className="text-sm text-[#A1887F] mt-2">Manage banners, curriculum, and assets from here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-[2.5rem] border border-[#C5A059]/20 overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="bg-[#5D4037] text-white">
                  <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-[#FFFBF2]">Profile</th>
                  <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-[#FFFBF2] text-center">Status</th>
                  <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-[#FFFBF2] text-right">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-[#C5A059]/10">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-[#FFFBF2]/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${u.is_admin ? 'bg-[#C5A059] text-white' : 'bg-[#5D4037]/10 text-[#5D4037]'}`}>
                             {u.name?.charAt(0) || 'U'}
                           </div>
                           <div>
                             <p className="font-bold text-[#5D4037]">{u.name}{u.is_admin && ' (Admin)'}</p>
                             <p className="text-xs text-[#A1887F]">{u.email}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${u.is_blocked ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                          {u.is_blocked ? 'Suspended' : 'Active Member'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {!u.is_admin && (
                          <button onClick={() => handleToggleBlock(u.id, u.is_blocked)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${u.is_blocked ? 'bg-[#5D4037] text-white' : 'bg-white text-red-500 border border-red-100 hover:bg-red-50'}`}>
                            {u.is_blocked ? 'Reinstate' : 'Suspend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-[2.5rem] border border-[#C5A059]/20 overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="bg-[#5D4037] text-white">
                  <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-[#FFFBF2]">Trace</th>
                  <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-[#FFFBF2]">Entity</th>
                  <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-[#FFFBF2]">Module</th>
                  <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-[#FFFBF2] text-right">Value</th>
                </tr></thead>
                <tbody className="divide-y divide-[#C5A059]/10">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-[#FFFBF2]/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-mono text-xs text-[#5D4037] font-bold">{o.order_id}</p>
                        <p className="text-[10px] text-[#A1887F] font-bold uppercase mt-1">{new Date(o.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-[#5D4037]">{o.customer_name}</p>
                        <p className="text-xs text-[#A1887F] font-medium">{o.customer_email}</p>
                      </td>
                      <td className="px-8 py-6"><span className="text-xs font-bold text-[#5D4037]">{o.section_title}</span></td>
                      <td className="px-8 py-6 text-right"><p className="font-serif font-black text-[#5D4037] text-xl">₹{o.amount || '0'}</p></td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={4} className="px-8 py-20 text-center opacity-40"><p className="font-serif text-xl font-bold italic">No transactions found.</p></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
