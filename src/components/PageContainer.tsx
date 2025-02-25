"use client";

import React from "react";
import { Box } from "@mui/material";
import { MobileBottomNav } from "./MobileBottomNav";
import BackHeader from "./BackHeader";
import ProfileHeader from "./ProfileHeader";

interface PageContainerProps {
  children: React.ReactNode;
  headerType?: "none" | "basic" | "profile";
  headerTitle?: string;
  onBack?: () => void;
  profileIcon?: React.ReactNode;
  profilePath?: string;
  hasBottomNav?: boolean;
  hasPadding?: boolean;
  activeNav?: number;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  headerType = "none",
  headerTitle = "",
  onBack,
  profileIcon,
  profilePath,
  hasBottomNav = false,
  hasPadding = true,
  activeNav = 0,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        maxWidth: "100%",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      {/* 헤더 유형에 따라 다른 헤더 렌더링 */}
      {headerType === "basic" && (
        <BackHeader title={headerTitle} onBack={onBack} />
      )}

      {headerType === "profile" && (
        <ProfileHeader icon={profileIcon} path={profilePath} />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: hasPadding ? 2 : 0,
          py: hasPadding ? 2 : 0,
          pb: hasBottomNav ? 7 : hasPadding ? 2 : 0, // 바텀 네비게이션이 있을 경우 추가 여백
          overflow: "auto",
        }}
      >
        {children}
      </Box>

      {hasBottomNav && <MobileBottomNav activeNav={activeNav} />}
    </Box>
  );
};

export default PageContainer;
