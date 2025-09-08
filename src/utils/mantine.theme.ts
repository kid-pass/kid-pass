export const bottomModalTheme = {
  centered: true,
  fullScreen: true,
  withCloseButton: false,
  trapFocus: true,
  closeOnEscape: true,
  transitionProps: {
    transition: "slide-up",
    duration: 300,
  } as const,
  styles: {
    title: {
      fontSize: "1.125rem",
      fontWeight: 600,
    },
    root: {
      backgroundColor: "blue",
    },
    header: {
      alignItems: "center",
      justifyContent: "center",
      borderBottom: "1px solid #D9D9D9",
    },
    inner: {
      alignItems: "flex-end",
    },
    content: {
      height: "50%",
      width: "100%",
      minHeight: 390,
      maxWidth: "100%",
      padding: 0,
      margin: 0,
      borderTopLeftRadius: "16px",
      borderTopRightRadius: "16px",
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
  },
};
