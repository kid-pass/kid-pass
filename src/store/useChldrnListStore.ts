import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChildInfo {
	chldrnNo: string;
	chldrnNm: string;
	chldrnSexdstn: string;
	profileImageUrl: string | null;
	birthDate: string;
}

interface ChldrnListState {
	children: ChildInfo[];
	setChldrnList: (info: ChildInfo[]) => void;
	updateChild: (chldrnNo: string, updates: Partial<ChildInfo>) => void;
}

const useChldrnListStore = create<ChldrnListState>()(
	persist(
		(set) => ({
			children: [],
			setChldrnList: (info) => set(() => ({ children: info })),
			updateChild: (chldrnNo, updates) =>
				set((state) => ({
					children: state.children.map((child) =>
						child.chldrnNo === chldrnNo
							? { ...child, ...updates }
							: child
					),
				})),
		}),
		{
			name: 'chldrnList',
		}
	)
);

export default useChldrnListStore;
