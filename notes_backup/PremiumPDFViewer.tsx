import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';

// Set up the worker
// Using the ES module worker for Vite
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PremiumPDFViewerProps {
    fileUrl: string;
    onClose: () => void;
    title: string;
}

export const PremiumPDFViewer: React.FC<PremiumPDFViewerProps> = ({ fileUrl, onClose, title }) => {
    const { user } = useAuth();
    const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [isBlurred, setIsBlurred] = useState(true);
    const [autoScaleApplied, setAutoScaleApplied] = useState(false);
    const [watermarkOffset, setWatermarkOffset] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderTaskRef = useRef<any>(null);

    // Load PDF
    useEffect(() => {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        loadingTask.promise.then(
            (doc) => {
                setPdf(doc);
                setNumPages(doc.numPages);
            },
            (error) => {
                console.error('Error loading PDF:', error);
            }
        );
    }, [fileUrl]);

    // Render Page
    const renderPage = useCallback(async (pageNum: number, currentScale: number) => {
        if (!pdf || !canvasRef.current) return;

        try {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: currentScale });
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (!context) return;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
                canvas: canvas,
            };

            if (renderTaskRef.current) {
                await renderTaskRef.current.cancel();
            }

            const renderTask = page.render(renderContext);
            renderTaskRef.current = renderTask;
            await renderTask.promise;
            renderTaskRef.current = null;

            // Draw Watermark
            if (user) {
                const watermarkText = `${user.name} (${user.email})`;
                context.font = 'bold 24px Inter, system-ui, sans-serif';
                context.fillStyle = 'rgba(180, 180, 180, 0.3)';
                context.textAlign = 'center';

                context.save();
                context.translate(canvas.width / 2, canvas.height / 2);
                context.rotate(-Math.PI / 4);

                // Repeating watermark for better protection
                // Add jitter to make it harder to remove via software
                for (let i = -5; i <= 5; i++) {
                    for (let j = -2; j <= 2; j++) {
                        context.fillText(watermarkText, j * 400 + watermarkOffset.x, i * 200 + watermarkOffset.y);
                    }
                }
                context.restore();
            }
        } catch (error: any) {
            if (error.name === 'RenderingCancelledException') return;
            console.error('Error rendering page:', error);
        }
    }, [pdf, user, watermarkOffset]);

    const fitToWidth = useCallback(async () => {
        if (!pdf || !containerRef.current) return;
        try {
            const page = await pdf.getPage(currentPage);
            const viewport = page.getViewport({ scale: 1 });
            const containerWidth = containerRef.current.clientWidth - (window.innerWidth < 768 ? 20 : 64);
            const newScale = containerWidth / viewport.width;
            setScale(Math.min(newScale, 2.5)); // Don't over-scale on large monitors
        } catch (error) {
            console.error('Error fitting to width:', error);
        }
    }, [pdf, currentPage]);

    // Apply auto-scale once on load
    useEffect(() => {
        if (pdf && !autoScaleApplied && containerRef.current) {
            fitToWidth();
            setAutoScaleApplied(true);
        }
    }, [pdf, autoScaleApplied, fitToWidth]);

    useEffect(() => {
        if (pdf) {
            renderPage(currentPage, scale);
        }
    }, [pdf, currentPage, scale, renderPage]);

    // Security Measures
    useEffect(() => {
        const handleBlur = () => {
            setIsBlurred(true);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setIsBlurred(true);
            }
        };

        const handleBeforePrint = () => {
            setIsBlurred(true);
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const handleResize = () => {
            // Only blur if it was a significant resize (like rotation)
            // But actually, for security, sticking to original requirement unless it creates UX issues
            // Let's keep blur on resize but we might need to recalculate scale if user clicks "Read" again
            setIsBlurred(true);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // List of allowed keys (navigation only)
            const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'];

            if (!allowedKeys.includes(e.key)) {
                setIsBlurred(true);

                // Block specific dangerous keys
                if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'c' || e.key === 's' || e.key === 'u')) {
                    e.preventDefault();
                }
                if (e.key === 'PrintScreen' || e.key === 'F12') {
                    e.preventDefault();
                }
            }
        };

        // Aggressive focus tracking
        window.addEventListener('blur', handleBlur);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('resize', handleResize);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        // For tactile interaction (mobile)
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 2) setIsBlurred(true); // Detect multi-finger gestures
        });

        // Mouse leave detection (if mouse leaves the window, blur)
        const handleMouseLeave = () => {
            setIsBlurred(true);
        };
        document.addEventListener('mouseleave', handleMouseLeave);

        // Moving watermark interval
        const watermarkInterval = setInterval(() => {
            setWatermarkOffset({
                x: Math.random() * 20 - 10,
                y: Math.random() * 20 - 10
            });
        }, 3000);

        return () => {
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mouseleave', handleMouseLeave);
            clearInterval(watermarkInterval);
        };
    }, []);

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, numPages));

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
            {/* Header */}
            <div className="w-full max-w-5xl flex items-center justify-between p-4 text-white bg-black/50 md:bg-transparent backdrop-blur-md md:backdrop-blur-none z-[110]">
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold truncate max-w-[200px] md:max-w-md">{title}</h2>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Premium Study Material</p>
                </div>

                <div className="flex items-center gap-1 md:gap-4">
                    <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1 border border-white/10">
                        <Button variant="ghost" size="icon" onClick={handleZoomOut} className="text-white hover:bg-white/20 h-8 w-8 rounded-lg">
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-[10px] font-black w-8 md:w-10 text-center">{Math.round(scale * 100)}%</span>
                        <Button variant="ghost" size="icon" onClick={handleZoomIn} className="text-white hover:bg-white/20 h-8 w-8 rounded-lg">
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                        <div className="w-[1px] h-4 bg-white/10 mx-1 hidden md:block" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fitToWidth}
                            className="hidden md:flex text-[10px] font-bold h-8 px-2 rounded-lg hover:bg-white/20"
                        >
                            FIT WIDTH
                        </Button>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-white hover:bg-red-500/80 h-10 w-10 rounded-xl bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Viewer Container */}
            <div
                ref={containerRef}
                className="relative flex-1 w-full max-w-5xl bg-[#1a1a1a] md:rounded-3xl overflow-auto flex justify-center shadow-2xl select-none no-scrollbar"
                onContextMenu={(e) => e.preventDefault()}
            >
                <div className={`transition-all duration-700 ease-in-out ${isBlurred ? 'blur-3xl grayscale opacity-50 scale-95' : 'blur-0 grayscale-0 opacity-100 scale-100'}`}>
                    <canvas ref={canvasRef} className="shadow-2xl my-4 md:my-8" />
                </div>

                {/* Blur Overlay */}
                {isBlurred && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm">
                        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl text-center space-y-6 max-w-sm mx-4 border border-white/20 animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-[#B45309]/10 rounded-[28px] flex items-center justify-center text-[#B45309] mx-auto shadow-inner">
                                <Eye className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-[#3a2d28] tracking-tight">Access Locked</h3>
                                <p className="text-stone-500 text-sm font-medium leading-relaxed">
                                    To protect our premium content, the viewer blurs when you switch tabs or attempt to capture.
                                </p>
                            </div>
                            <Button
                                onClick={() => setIsBlurred(false)}
                                className="w-full bg-[#5D4037] hover:bg-[#4E342E] text-white py-8 rounded-2xl font-bold text-lg shadow-xl shadow-[#5D4037]/20 transition-all active:scale-95"
                            >
                                Read PDF Now
                            </Button>
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                                Protected by Neha Education Security
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Controls */}
            <div className="w-full max-w-5xl p-4 flex items-center justify-center gap-4 md:gap-8 text-white bg-black/50 md:bg-transparent backdrop-blur-md md:backdrop-blur-none z-[110]">
                <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={handlePrevPage}
                    className="bg-white/10 border-transparent text-white hover:bg-white/20 rounded-xl h-12 px-4 md:px-6 font-bold"
                >
                    <ChevronLeft className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Previous</span>
                </Button>

                <div className="bg-white/10 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-white/50">Page</span>
                    <span className="text-lg font-black">{currentPage}</span>
                    <span className="text-xs font-black uppercase tracking-widest text-white/30">/</span>
                    <span className="text-lg font-black text-white/50">{numPages}</span>
                </div>

                <Button
                    variant="outline"
                    disabled={currentPage === numPages}
                    onClick={handleNextPage}
                    className="bg-white/10 border-transparent text-white hover:bg-white/20 rounded-xl h-12 px-4 md:px-6 font-bold"
                >
                    <span className="hidden md:inline">Next</span> <ChevronRight className="w-4 h-4 md:ml-2" />
                </Button>
            </div>

            <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
};
