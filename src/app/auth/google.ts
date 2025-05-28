import { SocialLoginProvider, SocialLoginResult } from "./model";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User,
  Auth,
} from "firebase/auth";
import { initializeApp, FirebaseOptions, getApps } from "firebase/app";

export class GoogleLoginProvider implements SocialLoginProvider {
  private auth: Auth;

  constructor(firebaseConfig: FirebaseOptions) {
    try {
      const existingApp = getApps().find((app) => app.name === "[DEFAULT]");
      if (existingApp) {
        this.auth = getAuth(existingApp);
      } else {
        const app = initializeApp(firebaseConfig);
        this.auth = getAuth(app);
      }
    } catch (error) {
      console.error("Firebase 초기화 오류:", error);
      throw error;
    }
  }

  async initialize(): Promise<void> {
    return Promise.resolve();
  }

  async loginWithPopup(): Promise<SocialLoginResult> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    return this.processResult(result.user);
  }

  async loginWithRedirect(redirectUrl?: string): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      
      // React Native WebView 환경 감지
      const isReactNativeWebView = typeof window !== 'undefined' && !!window.ReactNativeWebView;
      
      // 기본 파라미터 설정 - WebView와 호환되는 값만 사용
      provider.setCustomParameters({
        prompt: "select_account",
      });
      
      // 로컬 스토리지에 WebView 상태 저장
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('isWebView', isReactNativeWebView ? 'true' : 'false');
        
        // 현재 URL 저장 (리다이렉트 후 돌아올 수 있도록)
        if (isReactNativeWebView) {
          localStorage.setItem('redirectUrl', window.location.href);
        }
      }
      
      // WebView에서 로그인 시 추가 디버깅 정보
      if (isReactNativeWebView && window.ReactNativeWebView) {
        console.log('구글 로그인 시도 (WebView 환경)');
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "info",
            message: "구글 로그인 시도 중",
          })
        );
      }
      
      // Firebase의 리다이렉트 로그인 실행
      await signInWithRedirect(this.auth, provider);
    } catch (error) {
      console.error("리다이렉트 오류:", error);
      
      // 오류 디버깅 정보 추가
      const isReactNativeWebView = typeof window !== 'undefined' && !!window.ReactNativeWebView;
      if (isReactNativeWebView && window.ReactNativeWebView) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "error",
            message: "구글 로그인 오류",
            details: errorMessage,
          })
        );
      }
      
      throw error;
    }
  }

  async getRedirectResult(): Promise<SocialLoginResult | null> {
    try {
      // React Native WebView 환경 감지
      const isWebView = typeof localStorage !== 'undefined' && localStorage.getItem('isWebView') === 'true';
      
      // 리다이렉트 결과 가져오기
      const result = await getRedirectResult(this.auth);

      if (result && result.user) {
        // 성공적인 결과가 있으면 처리
        const processedResult = this.processResult(result.user);
        
        // WebView인 경우 저장된 리다이렉트 URL로 반환
        if (isWebView && typeof localStorage !== 'undefined') {
          const redirectUrl = localStorage.getItem('redirectUrl');
          if (redirectUrl) {
            localStorage.removeItem('redirectUrl'); // 사용 후 제거
          }
        }
        
        return processedResult;
      }

      return null;
    } catch (error) {
      console.error("리다이렉트 결과 가져오기 오류:", error);
      
      // WebView에서 오류 발생 시 추가 디버깅 정보
      if (typeof window !== 'undefined' && window.ReactNativeWebView) {
        console.error("리액트 네이티브 WebView 환경에서 오류 발생");
      }
      
      return null;
    }
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
  }

  private async processResult(user: User): Promise<SocialLoginResult> {
    const token = await user.getIdToken();
    return {
      provider: "google",
      user: {
        id: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
      },
      token: token,
    };
  }
}
