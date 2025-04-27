'use client';

import { useRouter } from 'next/navigation';

interface NavigationActions {
	goBack: () => void;
	goHome: () => void;
}

const useNavigation = (): NavigationActions => {
	const router = useRouter();

	const goBack = () => {
		router.back();
	};

	const goHome = () => {
		router.push('/');
	};

	return { goBack, goHome };
};

export default useNavigation;
