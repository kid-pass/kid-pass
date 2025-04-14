// src/lib/axios.ts (또는 src/api/axios.ts)
import axios from 'axios';

const instance = axios.create({
	baseURL: '/api',
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
});

// 요청 인터셉터
instance.interceptors.request.use(
	(config) => {
		// 요청 보내기 전 수행할 작업

		const localStorageKid = localStorage.getItem('auth-storage');
		const token = JSON.parse(localStorageKid ?? '{}').state.token;

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default instance;
