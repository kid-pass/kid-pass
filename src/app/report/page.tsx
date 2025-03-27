'use client';

import MobileLayout from '@/components/mantine/MobileLayout';
import instance from '@/utils/axios';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const App = () => {
	const navigate = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const fetchData = async () => {
			try {
				// URL에서 chldrnNo 파라미터 가져오기
				const chldrnNo = searchParams.get('chldrnNo');

				if (chldrnNo) {
					const response = await instance.get(
						`/child/getChild?childId=${chldrnNo}`
					);
					console.log(response);
				} else {
					console.error('URL에 chldrnNo 파라미터가 없습니다.');
				}
			} catch (error) {
				console.error('데이터 불러오기 실패:', error);
			}
		};

		fetchData();
	}, [searchParams]); // searchParams가 변경될 때마다 재실행

	const handleBack = () => navigate.back();

	return (
		<MobileLayout
			showHeader={true}
			headerType="back"
			title="리포트 상세보기"
			showBottomNav={true}
			onBack={handleBack}
		>
			리포트페이지
		</MobileLayout>
	);
};

export default App;
