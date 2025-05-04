'use client';

import MobileLayout from '@/components/mantine/MobileLayout';
import { Suspense } from 'react';
import ReportContent from './ReportContent';
import useNavigation from '@/hook/useNavigation';

const App = () => {
	const { goBack } = useNavigation();

	return (
		<MobileLayout
			showHeader={true}
			headerType="back"
			title="리포트 상세보기"
			onBack={goBack}
			showBottomNav={true}
		>
			<Suspense fallback={<div>로딩 중...</div>}>
				<ReportContent />
			</Suspense>
		</MobileLayout>
	);
};

export default App;
