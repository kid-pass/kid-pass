'use client'

import { Box } from '@mantine/core';
import QRCode from 'react-qr-code';

interface QRGeneratorProps {
  chldrnNo: string;
}

export default function QRGenerator({ chldrnNo }: QRGeneratorProps) {
  // 개발 환경인지 확인 (Next.js에서는 process.env.NODE_ENV를 사용)
  const isDevelopment = process.env.NODE_ENV === 'development';

  // 환경에 따라 기본 URL 설정
  const baseUrl = isDevelopment
    ? 'http://192.168.219.136:3000'
    : 'https://kid-pass-psi.vercel.app';

  const reportUrl = `${baseUrl}/report?chldrnNo=${chldrnNo}`;

  return (
    <Box bg="#FFFFFF" p={8} style={{ borderRadius: "18px" }}>
      <QRCode
        value={reportUrl}
        size={65}
        level="M"
      />
    </Box>
  );
}