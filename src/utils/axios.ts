// src/lib/axios.ts (또는 src/api/axios.ts)
import axios from 'axios';

const instance = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 인증이 필요 없는 경로 목록
const noAuthPaths = [
    '/report', // 레포트 데이터 경로
];

// 요청 인터셉터
instance.interceptors.request.use(
    (config) => {
        // URL 경로가 noAuthPaths에 포함되어 있고, 특정 파라미터(예: public=true)가 있는지 확인
        const url = config.url || '';
        const isPublicPath = noAuthPaths.some(path => url.includes(path)) &&
                            config.params?.public === 'true';

        // 공개 경로가 아닌 경우에만 토큰 추가
        if (!isPublicPath) {
            const localStorageKid = localStorage.getItem('auth-storage');
            const token = JSON.parse(localStorageKid ?? '{}').state.token;

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;