import React from "react";
import { AppShell, Box } from "@mantine/core";
import BottomNavigation from "./BottomNavigation";
import Header from "./Header";

interface MobileLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  headerType?: "back" | "profile";
  title?: string;
  showBottomNav?: boolean;
  currentRoute?: string;
  onBack?: () => void;
  useWeekCarousel?: boolean;
  calendar?: boolean;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showHeader = true,
  headerType = "back",
  title = "",
  showBottomNav = true,
  currentRoute = "/",
  onBack,
  useWeekCarousel = false,
  calendar = false,
}) => {
  //   const forceShowBottomNav = showBottomNav;
  const forceShowBottomNav = false;

  return (
    <AppShell
      padding={0}
      header={showHeader ? { height: useWeekCarousel ? 140 : 60 } : undefined}
      footer={forceShowBottomNav ? { height: 60 } : undefined}
    >
      {showHeader && (
        <AppShell.Header>
          <Header
            type={headerType}
            title={title}
            onBack={onBack}
            useWeekCarousel={useWeekCarousel}
            calendar={calendar}
          />
        </AppShell.Header>
      )}

      <AppShell.Main>
        <Box
          pt={showHeader ? 20 : 0}
          pb={forceShowBottomNav ? 60 : 0}
          style={
            {
              minHeight: "100%",
              lineHeight: 1,
              "--mantine-line-height-md": "1",
            } as React.CSSProperties
          }
        >
          {children}
        </Box>
      </AppShell.Main>

      {forceShowBottomNav && (
        <AppShell.Footer>
          <BottomNavigation currentRoute={currentRoute} />
        </AppShell.Footer>
      )}
    </AppShell>
  );
};

export default MobileLayout;
