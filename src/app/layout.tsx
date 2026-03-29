import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '校感 Compass',
  description: '基于学生评论证据的高校生活体验选校工具',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
