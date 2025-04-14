'use client';

import MobileLayout from '@/components/mantine/MobileLayout';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import ReportContent from './reportContent';

const App = () => {
	const router = useRouter();
	const handleBack = () => {
		() => router.back();
	};

	return (
		<MobileLayout
			showHeader={true}
			headerType="back"
			title="리포트 상세보기"
			showBottomNav={true}
			onBack={handleBack}
		>
			<Suspense fallback={<div>로딩 중...</div>}>
				<ReportContent />
			</Suspense>
		</MobileLayout>
	);
};

export default App;
