/**
 * 사용자 질문을 받아 `public/` 폴더의 JSON 파일을 로드하고,
 * 그 데이터를 백엔드(FastAPI)에 함께 전달하여 답변을 받는 함수.
 *
 * - 로컬 파일 위치: public/seoul_course.json, public/seoul_trip.json
 * - 백엔드 URL: http://127.0.0.1:8000/api/chat
 *
 * @param {string} userQuestion - 사용자가 입력한 질문
 */
export async function getChatbotResponse(userQuestion) {
  // 1) local JSON 로드
  let courseData = { items: [] };
  let tripData = { items: [] };

  try {
    const [courseRes, tripRes] = await Promise.all([
      fetch('/seoul_course.json'),
      fetch('/seoul_trip.json'),
    ]);

    if (courseRes.ok) courseData = await courseRes.json();
    if (tripRes.ok) tripData = await tripRes.json();
  } catch (err) {
    console.warn('로컬 JSON 파일 로드 실패:', err);
  }

  const courses = Array.isArray(courseData.items) ? courseData.items : [];
  const trips = Array.isArray(tripData.items) ? tripData.items : [];

  // 2) 질문 전처리
  const qRaw = (userQuestion || '').trim();
  const q = qRaw.toLowerCase();

  // 토큰화 (문장 부호 제거, 공백으로 분리)
  const tokenize = (s = '') => {
    return s
      .toString()
      .toLowerCase()
      .replace(/[\p{P}\p{S}]+/gu, ' ')
      .split(/\s+/)
      .filter(Boolean);
  };

  const qTokens = tokenize(qRaw);

  // 3) 숫자(코스/번호) 요청 처리: "1번", "1 번 코스" 등
  const numMatch = qRaw.match(/(\d{1,3})\s*(?:번|번\s*코스|코스)?/);
  if (numMatch) {
    const idx = parseInt(numMatch[1], 10) - 1;
    if (!Number.isNaN(idx) && idx >= 0 && idx < courses.length) {
      const c = courses[idx];
      const lines = [c.title || '제목 없음'];
      if (c.firstimage) lines.push(`이미지: ${c.firstimage}`);
      if (c.mapx && c.mapy) lines.push(`좌표: ${c.mapy}, ${c.mapx}`);
      return lines.join('\n');
    }
  }

  // 4) 추천 요청인지 판별
  const wantsRecommendation = /추천|추천해|추천해줘|어떤 코스|어디 가면|추천 코스/.test(q);
  if (wantsRecommendation) {
    const top = courses.slice(0, 5).map((c, i) => `${i + 1}. ${c.title || '제목 없음'}`);
    if (top.length === 0) return '현재 사용할 수 있는 코스 데이터가 없습니다.';
    return `다음 코스들을 추천드려요:\n${top.join('\n')}\n원하시면 코스 번호(예: "1번 코스 알려줘")로 자세히 알려드릴게요.`;
  }

  // 5) 제목 기반 최적 매칭: 토큰 교집합 비율로 후보 선택
  function bestMatch(candidates) {
    let best = null;
    let bestScore = 0;
    for (const item of candidates) {
      if (!item.title) continue;
      const title = item.title;
      const titleTokens = tokenize(title);
      if (title.toLowerCase().includes(q)) {
        return { item, score: 1 };
      }
      // 토큰 교집합
      const shared = titleTokens.filter(t => qTokens.includes(t));
      const overlap = shared.length;
      if (overlap === 0) continue;
      const score = overlap / Math.max(titleTokens.length, 1);
      if (score > bestScore) {
        bestScore = score;
        best = { item, score };
      }
    }
    return best;
  }

  // 우선 trips, 그다음 courses
  const tripBest = bestMatch(trips);
  const courseBest = bestMatch(courses);
  const chosen = (tripBest && (!courseBest || tripBest.score >= courseBest.score)) ? tripBest : courseBest;

  if (chosen && chosen.score >= 0.25) {
    const it = chosen.item;
    const lines = [it.title || '제목 없음'];
    if (it.addr1) lines.push(`주소: ${it.addr1}`);
    if (it.tel) lines.push(`전화: ${it.tel}`);
    if (it.mapx && it.mapy) lines.push(`좌표: ${it.mapy}, ${it.mapx}`);
    if (it.firstimage) lines.push(`이미지: ${it.firstimage}`);
    return lines.join('\n');
  }

  // 6) 키워드 검색(부분 포함)으로 넓게 찾기
  if (qTokens.length) {
    const matches = [];
    for (const t of trips) {
      if (t.title && qTokens.some(w => t.title.toLowerCase().includes(w))) matches.push(t);
    }
    for (const c of courses) {
      if (c.title && qTokens.some(w => c.title.toLowerCase().includes(w))) matches.push(c);
    }
    if (matches.length) {
      return matches.slice(0, 5).map(m => m.title || '제목 없음').join('\n');
    }
  }

  // 7) 폴백: 인기 장소 상위 5개
  if (trips.length) {
    return `다음 장소들을 참고해보세요:\n${trips.slice(0, 5).map((t, i) => `${i + 1}. ${t.title}`).join('\n')}`;
  }

  return '죄송해요, 요청하신 내용을 찾을 수 없어요. 조금 더 구체적으로 질문해주시겠어요?';
}
