'use client';

import instance from '@/utils/axios';
import { Box, Image } from '@mantine/core';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';




const App =()=> {

	const pathname = usePathname();
	const id = pathname.split('/').pop();

	const fetchReportDetail = async ()=>{

		const response = await instance.get(`/news/${id}`)

		console.log(response.data)
	}

	useEffect(()=>{
		fetchReportDetail()
	},[])

	return (
		<Box>

			{/* <Image src={newsItem?.imageUrl} /> */}
		</Box>
	);
}

export default App;