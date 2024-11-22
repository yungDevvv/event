import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Respa - Tapahtumat",
  description: "Respasolutions Oy",
  icons: {
    icon: "/site_logo.png",
  },
};

function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans tracking-wide h-full min-h-screen`}
      >
        {children}
        {/* <ModalProvider /> */}
        <Toaster />
      </body>
    </html>
  );
}

export default RootLayout;
