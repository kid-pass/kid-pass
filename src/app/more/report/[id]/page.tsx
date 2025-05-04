'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import instance from '@/utils/axios';
import MobileLayout from '@/components/mantine/MobileLayout';
import {
	Box,
	Button,
	Image,
	LoadingOverlay,
	useMantineTheme,
} from '@mantine/core';
import useNavigation from '@/hook/useNavigation';
import useAuth from '@/hook/useAuth';
import { useToast } from '@/hook/useToast';

const App = () => {
	const theme = useMantineTheme();
	const pathname = usePathname();
	const id = pathname.split('/').pop();
	const { goBack } = useNavigation();
	const [isLoading, setIsLoading] = useState(false);
	const [imageUrl, setImageUrl] = useState('');
	const { getToken } = useAuth();
	const { successToast, errorToast } = useToast();

	const fetchReportDetail = async () => {
		try {
			const res = await instance.get(`/report/${id}`);
			setImageUrl(res.data.data.imageUrl);
			setIsLoading(false);
		} catch (err) {
			console.error('리포트 가져오기 실패:', err);
		}
	};

	const handleDelete = async () => {
		try {
			const token = await getToken();
			setIsLoading(true);

			const response = await instance.delete(`/report?reportId=${id}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.data) {
				// 성공 메시지 표시
				successToast({
					title: '삭제 완료',
					message: '리포트가 성공적으로 삭제되었습니다.',
					position: 'top-center',
					autoClose: 2000,
				});

				setIsLoading(false);
				goBack();
			}
		} catch (error) {
			console.error('리포트 삭제 중 오류 발생:', error);
			errorToast({
				title: '삭제 실패',
				message:
					'리포트 삭제 중 문제가 발생했습니다. 다시 시도해주세요.',
				position: 'top-center',
				autoClose: 2000,
			});
		}
	};

	useEffect(() => {
		setIsLoading(true);
		fetchReportDetail();
	}, [id]);

	return (
		<MobileLayout onBack={goBack} title="리포트 상세이미지">
			{imageUrl ? (
				<Box pb="lg" px="md">
					<Image src={imageUrl} alt="리포트 이미지" w="100%" />
					<Button
						fullWidth
						bg={theme.other.statusColors.warning}
						c="#FFFFFF"
						my="lg"
						onClick={handleDelete}
					>
						삭제
					</Button>
				</Box>
			) : (
				<LoadingOverlay visible={isLoading}></LoadingOverlay>
			)}
		</MobileLayout>
	);
};

export default App;
