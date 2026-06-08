export default {
  title: 'Lịch may mắn cho lập trình viên',
  loading: 'Đang tính vận may hôm nay...',
  goodTitle: 'Nên làm',
  badTitle: 'Nên tránh',
  seatDirectionLabel: 'Hướng ngồi:',
  seatDirectionText: 'Hãy quay mặt về hướng {direction} khi viết mã để ít lỗi hơn.',
  drinkLabel: 'Đồ uống hôm nay:',
  goddessLabel: 'Độ hợp với crush:',
  todayText: 'Hôm nay là {week}, {day}/{month}/{year}',
  drinkSeparator: ', ',
  weeks: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  directions: [
    'Bắc',
    'Đông Bắc',
    'Đông',
    'Đông Nam',
    'Nam',
    'Tây Nam',
    'Tây',
    'Tây Bắc'
  ],
  activities: [
    {
      name: 'Viết unit test',
      good: 'Unit test sẽ giúp giảm sai sót',
      bad: 'Unit test sẽ làm chậm nhịp phát triển của bạn'
    },
    {
      name: 'Tắm',
      good: 'Cũng đã vài ngày rồi nhỉ?',
      bad: 'Bạn có thể rửa trôi cảm hứng thiết kế',
      weekend: true
    },
    {
      name: 'Tập thể dục',
      good: 'Đến lúc giãn những cơ bắp cứng đờ rồi',
      bad: 'Bạn đốt không bao nhiêu năng lượng rồi lại ăn nhiều hơn',
      weekend: true
    },
    {
      name: 'Hút thuốc',
      good: 'Có thể giúp tỉnh táo hơn, dù hút thuốc vẫn có hại',
      bad: 'Hút thuốc không tốt cho sức khỏe',
      weekend: true
    },
    {
      name: 'Deploy ban ngày',
      good: 'Phát hành ban ngày hôm nay khá an toàn',
      bad: 'Có thể dẫn đến hậu quả nghiêm trọng'
    },
    {
      name: 'Refactor',
      good: 'Chất lượng mã sẽ được cải thiện',
      bad: 'Bạn có thể mắc kẹt trong một đống hồi quy'
    },
    {
      name: 'Dùng %t',
      good: 'Bạn sẽ trông có gu hơn',
      bad: 'Mọi người có thể nghĩ bạn đang khoe khoang'
    },
    {
      name: 'Đổi việc',
      good: 'Đến lúc buông thì nên buông',
      bad: 'Kinh tế thế này, việc tiếp theo chưa chắc đã tốt hơn'
    },
    {
      name: 'Tuyển người',
      good: 'Người này có thể thật sự có tiềm năng',
      bad: 'Người này có biết viết mã không?'
    },
    {
      name: 'Phỏng vấn',
      good: 'Hôm nay người phỏng vấn có tâm trạng tốt',
      bad: 'Người phỏng vấn đang khó chịu và có thể trút lên bạn'
    },
    {
      name: 'Nộp đơn nghỉ việc',
      good: 'Công ty đã tìm được người rẻ hơn và giỏi hơn, muốn bạn đi nhanh',
      bad: 'Kinh tế thế này, việc tiếp theo chưa chắc đã tốt hơn'
    },
    {
      name: 'Xin tăng lương',
      good: 'Hôm nay sếp có tâm trạng tốt',
      bad: 'Công ty đang cân nhắc cắt giảm nhân sự'
    },
    {
      name: 'Làm thêm giờ tối nay',
      good: 'Đêm là lúc lập trình viên tỉnh táo nhất',
      bad: 'Bạn đã kiệt sức rồi, nghỉ ngơi đi',
      weekend: true
    },
    {
      name: 'Khoe trước mặt crush',
      good: 'Hình ảnh của bạn sẽ tốt lên một chút',
      bad: 'Bạn sẽ bị nhìn thấu ngay',
      weekend: true
    },
    {
      name: 'Rút thẻ trên Wikimoe',
      good: 'Bạn có khả năng rút được thẻ mình muốn',
      bad: 'Thẻ rác sẽ rơi đầy trời',
      weekend: true
    },
    {
      name: 'Viết bài kỹ thuật',
      good: 'Một tuyệt phẩm nội dung mới sắp ra đời',
      bad: 'Bài của bạn có thể bị sao chép',
      weekend: true
    },
    {
      name: 'Đặt tên biến là "%v"',
      good: 'Tên biến trông đáng yêu bất ngờ',
      bad: 'Bạn sẽ không bao giờ dùng lại biến này'
    },
    {
      name: 'Viết một phương thức dài hơn %l dòng',
      good: 'Mã của bạn đủ gọn để chịu được độ dài đó',
      bad: 'Mã sẽ thành một mớ bạn không còn hiểu nổi'
    },
    {
      name: 'Commit mã',
      good: 'Khả năng conflict đang thấp nhất',
      bad: 'Một núi conflict sẽ khiến bạn nghi ngờ timeline'
    },
    {
      name: 'Review mã',
      good: 'Bạn dễ phát hiện vấn đề quan trọng hơn',
      bad: 'Bạn sẽ không tìm thấy gì và phí cả buổi'
    },
    {
      name: 'Dự họp',
      good: 'Một giấc ngủ ngắn xa mã nguồn tốt cho sức khỏe',
      bad: 'Bạn có thể trở thành người nhận trách nhiệm'
    },
    {
      name: 'Chơi Overwatch',
      good: 'Bạn sẽ cảm thấy như được thần may mắn phù hộ',
      bad: 'Bạn sẽ bị áp đảo',
      weekend: true
    },
    {
      name: 'Deploy ban đêm',
      good: 'Đêm là lúc lập trình viên tỉnh táo nhất',
      bad: 'Ban ngày bạn đã dùng hết năng lượng rồi'
    },
    {
      name: 'Sửa lỗi',
      good: 'Hôm nay trực giác tìm lỗi của bạn sắc bén bất thường',
      bad: 'Bạn sẽ tạo ra nhiều lỗi hơn số lỗi sửa được'
    },
    {
      name: 'Review thiết kế',
      good: 'Buổi review sẽ thành một phiên động não thật sự',
      bad: 'Mọi người sẽ kiệt sức và chẳng có gì đáng kể'
    },
    {
      name: 'Review yêu cầu',
      good: 'Yêu cầu này trông có vẻ dễ',
      bad: 'Công ty muốn giao diện app đổi theo ốp điện thoại'
    },
    {
      name: 'Đọc blog',
      good: 'Những câu chuyện hôm nay đáng để theo dõi',
      bad: 'Thế giới blog hôm nay đầy năng lượng tiêu cực',
      weekend: true
    },
    {
      name: 'Lướt web anime',
      good: 'Có cần lý do không?',
      bad: 'Khu bình luận toàn chiến binh bàn phím',
      weekend: true
    },
    {
      name: 'Chơi MapleStory Online',
      good: 'Bạn có thể roll được bộ 25 sao cực phẩm',
      bad: 'Trừ khi bạn muốn đập máy tính',
      weekend: true
    }
  ],
  specials: [
    {
      date: 20140214,
      type: 'bad',
      name: 'Ở bên người yêu',
      description:
        'Ngày Valentine trừng phạt người độc thân và thưởng cho các cặp đôi.'
    }
  ],
  tools: [
    'Viết mã bằng Eclipse',
    'Viết tài liệu trong MS Office',
    'Viết mã bằng Notepad',
    'Windows 8',
    'Linux',
    'macOS',
    'Internet Explorer',
    'Thiết bị Android',
    'Thiết bị iOS'
  ],
  varNames: [
    'result',
    'event',
    'payment',
    'expire',
    'bill',
    'each',
    'free',
    'i1',
    'a',
    'virtual',
    'ad',
    'spider',
    'password',
    'pass',
    'ui'
  ],
  drinks: [
    'Nước lọc',
    'Trà',
    'Trà đen',
    'Trà xanh',
    'Cà phê',
    'Trà sữa',
    'Cola',
    'Sữa tươi',
    'Sữa đậu nành',
    'Nước ép',
    'Soda trái cây',
    'Nước soda',
    'Đồ uống thể thao',
    'Sữa chua',
    'Đồ uống có cồn'
  ]
}
