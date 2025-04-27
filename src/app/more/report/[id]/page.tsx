'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import instance from '@/utils/axios';
import MobileLayout from '@/components/mantine/MobileLayout';
import { Image, LoadingOverlay } from '@mantine/core';
import useNavigation from '@/hook/useNavigation';

const DetailPage = () => {
	const pathname = usePathname();
	const id = pathname.split('/').pop();
	const { goBack } = useNavigation();
	const [isLoading, setIsLoading] = useState(false);

	const [imageUrl, setImageUrl] = useState('');

	const fetchReportDetail = async () => {
		try {
			const res = await instance.get(`/report/${id}`);
			setImageUrl(res.data.data.imageUrl);
			setIsLoading(false);
		} catch (err) {
			console.error('리포트 가져오기 실패:', err);
		}
	};

	useEffect(() => {
		setIsLoading(true);
		fetchReportDetail();
	}, [id]);

	return (
		<MobileLayout onBack={goBack} title="리포트 상세이미지">
			{imageUrl ? (
				<Image src={imageUrl} alt="리포트 이미지" w="100%" />
			) : (
				<LoadingOverlay visible={isLoading}></LoadingOverlay>
			)}
		</MobileLayout>
	);
};

export default DetailPage;
