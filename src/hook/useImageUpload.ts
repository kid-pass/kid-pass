'use client';

import { useState } from 'react';
import type { PutBlobResult } from '@vercel/blob';

const useImageUpload = () => {
	const [blob, setBlob] = useState<PutBlobResult | null>(null);
};

export default useImageUpload;
