import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', weight: ['700'] });

export const metadata: Metadata = {
  title: 'Prime Educational Services – Premium Study Notes',
  description: 'Master UPSC, MPSC, NEET, JEE & more with premium study notes and PDF material.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-[#FDFBF7] text-[#3E2723] antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#FFFBF2', border: '1px solid #C5A059', color: '#3E2723', borderRadius: '12px' },
            success: { iconTheme: { primary: '#C5A059', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
