import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
	try {
		const { refreshToken } = await request.json();

		if (!refreshToken) {
			return NextResponse.json(
				{ error: '리프레시 토큰이 필요합니다.' },
				{ status: 400 }
			);
		}

		// 리프레시 토큰 검증
		const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as {
			userId: string;
		};

		// 새 액세스 토큰 생성
		const accessToken = jwt.sign(
			{ userId: decoded.userId },
			process.env.JWT_SECRET!,
			{ expiresIn: '1h' } // 액세스 토큰 만료 시간
		);

		// 필요에 따라 새 리프레시 토큰도 생성 가능
		const newRefreshToken = jwt.sign(
			{ userId: decoded.userId },
			process.env.JWT_SECRET!,
			{ expiresIn: '7d' }
		);

		return NextResponse.json({
			accessToken,
			refreshToken: newRefreshToken,
		});
	} catch (error) {
		console.error('토큰 갱신 오류:', error);

		return NextResponse.json(
			{ error: '유효하지 않은 리프레시 토큰입니다.' },
			{ status: 401 }
		);
	}
}
