export const mockNews = [
  {
    id: '1',
    title: 'Bản tin sáng 15/01: Cập nhật tình hình kinh tế và chính trị trong nước',
    category: 'Bản tin sáng',
    duration: 1020, // 17 minutes
    imageUrl: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    description: 'Tổng hợp những tin tức quan trọng nhất trong 24 giờ qua với các phân tích chuyên sâu từ các chuyên gia.',
    highlights: ['Thị trường chứng khoán tăng 2.5%', 'Quyết định mới về lãi suất', 'Dự báo thời tiết tuần tới'],
    summary: 'Thị trường có nhiều biến động tích cực, chính sách mới được công bố.'
  },
  {
    id: '2',
    title: 'Tin nhanh: Giá xăng dầu biến động mạnh trong tuần',
    category: 'Tài chính',
    duration: 180, // 3 minutes
    imageUrl: 'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    description: 'Phân tích nguyên nhân và dự báo xu hướng giá xăng dầu trong thời gian tới.',
    isQuickNews: true,
  },
  {
    id: '3',
    title: 'Thể thao 24h: Kết quả các trận đấu quan trọng',
    category: 'Thể thao',
    duration: 540, // 9 minutes
    imageUrl: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    description: 'Tổng hợp kết quả các trận đấu bóng đá, bóng rổ và tennis trong 24 giờ qua.',
  },
  {
    id: '4',
    title: 'Công nghệ AI: Những đột phá mới trong năm 2025',
    category: 'Công nghệ',
    duration: 720, // 12 minutes
    imageUrl: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    description: 'Khám phá những tiến bộ mới nhất trong lĩnh vực trí tuệ nhân tạo và tác động đến cuộc sống.',
    highlights: ['ChatGPT 5 ra mắt', 'AI trong y tế', 'Quy định mới về AI'],
  },
  {
    id: '5',
    title: 'Tin nhanh: Thời tiết cực đoan tại miền Bắc',
    category: 'Thời tiết',
    duration: 150, // 2.5 minutes
    imageUrl: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    description: 'Cảnh báo về tình trạng thời tiết bất thường và hướng dẫn phòng tránh.',
    isQuickNews: true,
  },
  {
    id: '6',
    title: 'Giải trí cuối tuần: Những bộ phim đáng xem trong tháng',
    category: 'Giải trí',
    duration: 480, // 8 minutes
    imageUrl: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    description: 'Giới thiệu những bộ phim hay nhất đang chiếu và sắp ra mắt trong tháng này.',
  },
  {
    id: '7',
    title: 'Sức khỏe hôm nay: Cách phòng chống cúm mùa hiệu quả',
    category: 'Sức khỏe',
    duration: 420, // 7 minutes
    imageUrl: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    description: 'Lời khuyên từ các chuyên gia y tế về cách phòng tránh và điều trị cúm mùa.',
  },
  {
    id: '8',
    title: 'Tin nhanh: Giao thông Hà Nội ùn tắc nghiêm trọng',
    category: 'Giao thông',
    duration: 120, // 2 minutes
    imageUrl: 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    description: 'Thông tin về tình hình giao thông và các tuyến đường thay thế.',
    isQuickNews: true,
  },
];

export const mockCategories = [
  {
    id: '1',
    name: 'Bản tin sáng',
    imageUrl: 'https://images.pexels.com/photos/261909/pexels-photo-261909.jpeg',
    subscriberCount: '125K',
    episodeCount: 30,
    description: 'Tin tức tổng hợp mỗi sáng'
  },
  {
    id: '2',
    name: 'Tài chính 24h',
    imageUrl: 'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg',
    subscriberCount: '89K',
    episodeCount: 45,
    description: 'Cập nhật thị trường tài chính'
  },
  {
    id: '3',
    name: 'Thể thao',
    imageUrl: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg',
    subscriberCount: '67K',
    episodeCount: 28,
    description: 'Tin tức thể thao trong nước và quốc tế'
  },
  {
    id: '4',
    name: 'Công nghệ',
    imageUrl: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg',
    subscriberCount: '102K',
    episodeCount: 52,
    description: 'Những xu hướng công nghệ mới nhất'
  },
  {
    id: '5',
    name: 'Giải trí',
    imageUrl: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg',
    subscriberCount: '78K',
    episodeCount: 36,
    description: 'Tin tức giải trí và văn hóa'
  },
  {
    id: '6',
    name: 'Sức khỏe',
    imageUrl: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg',
    subscriberCount: '94K',
    episodeCount: 41,
    description: 'Thông tin y tế và chăm sóc sức khỏe'
  },
];