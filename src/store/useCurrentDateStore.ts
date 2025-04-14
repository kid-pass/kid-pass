import dayjs, { Dayjs } from "dayjs";
import { create } from "zustand";

interface CurrentDateStore {
  currentDate: Dayjs;
  setCurrentDate: (date: Dayjs) => void;
}

const useCurrentDateStore = create<CurrentDateStore>((set) => ({
  currentDate: dayjs().hour(23).minute(59).second(59),
  setCurrentDate: (date: Dayjs) => set({ currentDate: date }),
}));

export default useCurrentDateStore;
