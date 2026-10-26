import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chessboard Memory Task",
  description: "Signal Detection Theory working-memory experiment with chess positions",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
