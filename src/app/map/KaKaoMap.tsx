'use client';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import React, { useState, useEffect } from 'react';
import useGeolocation from '@/hook/useGeolocation';
import axios from 'axios';
import { Label } from '@/elements/label/Label';
import styles from './map.module.css';

interface HospitalData {
	dutyAddr: string; // 전체 주소
	dutyAddr1Depth: string; // 시/구 단위
	dutyAddr2Depth: string; // 동 단위
	dutyAddr3Depth: string; // 상세 주소
	dutyEtc: string; // 기타 정보
	dutyName: string;
	dutyTel1: string;
	// 요일별 영업시간 (1~8)
	dutyTime1s: string;
	dutyTime1c: string;
	dutyTime2s: string;
	dutyTime2c: string;
	dutyTime3s: string;
	dutyTime3c: string;
	dutyTime4s: string;
	dutyTime4c: string;
	dutyTime5s: string;
	dutyTime5c: string;
	dutyTime6s: string;
	dutyTime6c: string;
	dutyTime7s: string;
	dutyTime7c: string;
	dutyTime8s: string; // 공휴일
	dutyTime8c: string; // 공휴일
	id: number;
	wgs84Lat: number; // 위도
	wgs84Lon: number; // 경도
}

const calculateDistance = (
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
): number => {
	const R = 6371;
	const dLat = (lat2 - lat1) * (Math.PI / 180);
	const dLon = (lon2 - lon1) * (Math.PI / 180);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * (Math.PI / 180)) *
			Math.cos(lat2 * (Math.PI / 180)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};

const KakaoMap = () => {
	const [loading] = useKakaoLoader({
		appkey: process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY as string,
	});
	const [hospitalData, setHospitalData] = useState<HospitalData[] | null>(
		null
	);

	const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

	const { location } = useGeolocation();

	useEffect(() => {
		const fetchHospitalData = async () => {
			if (location?.latitude && location?.longitude) {
				try {
					const response = await axios.get(
						`http://localhost:8071/api/data/hsptl/getNearHsptl?page=1&pageSize=5&lon=${location.longitude}&lat=${location.latitude}&limit=100000`
					);
					setHospitalData(response.data.data.list);
				} catch (error) {
					console.error('Error fetching hospital data:', error);
				}
			}
		};

		if (location?.latitude && location?.longitude) {
			setMapCenter({ lat: location.latitude, lng: location.longitude });
			fetchHospitalData();
		}
	}, [location]);

	if (loading) return <div>Loading...</div>;

	return (
		<>
			{location && (
				<Map
					center={mapCenter}
					style={{ width: '100%', height: '450px' }}
					level={5}
					isPanto={false}
					draggable={true}
				>
					{location && (
						<MapMarker
							position={{
								lat: location.latitude,
								lng: location.longitude,
							}}
						>
							<div style={{ padding: '5px', color: '#000' }}>
								내 위치
							</div>
						</MapMarker>
					)}
					{location &&
						hospitalData?.map((hospital) => (
							<MapMarker
								key={hospital.id}
								position={{
									lat: hospital.wgs84Lat,
									lng: hospital.wgs84Lon,
								}}
								// InfoWindow가 열릴 때 지도 중심 이동 방지
								infoWindowOptions={{ disableAutoPan: true }}
							>
								<div style={{ padding: '5px', color: '#000' }}>
									{hospital.dutyName}
								</div>
							</MapMarker>
						))}
				</Map>
			)}

			{location &&
				hospitalData?.map((data: HospitalData) => {
					// 현재 위치와 병원 위치 사이의 거리 계산
					const distance = location
						? calculateDistance(
								location.latitude,
								location.longitude,
								data.wgs84Lat,
								data.wgs84Lon
						  )
						: 0;

					return (
						<div className={styles.mapList} key={data.id}>
							<div className="horizonFlexbox space-between">
								<Label text={data.dutyName} css="mapList_1" />
								<Label
									text={`${distance.toFixed(2)}km`}
									css="mapList_1"
								/>
							</div>
						</div>
					);
				})}

			{/*
                    운영시간 표시 UI
                <div className="horizonFlexbox space-between">
                    <Label text="(금) 08:00 ~ 20:00" css="mapList_2" />
                </div> */}
		</>
	);
};

export default KakaoMap;
