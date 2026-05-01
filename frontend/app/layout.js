import './globals.css';

export const metadata = {
  title: 'Dashboard Sekolah'
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}