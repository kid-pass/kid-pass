"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Paper,
  List,
  Divider,
  ClickAwayListener,
  Popper,
  ListItemButton,
} from "@mui/material";
import { useRouter } from "next/navigation";
import useChldrnList from "@/hook/useChldrnList";
import useChldrnListStore, { ChildInfo } from "@/store/useChldrnListStore";
import PersonIcon from "@mui/icons-material/Person";
import dayjs from "dayjs";
import "dayjs/locale/ko"; // 한국어 로케일 추가

dayjs.locale("ko"); // 한국어 로케일 설정

interface ProfileHeaderProps {
  icon?: React.ReactNode;
  path?: string;
}

const ProfileHeader = ({ icon, path }: ProfileHeaderProps) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const profileRef = useRef<HTMLButtonElement>(null);
  const { getChldrnList } = useChldrnList();
  const setCurrentKid = useChldrnListStore((state) => state.setCurrentKid);
  const currentKid = useChldrnListStore((state) => state.currentKid);
  const today = dayjs().format("M월 D일");
  const childrenList = mounted ? getChldrnList() : [];

  useEffect(() => {
    setMounted(true);
  }, []);

  // 현재 선택된 아이 정보 찾기 (null 체크 추가)
  const currentChild = mounted
    ? childrenList?.find(
        (child: { chldrnNo: { toString: () => string | null } }) =>
          child.chldrnNo.toString() === currentKid
      ) || childrenList?.[0]
    : null;

  const handleChildSelect = (childNo: string) => {
    if (mounted) {
      setCurrentKid(childNo);
      localStorage.setItem("currentkid", childNo);
      setShowModal(false);
      setAnchorEl(null);
    }
  };

  useEffect(() => {
    if (mounted) {
      const storedKid = localStorage.getItem("currentkid");
      if (storedKid) {
        setCurrentKid(storedKid);
      }
    }
  }, [mounted, setCurrentKid]);

  const handlePath = () => {
    if (path) {
      router.push(path);
    }
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setShowModal(!showModal);
  };

  const handleClose = () => {
    setShowModal(false);
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="static"
      color="default"
      elevation={1}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ minHeight: "56px", px: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* 왼쪽 섹션 */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 500,
                color: "text.secondary",
              }}
            >
              {`${today}, 오늘`}
            </Typography>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 1, height: 16, my: "auto" }}
            />

            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              {`${currentChild?.chldrnNm || ""} D+32`}
            </Typography>
          </Box>

          {/* 오른쪽 섹션 */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {icon && (
              <IconButton color="inherit" onClick={handlePath} sx={{ ml: 1 }}>
                {icon}
              </IconButton>
            )}

            <IconButton
              ref={profileRef}
              color="inherit"
              onClick={handleProfileClick}
              sx={{ ml: 1 }}
            >
              <PersonIcon />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>

      {/* 드롭다운 메뉴 */}
      <Popper
        open={showModal}
        anchorEl={anchorEl}
        placement="bottom-end"
        style={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            elevation={3}
            sx={{
              width: 200,
              maxHeight: 300,
              overflow: "auto",
              mt: 0.5,
              borderRadius: 1,
            }}
          >
            <List sx={{ p: 0 }}>
              {childrenList.map((list: ChildInfo, index: number) => (
                <React.Fragment key={list.chldrnNo}>
                  <ListItemButton
                    onClick={() => handleChildSelect(list.chldrnNo)}
                    sx={{
                      py: 1.5,
                    }}
                  >
                    <Typography variant="body2">{list.chldrnNm}</Typography>
                  </ListItemButton>
                  {index !== childrenList.length - 1 && (
                    <Divider component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </AppBar>
  );
};

export default ProfileHeader;
