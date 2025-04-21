import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChildInfo {
	chldrnNo: string;
	chldrnNm: string;
	chldrnSexdstn: string;
	profileImageUrl: string | null;
}
interface ChldrnListState {
	children: ChildInfo[];
	setChldrnList: (info: ChildInfo[]) => void;
}

const useChldrnListStore = create<ChldrnListState>()(
	persist(
		(set) => ({
			children: [],
			setChldrnList: (info) => set(() => ({ children: info })),
		}),
		{
			name: 'chldrnList',
		}
	)
);
export default useChldrnListStore;
