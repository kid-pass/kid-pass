import useChldrnListStore from "@/store/useChldrnListStore";

const useChldrnList = () => {
  const { children, setChldrnList } = useChldrnListStore();

  const getChldrnList = () => {
    // 1. Zustand store 확인
    if (children.length > 0) {
      return children;
    }

    // 2. localStorage 확인
    const stored = localStorage.getItem("chldrnList");
    if (stored) {
      const parsedData = JSON.parse(stored);
      const storedChildren = parsedData.state.children;

      if (storedChildren?.length > 0) {
        setChldrnList(storedChildren);
        return storedChildren;
      }
    }

    return null;
  };

  return { getChldrnList };
};

export default useChldrnList;
