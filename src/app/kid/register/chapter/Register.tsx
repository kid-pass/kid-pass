'use client';

import React, { useEffect, useState } from 'react';
import useChapter from '@/hook/useChapter';
import Chapter1 from './Chapter1';
import Chapter2 from './Chapter2';
import Chapter3 from './Chapter3';
import Chapter4 from './Chapter4';
import Chapter5 from './Chapter5';
import useAuth from '@/hook/useAuth';
import Chapter6 from './Chapter6';
import { useChldrnInfoStore } from '@/store/useChldrnInfoStore';
import MobileLayout from '@/components/mantine/MobileLayout';
import { useRouter } from 'next/navigation';

const Register: React.FC = () => {
	const router = useRouter();
	const { getToken } = useAuth();
	const [token, setToken] = useState();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchToken = async () => {
			const accessToken = await getToken();
			setToken(accessToken);
		};

		fetchToken();
	}, []);

	const { chapter, nextChapter, goToChapter } = useChapter({
		totalChapters: 6,
		onComplete: async () => {
			try {
				setLoading(true);
				const store = useChldrnInfoStore.getState();
				const [
					chldrnNm,
					chldrnBrthdy,
					chldrnBdwgh,
					chldrnHeight,
					chldrnHead,
				] = store.details;

				// YYYYMMDD 형식을 YYYY-MM-DD로 변환
				const formattedBirthday = `${chldrnBrthdy.substring(
					0,
					4
				)}-${chldrnBrthdy.substring(4, 6)}-${chldrnBrthdy.substring(
					6,
					8
				)}`;

				// 1. 아이 정보 등록
				const response = await fetch('/api/child/register', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						name: chldrnNm,
						birthDate: formattedBirthday,
						gender: store.chldrnSexdstn,
						weight: parseFloat(chldrnBdwgh),
						height: parseFloat(chldrnHeight),
						headCircumference: parseFloat(chldrnHead),
						ageType: store.age,
						allergies: store.allergic,
						symptoms: store.symptom,
						memo: store.etc,
					}),
				});

				const data = await response.json();

				if (response.ok) {
					const childId = data.data.id;

					// 2. 백신 일정 생성 API 호출
					const vaccineResponse = await fetch(
						'/api/vaccine/schedule',
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${token}`,
							},
							body: JSON.stringify({
								childId: childId,
								birthDate: formattedBirthday,
							}),
						}
					);

					const vaccineData = await vaccineResponse.json();
					if (!vaccineResponse.ok) {
						console.error(
							'백신 일정 생성 실패:',
							vaccineData.message
						);
					}

					// 등록 완료 후 홈
					router.push('/');
				} else {
					throw new Error(data.message);
				}
			} catch (error) {
				console.error('아이 등록 에러:', error);
				alert('아이 정보 등록에 실패했습니다.');
			} finally {
				setLoading(false);
			}
		},
	});

	return (
		<MobileLayout
			showHeader={true}
			headerType="profile"
			title="홈"
			showBottomNav={true}
			currentRoute="/"
		>
			<div>
				{chapter === 1 && (
					<Chapter1 onNext={nextChapter} goToChapter={() => {}} />
				)}
				{chapter === 2 && (
					<Chapter2 onNext={nextChapter} goToChapter={() => {}} />
				)}
				{chapter === 3 && (
					<Chapter3 onNext={nextChapter} goToChapter={() => {}} />
				)}
				{chapter === 4 && (
					<Chapter4 onNext={nextChapter} goToChapter={goToChapter} />
				)}
				{chapter === 5 && (
					<Chapter5 onNext={nextChapter} goToChapter={() => {}} />
				)}
				{chapter === 6 && (
					<Chapter6 onNext={nextChapter} goToChapter={() => {}} />
				)}
				{loading && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
					</div>
				)}
			</div>
		</MobileLayout>
	);
};

export default Register;
