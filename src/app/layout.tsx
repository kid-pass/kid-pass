import type { Metadata } from "next";
import localFont from "next/font/local";
import CustomeModal from "@/components/modal/Modal";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";

import { ThemeRegistry } from "@/store/theme-provder";

const pretendard = localFont({
  src: [
    {
      path: "./fonts/Pretendard-Thin.woff",
      weight: "100",
    },
    {
      path: "./fonts/Pretendard-Light.woff",
      weight: "300",
    },
    {
      path: "./fonts/Pretendard-Regular.woff",
      weight: "400",
    },
    {
      path: "./fonts/Pretendard-Medium.woff",
      weight: "500",
    },
    {
      path: "./fonts/Pretendard-Bold.woff",
      weight: "700",
    },
    {
      path: "./fonts/Pretendard-Black.woff",
      weight: "900",
    },
  ],
  variable: "--font-weight-regular",
});

export const metadata: Metadata = {
  title: "Kid Pass",
  description: "Kid Pass Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeRegistry>
            {children}
            <CustomeModal />
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
