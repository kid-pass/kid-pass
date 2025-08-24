import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export async function DELETE(request: Request) {
	try {
		// 토큰에서 사용자 정보 가져오기
		const accessToken = request.headers.get('Authorization')?.split(' ')[1];

		if (!accessToken) {
			return NextResponse.json(
				{ message: '인증이 필요합니다.' },
				{ status: 401 }
			);
		}

		const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
			userId: string;
		};

		if (!decoded) {
			return NextResponse.json(
				{ message: '유효하지 않은 토큰입니다.' },
				{ status: 401 }
			);
		}

		// 1. 사용자의 모든 자녀 정보 및 관련 데이터 조회
		const user = await prisma.user.findUnique({
			where: { userId: decoded.userId },
			include: {
				children: {
					include: {
						records: true,
						prescriptions: true,
						vacntnInfo: true,
						reports: true,
					},
				},
			},
		});

		if (!user) {
			return NextResponse.json(
				{ message: '사용자를 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		// 2. 트랜잭션으로 모든 관련 데이터 안전하게 삭제
		await prisma.$transaction(async (tx) => {
			// 각 자녀의 관련 데이터들 삭제
			for (const child of user.children) {
				// 자녀의 모든 기록 삭제
				await tx.record.deleteMany({
					where: { childId: child.id },
				});

				// 자녀의 처방전 삭제
				await tx.prescription.deleteMany({
					where: { childId: child.id },
				});

				// 자녀의 백신 정보 삭제
				await tx.vacntnInfo.deleteMany({
					where: { childId: child.id },
				});

				// 자녀의 리포트 삭제
				await tx.report.deleteMany({
					where: { childId: child.id },
				});
			}

			// 모든 자녀 삭제
			await tx.child.deleteMany({
				where: { userId: user.id },
			});

			// 사용자의 문의사항 삭제 (있는 경우)
			await tx.inquiry.deleteMany({
				where: { userId: user.id },
			});

			// 사용자의 이메일 인증 정보 삭제 (있는 경우)
			await tx.emailVerification.deleteMany({
				where: { email: user.email },
			});

			// 마지막으로 사용자 삭제
			await tx.user.delete({
				where: { userId: decoded.userId },
			});
		});

		return NextResponse.json({
			message: '회원탈퇴가 완료되었습니다.',
			status: 200,
		});
	} catch (error) {
		console.error('회원탈퇴 에러:', error);

		// Prisma 에러 처리
		if (error instanceof PrismaClientKnownRequestError) {
			switch (error.code) {
				case 'P2014':
					return NextResponse.json(
						{
							message:
								'관련 데이터가 존재하여 탈퇴할 수 없습니다.',
						},
						{ status: 400 }
					);
				case 'P2023':
					return NextResponse.json(
						{ message: '잘못된 사용자 ID 형식입니다.' },
						{ status: 400 }
					);
				case 'P2025':
					return NextResponse.json(
						{ message: '해당 사용자를 찾을 수 없습니다.' },
						{ status: 404 }
					);
				default:
					return NextResponse.json(
						{ message: '데이터베이스 오류가 발생했습니다.' },
						{ status: 500 }
					);
			}
		}

		// JWT 에러 처리
		if (error instanceof jwt.JsonWebTokenError) {
			return NextResponse.json(
				{ message: '유효하지 않은 토큰입니다.' },
				{ status: 401 }
			);
		}

		if (error instanceof jwt.TokenExpiredError) {
			return NextResponse.json(
				{ message: '토큰이 만료되었습니다.' },
				{ status: 401 }
			);
		}

		return NextResponse.json(
			{ message: '회원탈퇴 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
