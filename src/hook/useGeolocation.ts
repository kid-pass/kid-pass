import { useState, useEffect } from 'react';

export interface Latlng {
	latitude: number;
	longitude: number;
}

const useGeolocation = () => {
	const [location, setLocation] = useState<Latlng | null>(null);

	useEffect(() => {
		navigator.geolocation.getCurrentPosition(successHandler, errorHandler); // 성공시 successHandler, 실패시 errorHandler 함수가 실행된다.
	}, []);

	const successHandler = (response: {
		coords: { latitude: number; longitude: number };
	}) => {
		const { latitude, longitude } = response.coords;
		setLocation({ latitude, longitude });
	};

	const errorHandler = (error: GeolocationPositionError) => {
		console.log(error);
	};

	return { location };
};

export default useGeolocation;
