import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { fraunces, manrope } from '@/lib/fonts';
import { ThemeProvider } from '@/components/theme-provider';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/constants';
import { getSiteUrl } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    'Tổng hợp sản phẩm và ưu đãi chọn lọc từ Shopee, Lazada, TikTok Shop và nhiều nền tảng khác.',
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'vi_VN',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${fraunces.variable} min-h-screen antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{ className: 'font-sans' }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
