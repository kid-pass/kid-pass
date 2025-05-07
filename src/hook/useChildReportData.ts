'use client';

// src/hooks/useChildReportData.ts
import instance from '@/utils/axios';

import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useChildReportData(childId: string | null, days: number = 3) {
	// 쿼리 결과 반환
	return useQuery({
		queryKey: ['childReportData', childId, days],
		queryFn: async () => {
			if (!childId) throw new Error('아이 ID가 필요합니다.');

			const response = await instance.get(
				`/report/childReportData?childId=${childId}&days=${days}`
			);

			return response.data.data;
		},
		staleTime: 0,
		// 중요: 쿼리 키가 변경될 때 자동으로 다시 가져오도록 설정
		refetchOnMount: true,
		// 캐시된 데이터가 있어도 쿼리 키가 변경되면 백그라운드에서 항상 리페치
		refetchOnReconnect: true,
		refetchOnWindowFocus: true,
	});
}
