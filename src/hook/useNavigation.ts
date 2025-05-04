'use client';

import { useRouter } from 'next/navigation';

interface NavigationActions {
	goBack: () => void;
	goHome: () => void;
	goPage: (path: string) => void; // 새로운 함수 타입 정의
}

const useNavigation = (): NavigationActions => {
	const router = useRouter();

	const goBack = () => {
		router.back();
	};

	const goHome = () => {
		router.push('/');
	};

	const goPage = (path: string) => {
		router.push(path);
	};

	return { goBack, goHome, goPage };
};

export default useNavigation;
