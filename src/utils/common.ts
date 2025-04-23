

export const common = ()=>{



    /**
     * 오늘 날짜를 yyyy.mm.dd 형식으로 반환하는 함수
     * @returns {string} yyyy.mm.dd 형식의 오늘 날짜
     */
    const getToday = (): string => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      return `${year}.${month}.${day}`;
    };
  
    /**
     * 주어진 날짜 문자열이나 Date 객체를 yyyy.mm.dd 형식으로 변환하는 함수
     * @param {Date | string} date - 변환할 날짜 (Date 객체 또는 날짜 문자열)
     * @returns {string} yyyy.mm.dd 형식의 날짜 문자열
     */
    const getFormatDate = (date: Date | string): string => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      return `${year}.${month}.${day}`;
    };
  

    /**
     * 주어진 날짜 문자열이나 Date 객체를 yyyy.mm.dd 형식으로 변환하는 함수
     * @param {Date | string} date - 변환할 날짜 (Date 객체 또는 날짜 문자열)
     * @returns {string} yyyy.mm.dd 형식의 날짜 문자열
     */

    const getAge = (birthDate: string): number => {
        const birth = new Date(birthDate);
        const today = new Date();
    
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
    
        // 생일이 아직 지나지 않았으면 나이에서 1을 뺌
        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
            age--;
        }
    
        return age;
    };

    return {
        getToday,
        getFormatDate,
        getAge
    };



  };

