"use client";

import React from "react";
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

interface BackHeaderProps {
  title: string;
  onBack?: () => void;
  className?: string;
}

const BackHeader: React.FC<BackHeaderProps> = ({
  title,
  onBack,
  className = "",
}) => {
  return (
    <AppBar
      position="static"
      color="default"
      elevation={1}
      className={className}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Toolbar sx={{ minHeight: "56px" }}>
        {onBack && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onBack}
            aria-label="뒤로 가기"
            sx={{ mr: 1 }}
          >
            <ArrowBack sx={{ fontSize: 24 }} />
          </IconButton>
        )}
        <Typography
          variant="h6"
          component="span"
          sx={{
            fontSize: "1rem",
            fontWeight: 500,
            flexGrow: 1,
            textAlign: onBack ? "left" : "center",
          }}
        >
          {title}
        </Typography>
        {/* 뒤로가기 버튼이 없을 때 중앙 정렬을 유지하기 위한 여백 */}
        {!onBack && <Box sx={{ width: 48 }} />}
      </Toolbar>
    </AppBar>
  );
};

export default BackHeader;
