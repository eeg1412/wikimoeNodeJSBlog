export default {
  title: '프로그래머 운세 뽑기',
  summaryPrefix: '물어보기: ',
  summary:
    '연애, 질병, 코딩, 테스트, 승진, 이직, 운석, 핵폭탄, 그 밖의 모든 운세',
  instructions: [
    '코딩, 테스트, 버그 수정, 커밋 전에 한 번 뽑아 나쁜 운을 피하고 좋은 운을 노려 보세요',
    '묻고 싶은 일을 고르고 집중한 뒤 "뽑기"를 클릭하세요',
    '같은 일은 한 번만 물어볼 수 있습니다. 다시 뽑으려면 페이지를 새로고침하세요'
  ],
  initialCard: '묻고 싶은 일을 선택하세요',
  actionText: '뽑기',
  itemLabels: {
    coding: '코딩',
    testing: '테스트',
    fixingBug: '버그 수정',
    commitCode: '코드 커밋',
    other: '기타'
  },
  todayText: '오늘은 {year}년 {month}월 {day}일 {week}요일입니다',
  weeks: ['일', '월', '화', '수', '목', '금', '토'],
  results: [
    { title: '대길', desc: '' },
    { title: '길', desc: '' },
    { title: '중길', desc: '' },
    { title: '소길', desc: '' },
    { title: ' ', desc: '' },
    { title: '소흉', desc: '' },
    { title: '흉', desc: '' },
    { title: '대흉', desc: '' },
    { title: '극흉', desc: '' }
  ]
}
