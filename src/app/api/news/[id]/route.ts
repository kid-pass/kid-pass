import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Props = {
    params: Promise<{
        id: string;
    }>;
};


// 건강뉴스 상세정보 조회 
export async function GET(req: NextRequest, { params }: Props) {



    try {

        const { id } = await params;
        // JWT 토큰에서 사용자 정보 가져오기
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
        };

        // 사용자 정보 가져오기
        const user = await prisma.user.findFirst({
            where: {
                userId: decoded.userId,
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: '사용자를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        // 특정 뉴스 조회
        const news = await prisma.news.findMany({

            where:{
                id:id
            }
        });

        return NextResponse.json({
            message: '건강뉴스 정보를 성공적으로 가져왔습니다.',
            data: news,
        });
    } catch (error) {
        console.error('데이터패칭 오류:', error);
        return NextResponse.json(
            { message: '건강뉴스 정보를 가져오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
