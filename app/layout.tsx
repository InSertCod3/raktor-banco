import type { Metadata } from 'next';
import './css/input.css';
import '@xyflow/react/dist/style.css';
import { Toaster } from 'react-hot-toast';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'MayDove | Visual Content Ideation',
  description: 'MayDove is a visual-first workspace to turn one core idea into LinkedIn, Facebook, and Instagram drafts with reusable mind maps.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
          <Toaster />
        </body>
        <script src="//code.tidio.co/m78662edpqll6cxelwzobatqa0dpczy8.js" async></script>
      </html>
    </ClerkProvider>
  );
}
