"use client";

import React from "react";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";

interface MobileBottomNavProps {
  activeNav: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeNav = 0,
}) => {
  const [value, setValue] = React.useState(activeNav);

  React.useEffect(() => {
    setValue(activeNav);
  }, [activeNav]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: 0,
      }}
      elevation={3}
    >
      <BottomNavigation showLabels value={value} onChange={handleChange}>
        <BottomNavigationAction label="홈" icon={<HomeIcon />} />
        <BottomNavigationAction label="검색" icon={<SearchIcon />} />
        <BottomNavigationAction label="찜" icon={<FavoriteIcon />} />
        <BottomNavigationAction label="내정보" icon={<AccountCircleIcon />} />
      </BottomNavigation>
    </Paper>
  );
};
