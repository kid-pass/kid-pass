"use client";

import React from "react";
import { Modal, Box, Backdrop } from "@mui/material";
import { useModalStore } from "@/store/useModalStore";

const CustomModal: React.FC = () => {
  const { isOpen, closeModal, comp, position } = useModalStore();

  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: position === "center" ? "50%" : "auto",
          left: position === "center" ? "50%" : "auto",
          bottom: position !== "center" ? 0 : "auto",
          width: "100%",
          maxWidth: position === "center" ? "500px" : "100%",
          maxHeight: "90vh",
          transform: position === "center" ? "translate(-50%, -50%)" : "none",
          bgcolor: "background.paper",
          borderRadius: position === "center" ? 2 : "12px 12px 0 0",
          boxShadow: 24,
          p: 4,
          overflow: "auto",
          outline: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {comp}
      </Box>
    </Modal>
  );
};

export default CustomModal;
