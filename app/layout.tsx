import type { Metadata } from 'next';
import './css/input.css';
import '@xyflow/react/dist/style.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Raktor | Crafting the Future with You',
  description: 'Raktor builds high-quality MVP apps for startups and small businesses for just $1,000—fast, functional, and ready to grow.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
      <script src="//code.tidio.co/ldvmha19kg5t6vuilfqjatks5xmkazk6.js" async></script>
    </html>
  );
}
