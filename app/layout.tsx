import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', weight: ['700'] });

export const metadata: Metadata = {
  title: 'Prime Educational Services',
  description: 'Premium Study Notes & PDF Material',
  icons: {
    icon: [
      { url: '/title.jpeg', href: '/title.jpeg' },
    ],
    shortcut: '/title.jpeg',
    apple: '/title.jpeg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-[#FDFBF7] text-[#3E2723] antialiased`}>
        <Navbar />
        <main className="min-h-screen flex flex-col pt-16">
          {children}
        </main>
        <Footer />
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
