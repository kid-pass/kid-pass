import { SocialLoginProvider, SocialLoginResult } from './model';

declare global {
	interface Window {
		Kakao: any;
	}
}

export class KakaoLoginProvider implements SocialLoginProvider {
	private clientId: string;
	private initialized: boolean = false;

	constructor(clientId: string) {
		this.clientId = clientId;
	}

	async initialize(): Promise<void> {
		if (this.initialized) return;

		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
			script.async = true;
			script.onload = () => {
				if (window.Kakao) {
					window.Kakao.init(this.clientId);
					this.initialized = true;
					resolve();
				} else {
					reject(new Error('Failed to load Kakao SDK'));
				}
			};
			script.onerror = () =>
				reject(new Error('Failed to load Kakao SDK'));
			document.body.appendChild(script);
		});
	}

	async loginWithPopup(): Promise<SocialLoginResult> {
		await this.ensureInitialized();
		return new Promise((resolve, reject) => {
			window.Kakao.Auth.login({
				success: (authObj: any) => {
					window.Kakao.API.request({
						url: '/v2/user/me',
						success: (response: any) => {
							resolve(
								this.processResult(
									response,
									authObj.access_token
								)
							);
						},
						fail: reject,
					});
				},
				fail: reject,
				redirectUri: window.location.origin + '/auth/login',
			});
		});
	}

	async loginWithRedirect(): Promise<void> {
		await this.ensureInitialized();
		window.Kakao.Auth.authorize({
			redirectUri: window.location.origin + '/auth/login',
		});
	}

	async getRedirectResult(): Promise<SocialLoginResult | null> {
		await this.ensureInitialized();
		return new Promise((resolve, reject) => {
			window.Kakao.Auth.getStatusInfo((result: any) => {
				if (result.status === 'connected') {
					window.Kakao.API.request({
						url: '/v2/user/me',
						success: (response: any) => {
							resolve(
								this.processResult(
									response,
									result.access_token
								)
							);
						},
						fail: reject,
					});
				} else {
					resolve(null);
				}
			});
		});
	}

	async logout(): Promise<void> {
		await this.ensureInitialized();
		if (window.Kakao.Auth.getAccessToken()) {
			await new Promise<void>((resolve) => {
				window.Kakao.Auth.logout(() => resolve());
			});
		}
	}

	async handleRedirect(code: string): Promise<SocialLoginResult | null> {
		await this.ensureInitialized();

		try {
			// 인가 코드로 토큰 받기
			const tokenResponse = await fetch(
				'https://kauth.kakao.com/oauth/token',
				{
					method: 'POST',
					headers: {
						'Content-Type':
							'application/x-www-form-urlencoded;charset=utf-8',
					},
					body: new URLSearchParams({
						grant_type: 'authorization_code',
						client_id: this.clientId,
						client_secret:
							process.env.NEXT_PUBLIC_KAKAO_CLIENT_SECRET!,
						redirect_uri: window.location.origin + '/auth/login',
						code: code,
					}),
				}
			);

			console.log('Token Response:', await tokenResponse.clone().text()); // 디버깅용

			const tokenData = await tokenResponse.json();

			if (!tokenResponse.ok) {
				throw new Error(
					`Failed to get access token: ${JSON.stringify(tokenData)}`
				);
			}

			// 토큰 설정
			window.Kakao.Auth.setAccessToken(tokenData.access_token);

			// 사용자 정보 요청
			return new Promise((resolve, reject) => {
				window.Kakao.API.request({
					url: '/v2/user/me',
					success: (response: any) => {
						resolve(
							this.processResult(response, tokenData.access_token)
						);
					},
					fail: reject,
				});
			});
		} catch (error) {
			console.error('Error in handleRedirect:', error);
			return null;
		}
	}

	private async ensureInitialized(): Promise<void> {
		if (!this.initialized) {
			await this.initialize();
		}
	}

	private processResult(userInfo: any, token: string): SocialLoginResult {
		return {
			provider: 'kakao',
			user: {
				id: userInfo.id.toString(),
				email: userInfo.kakao_account?.email || null,
				name:
					userInfo.properties?.nickname ||
					userInfo.kakao_account?.profile?.nickname ||
					null,
				photoURL:
					userInfo.properties?.profile_image ||
					userInfo.kakao_account?.profile?.profile_image_url ||
					null,
			},
			token: token,
		};
	}
}
