<script setup>
import { ref, computed, onMounted, nextTick, watch, onBeforeUnmount } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ChatBot from './components/ChatBot.vue';

// 1. 다국어 사전 구성
const locale = ref('ko');
const messages = {
  ko: {
    logo: 'LocalHub', navHome: '🌸 구별 추천 장소', navBoard: '💌 여행 피드',
    heroTitle: '가보고 싶은 곳이 있나요?', heroSub: '여행갈 곳을 추천해드려요!',
    selectDistrict: '✨ 구를 선택해 주세요', allSeoul: '서울 전체 지역', noPlaces: '위에서 구를 선택하시면 상큼한 정보가 가득 나타나요!',
    관광명소: '🍦 가볼만한 곳', '추천 문화시설 & 쇼핑': '🛍️ 추천 문화시설 & 쇼핑', tmiPlace: '대표 장소', picnicGuide: '소풍 가이드',
    boardTitle: '💌 실시간 여행 피드', boardSub: '여행의 후기를 자유롭게 남겨주세요.',
    writePost: '✍️ LocalHub와 추억 남기기', editPost: '📝 이야기 고치기', postCount: '여행자들의 이야기', noPosts: '첫 번째 후기를 남겨보세요!',
    phTitle: '제목', phPw: '비밀번호', phContent: '공유하고 싶은 이야기를 적어주세요!',
    btnRegister: '피드 올리기', btnEditComplete: '수정 완료', btnCancel: '돌아가기',
    '종로구': '종로구', '중구': '중구', '용산구': '용산구', '성동구': '성동구', '광진구': '광진구', '동대문구': '동대문구', '중랑구': '중랑구', '성북구': '성북구', '강북구': '강북구', '도봉구': '도봉구', '노원구': '노원구', '은평구': '은평구', '서대문구': '서대문구', '마포구': '마포구', '양천구': '양천구', '강서구': '강서구', '구로구': '구로구', '금천구': '금천구', '영등포구': '영등포구', '동작구': '동작구', '관악구': '관악구', '서초구': '서초구', '강남구': '강남구', '송파구': '송파구', '강동구': '강동구'
  },
  en: {
    logo: 'LocalHub', navHome: '🌸 Map', navBoard: '💌 Feed',
    heroTitle: 'Where to go?', heroSub: 'Select a district to explore.',
    selectDistrict: '✨ Select District', allSeoul: 'All Seoul', noPlaces: 'Select a district first!',
    관광명소: '🍦 Attractions', '추천 문화시설 & 쇼핑': '🛍️ Culture & Shopping', tmiPlace: 'Main Place', picnicGuide: 'Picnic Guide',
    boardTitle: '💌 Travel Feed', boardSub: 'Share your stories.',
    writePost: '✍️ Write Post', editPost: '📝 Edit Post', postCount: 'Feeds', noPosts: 'No posts yet.',
    phTitle: 'Title', phPw: 'Password', phContent: 'Content',
    btnRegister: 'Submit', btnEditComplete: 'Save', btnCancel: 'Cancel',
    '종로구': 'Jongno', '중구': 'Jung', '용산구': 'Yongsan', '성동구': 'Seongdong', '광진구': 'Gwangjin', '동대문구': 'Dongdaemun', '중랑구': 'Jungnang', '성북구': 'Seongbuk', '강북구': 'Gangbuk', '도봉구': 'Dobong', '노원구': 'Nowon', '은평구': 'Eunpyeong', '서대문구': 'Seodaemun', '마포구': 'Mapo', '양천구': 'Yangcheon', '강서구': 'Gangseo', '구로구': 'Guro', '금천구': 'Geumcheon', '영등포구': 'Yeongdeungpo', '동작구': 'Dongjak', '관악구': 'Gwanak', '서초구': 'Seocho', '강남구': 'Gangnam', '송파구': 'Songpa', '강동구': 'Gangdong'
  },
  zh: {
    logo: 'LocalHub', navHome: '🌸 地区地图', navBoard: '💌 旅行动态',
    heroTitle: '今天去哪个区散步呢？', heroSub: '为您推荐旅行去处！',
    selectDistrict: '请选择区', allSeoul: '首尔全区', noPlaces: '请先选择一个区！',
    관광명소: '🍦 旅游景点', '추천 문화시설 & 쇼핑': '🛍️ 推荐文化设施 & 购物', tmiPlace: '代表性景点', picnicGuide: '郊游指南',
    boardTitle: '💌 实时旅行动态', boardSub: '自由分享首尔漂亮咖啡厅、野餐胜地的心得吧。',
    writePost: '✍️ 留下美好的回忆', editPost: '📝 修改动态', postCount: '游客们的分享', noPosts: '留下第一个感性景点的评价吧！',
    phTitle: '漂亮的标题', phPw: '密码', phContent: '请写下你想分享的故事！',
    btnRegister: '发布动态', btnEditComplete: '修改完成', btnCancel: '返回',
    '종로구': '钟路区', '중구': '中区', '용산구': '龙山区', '성동구': '城东区', '광진구': '广津区', '동대문구': '东大门区', '중랑구': '中浪区', '성북구': '城北区', '강북구': '江北区', '도봉구': '道峰区', '노원구': '鹭梁津区', '은평구': '恩平区', '서대문구': '西大门区', '마포구': '麻浦区', '양천구': '阳川区', '강서구': '江西区', '구로구': '九老区', '금천구': '衿川区', '영등포구': '永登浦区', '동작구': '铜雀区', '관악구': '冠岳区', '서초구': '瑞草区', '강남구': '江南区', '송파구': '松坡区', '강동구': '江东区'
  }
};
const t = (key) => messages[locale.value]?.[key] || key;

// language menu state (use small inline SVGs)
const langMenuOpen = ref(false);
const langLabels = { ko: 'KR', en: 'EN', zh: 'ZN' };
const selectLang = (code) => { locale.value = code; langMenuOpen.value = false; };

// close language menu when clicking/tapping outside (works on mobile)
const _closeLangOnOutside = (e) => {
  if (!langMenuOpen.value) return;
  const el = document.querySelector('.lang-switcher');
  if (el && !e.target.closest('.lang-switcher')) {
    langMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', _closeLangOnOutside);
  document.addEventListener('touchstart', _closeLangOnOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', _closeLangOnOutside);
  document.removeEventListener('touchstart', _closeLangOnOutside);
});

// 2. 상태 관리 정의
const currentTab = ref('home');
const selectedDistrict = ref('');
const selectedCategory = ref('관광명소');
const categories = ['관광명소', '추천 문화시설 & 쇼핑'];
const districts = ['종로구', '중구', '용산구', '성동구', '광진구', '동대문구', '중랑구', '성북구', '강북구', 
'도봉구', '노원구', '은평구', '서대문구', '마포구', '양천구', '강서구', '구로구', '금천구', '영등포구', '동작구', 
'관악구', '서초구', '강남구', '송파구', '강동구'];

const allLocations = ref([]);
let map = null;
let currentMarker = null;
const selectedPlaceDetail = ref(null);

const districtTmiData = {
  '종로구': {
    lat: 37.5796, lng: 126.9770,
    image: 'https://placehold.co/600x360?text=Gyeongbokgung',
    translations: {
      ko: { placeName: '경복궁', tmi: '고풍스러운 한복을 입고 입장하면 입장료가 면제돼요!' },
      en: { placeName: 'Gyeongbokgung Palace', tmi: 'Wearing a hanbok often grants free entry — great for photos!' },
      zh: { placeName: '景福宫', tmi: '穿韩服入场通常可免费入场，是拍照的好去处！' }
    }
  },
  '중구': {
    lat: 37.5512, lng: 126.9882,
    image: 'https://placehold.co/600x360?text=N+Seoul+Tower',
    translations: {
      ko: { placeName: 'N서울타워', tmi: '타워 불빛이 파란색이면 서울 공기가 아주 맑다는 뜻이에요!' },
      en: { placeName: 'N Seoul Tower', tmi: 'If the tower lights are blue, the air quality is especially clear.' },
      zh: { placeName: 'N首尔塔', tmi: '塔灯若为蓝色，表示空气非常清新。' }
    }
  },
  '용산구': {
    lat: 37.5240, lng: 126.9804,
    image: 'https://placehold.co/600x360?text=National+Museum',
    translations: {
      ko: { placeName: '국립중앙박물관', tmi: '야외 거울못에 비치는 풍경은 인생샷 명소랍니다.' },
      en: { placeName: 'National Museum of Korea', tmi: 'The reflective pond outside is a hidden spot for great photos.' },
      zh: { placeName: '国立中央博物馆', tmi: '室外的镜面池是拍照的绝佳地点。' }
    }
  },
  '성동구': {
    lat: 37.5443, lng: 127.0374,
    image: 'https://placehold.co/600x360?text=Seoul+Forest',
    translations: {
      ko: { placeName: '서울숲', tmi: '귀여운 꽃사슴들에게 먹이를 주는 힐링존이 숨어있어요.' },
      en: { placeName: 'Seoul Forest', tmi: 'There is a quiet spot where you can feed small deer — very relaxing.' },
      zh: { placeName: '首尔森林', tmi: '有可以喂小鹿的治愈地点，非常放松。' }
    }
  },
  '광진구': {
    lat: 37.5450, lng: 127.0820,
    image: 'https://placehold.co/600x360?text=Children+Grand+Park',
    translations: {
      ko: { placeName: '어린이대공원', tmi: '넓은 공원과 동물원이 있어 가족 나들이에 좋아요.' },
      en: { placeName: 'Seoul Children\'s Grand Park', tmi: 'Large park with a small zoo — great for family outings.' },
      zh: { placeName: '首尔儿童大公园', tmi: '广阔的公园和小型动物园，适合家庭出游。' }
    }
  },
  '동대문구': {
    lat: 37.5663, lng: 127.0090,
    image: 'https://placehold.co/600x360?text=DDP',
    translations: {
      ko: { placeName: '동대문디자인플라자', tmi: '야간 조명이 예쁘고 패션 마켓이 유명해요.' },
      en: { placeName: 'DDP (Dongdaemun Design Plaza)', tmi: 'Lovely night illumination and famous fashion markets nearby.' },
      zh: { placeName: '东大门设计广场', tmi: '夜间灯光漂亮，附近有著名的服装市场。' }
    }
  },
  '중랑구': {
    lat: 37.5950, lng: 127.0910,
    image: 'https://placehold.co/600x360?text=Jungnangcheon',
    translations: {
      ko: { placeName: '중랑천 산책로', tmi: '강변 산책로가 잘 정비되어 있어 가볍게 걷기 좋아요.' },
      en: { placeName: 'Jungnangcheon Walkway', tmi: 'Well-maintained riverside paths for an easy stroll.' },
      zh: { placeName: '中浪川步道', tmi: '河畔步道维护良好，适合轻松散步。' }
    }
  },
  '성북구': {
    lat: 37.5890, lng: 127.0130,
    image: 'https://placehold.co/600x360?text=Seongbuk-dong',
    translations: {
      ko: { placeName: '성북동 한옥길', tmi: '한적한 한옥 골목에서 여유로운 산책을 즐겨보세요.' },
      en: { placeName: 'Seongbuk-dong Hanok Street', tmi: 'Quiet traditional houses and calm streets for a pleasant walk.' },
      zh: { placeName: '城北洞韩屋街', tmi: '安静的韩屋街道，适合悠闲散步。' }
    }
  },
  '강북구': {
    lat: 37.6520, lng: 127.0250,
    image: 'https://placehold.co/600x360?text=Bukhansan',
    translations: {
      ko: { placeName: '북한산 둘레길', tmi: '가벼운 등산 코스와 멋진 전망을 즐길 수 있어요.' },
      en: { placeName: 'Bukhansan Trails', tmi: 'Light hiking trails with excellent viewpoints.' },
      zh: { placeName: '北汉山环山路', tmi: '轻徒步路线，拥有绝佳观景点。' }
    }
  },
  '도봉구': {
    lat: 37.7036, lng: 127.0330,
    image: 'https://placehold.co/600x360?text=Dobongsan',
    translations: {
      ko: { placeName: '도봉산', tmi: '산책로와 기암 풍경으로 유명한 산입니다.' },
      en: { placeName: 'Dobongsan', tmi: 'Mountain known for scenic walking trails and rock formations.' },
      zh: { placeName: '道峰山', tmi: '以步道和奇岩景观闻名的山。' }
    }
  },
  '노원구': {
    lat: 37.6813, lng: 127.0577,
    image: 'https://placehold.co/600x360?text=Suraksan',
    translations: {
      ko: { placeName: '수락산', tmi: '가벼운 등산과 전망이 좋은 코스가 있어요.' },
      en: { placeName: 'Suraksan', tmi: 'Good for light hikes and panoramic views.' },
      zh: { placeName: '水落山', tmi: '适合轻徒步并享受全景视野。' }
    }
  },
  '은평구': {
    lat: 37.6024, lng: 126.9255,
    image: 'https://placehold.co/600x360?text=Innovation+Park',
    translations: {
      ko: { placeName: '서울혁신파크', tmi: '작은 전시와 카페가 있어 한적하게 즐기기 좋아요.' },
      en: { placeName: 'Seoul Innovation Park', tmi: 'Small exhibits and cafes for a relaxed visit.' },
      zh: { placeName: '首尔创新公园', tmi: '有小型展览和咖啡馆，适合悠闲参观。' }
    }
  },
  '서대문구': {
    lat: 37.5779, lng: 126.9573,
    image: 'https://placehold.co/600x360?text=Seodaemun+Prison',
    translations: {
      ko: { placeName: '서대문형무소역사관', tmi: '역사 유적지로 의미있는 산책 코스예요.' },
      en: { placeName: 'Seodaemun Prison History Hall', tmi: 'A historical site offering meaningful walks.' },
      zh: { placeName: '西大门监狱历史馆', tmi: '历史遗址，适合进行有意义的散步。' }
    }
  },
  '양천구': {
    lat: 37.5241, lng: 126.8665,
    image: 'https://placehold.co/600x360?text=Yangcheon+Park',
    translations: {
      ko: { placeName: '양천공원', tmi: '지역 주민들이 사랑하는 소소한 휴식 공간입니다.' },
      en: { placeName: 'Yangcheon Park', tmi: 'A small beloved local park for relaxation.' },
      zh: { placeName: '阳川公园', tmi: '当地居民喜爱的休闲小公园。' }
    }
  },
  '강서구': {
    lat: 37.5610, lng: 126.8250,
    image: 'https://placehold.co/600x360?text=Magok',
    translations: {
      ko: { placeName: '마곡지구', tmi: '신도시 분위기의 카페와 산책로가 있어요.' },
      en: { placeName: 'Magok District', tmi: 'New town vibe with cafes and pleasant walking paths.' },
      zh: { placeName: '麻谷地区', tmi: '新城氛围，拥有咖啡馆和宜人步道。' }
    }
  },
  '구로구': {
    lat: 37.4852, lng: 126.9011,
    image: 'https://placehold.co/600x360?text=Guro+Digital',
    translations: {
      ko: { placeName: '구로디지털단지', tmi: 'IT/디지털 구역으로 퇴근 후 먹거리 골목이 유명해요.' },
      en: { placeName: 'Guro Digital Complex', tmi: 'Digital/IT area with popular food alleys after work.' },
      zh: { placeName: '九老数码园区', tmi: '数字/IT区，晚间美食街很受欢迎。' }
    }
  },
  '금천구': {
    lat: 37.4786, lng: 126.8827,
    image: 'https://placehold.co/600x360?text=Gasan+Digital',
    translations: {
      ko: { placeName: '가산디지털단지', tmi: 'IT·산업단지로 가성비 맛집이 많아요.' },
      en: { placeName: 'Gasan Digital Complex', tmi: 'Industrial/IT complex with many affordable eateries.' },
      zh: { placeName: '加山数码园区', tmi: '工业/IT园区，性价比高的小吃很多。' }
    }
  },
  '관악구': {
    lat: 37.4599, lng: 126.9516,
    image: 'https://placehold.co/600x360?text=SNU',
    translations: {
      ko: { placeName: '서울대학교', tmi: '캠퍼스 산책과 주변 카페를 즐겨보세요.' },
      en: { placeName: 'Seoul National University', tmi: 'Enjoy campus walks and nearby cafes.' },
      zh: { placeName: '首尔大学', tmi: '可漫步校园并享受周边咖啡馆。' }
    }
  },
  '서초구': {
    lat: 37.4836, lng: 127.0060,
    image: 'https://placehold.co/600x360?text=Seoul+Arts+Center',
    translations: {
      ko: { placeName: '예술의전당', tmi: '공연과 야외 음악분수로 유명합니다.' },
      en: { placeName: 'Seoul Arts Center', tmi: 'Known for performances and outdoor fountains.' },
      zh: { placeName: '首尔艺术中心', tmi: '以演出和户外音乐喷泉闻名。' }
    }
  },
  '송파구': {
    lat: 37.5110, lng: 127.0988,
    image: 'https://placehold.co/600x360?text=Lotte+World',
    translations: {
      ko: { placeName: '롯데월드/석촌호수', tmi: '호수 산책과 실내 테마파크를 동시에 즐겨보세요.' },
      en: { placeName: 'Lotte World / Seokchon Lake', tmi: 'Enjoy lakeside walks and the indoor theme park.' },
      zh: { placeName: '乐天世界/石村湖', tmi: '可同时享受湖畔散步和室内主题公园。' }
    }
  },
  '강동구': {
    lat: 37.5515, lng: 127.1230,
    image: 'https://placehold.co/600x360?text=Amsa+Settlement',
    translations: {
      ko: { placeName: '암사동 선사유적지', tmi: '선사시대 유적이 남아 있어 역사 산책을 즐기기 좋아요.' },
      en: { placeName: 'Amsa Prehistoric Settlement', tmi: 'Prehistoric ruins offering a historical stroll.' },
      zh: { placeName: '岩寺洞史前遗址', tmi: '保留史前遗址，适合历史散步。' }
    }
  }
};

const currentTmi = computed(() => {
  const base = districtTmiData[selectedDistrict.value];
  if (!base) return null;
  const lang = locale.value || 'ko';
  const tr = (base.translations && base.translations[lang]) || base.translations?.ko || {};
  return { lat: base.lat, lng: base.lng, placeName: tr.placeName || '', tmi: tr.tmi || '', image: tr.image || base.image || '' };
});

// toggle to show images in map popups (set false to remove pinpoint images)
const showPopupImages = ref(false);

// fetch representative image from Wikipedia / Wikimedia for a place name
const fetchDistrictImage = async (placeName) => {
  if (!placeName) return '';
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=original&titles=${encodeURIComponent(placeName)}`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query && data.query.pages;
    if (pages) {
      const page = Object.values(pages)[0];
      if (page && page.original && page.original.source) return page.original.source;
    }
  } catch (e) {
    // ignore
  }
  return '';
};

watch(selectedDistrict, async (val) => {
  if (!val) return;
  const base = districtTmiData[val];
  if (!base) return;
  // prefer the translated placeName for lookup
  const lang = locale.value || 'ko';
  const tr = (base.translations && base.translations[lang]) || base.translations?.ko || {};
  const query = tr.placeName || val;
  // if image is placeholder or missing, try to fetch
  if (!base.image || base.image.includes('placehold')) {
    const img = await fetchDistrictImage(query);
    if (img) base.image = img;
  }
  // update marker/card by re-running handler
  await nextTick();
  handleDistrictChange();
});

// 3. 피드(게시판) 상태
const posts = ref([]);
const selectedPost = ref(null);
const isEditing = ref(false);
const editingId = ref(null);
const boardForm = ref({ title: '', password: '', content: '' });
const selectedBoardDistrict = ref('');
const commentsDrafts = ref({});
const commentAuthors = ref({});
const commentEdits = ref({});
const filterDistrict = ref('');
const collapsedDistricts = ref({});
const sortBy = ref({}); // e.g. { '종로구': 'latest' }

watch(currentTab, async (newTab) => {
  if (newTab === 'home') {
    await nextTick();
    initMap();
  }
});

// 4. 데이터 로드 라이프사이클
onMounted(async () => {
  const savedPosts = localStorage.getItem('seoul_board_posts');
  if (savedPosts) posts.value = JSON.parse(savedPosts);

  try {
    const [resTrip, resCourse, resCulture, resShopping] = await Promise.all([
      fetch('/seoul_trip.json').then(r => r.json()).catch(() => ({})),
      fetch('/seoul_course.json').then(r => r.json()).catch(() => ({})),
      fetch('/seoul_culture.json').then(r => r.json()).catch(() => ({})),
      fetch('/seoul_shopping.json').then(r => r.json()).catch(() => ({}))
    ]);

    const extractArray = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data.items && Array.isArray(data.items)) return data.items;
      return [];
    };

    const tripItems = extractArray(resTrip);
    const courseItems = extractArray(resCourse);
    const cultureItems = extractArray(resCulture);
    const shoppingItems = extractArray(resShopping);

    const getCleanDistrict = (item) => {
      if (item.district) return item.district;
      const addr = item.addr1 || '';
      const title = item.title || '';
      
      for (const d of districts) {
        if (addr.includes(d) || title.includes(d)) return d;
      }
      if (title.includes("청와대") || addr.includes("청와대")) return "종로구";
      return "";
    };

    const tours = tripItems.map(item => ({
      ...item,
      source: '관광명소',
      district: getCleanDistrict(item)
    }));

    const courses = courseItems.map(item => ({
      ...item,
      source: '여행경로',
      district: getCleanDistrict(item)
    }));

    const cultures = cultureItems.map(item => ({
      ...item,
      source: '문화시설',
      district: getCleanDistrict(item)
    }));

    const shoppings = shoppingItems.map(item => ({
      ...item,
      source: '쇼핑',
      district: getCleanDistrict(item)
    }));

    // 추천 문화시설 & 쇼핑 카테고리에서 보여줄 데이터는 cultures + shoppings
    allLocations.value = [...tours, ...courses, ...cultures, ...shoppings];
    
    await nextTick();
    initMap();
  } catch (err) {
    console.error("데이터 초기화 에러:", err);
  }
});

// 5. 지도 관련 함수
const initMap = () => {
  if (map) { map.remove(); map = null; }
  const container = document.getElementById('map');
  if (!container) return;

  map = L.map('map', { zoomControl: false }).setView([37.5665, 126.9780], 11);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
};

const filteredPlaces = computed(() => {
  const currentTarget = selectedDistrict.value;

  // '추천 문화시설 & 쇼핑'은 선택한 권역구에 해당하는 항목만 표시
  if (selectedCategory.value === '추천 문화시설 & 쇼핑') {
    if (!currentTarget) return [];
    return allLocations.value.filter(p => (p.source === '문화시설' || p.source === '쇼핑') && ((p.district === currentTarget) || JSON.stringify(p).includes(currentTarget)));
  }

  if (!currentTarget) return [];
  return allLocations.value.filter(p => {
    if (p.source !== '관광명소') return false;
    if (p.district === currentTarget) return true;
    return JSON.stringify(p).includes(currentTarget);
  });
});

const savePost = () => {
  if (!boardForm.value.title || !boardForm.value.password || !boardForm.value.content) {
    return alert('모든 칸을 채워주세요!');
  }
  if (isEditing.value) {
    const idx = posts.value.findIndex(p => p.id === editingId.value);
    if (idx === -1) return alert('편집 중인 글을 찾을 수 없습니다.');
    if (posts.value[idx].password !== boardForm.value.password) return alert('비밀번호가 다릅니다!');
    posts.value[idx].title = boardForm.value.title;
    posts.value[idx].content = boardForm.value.content;
    posts.value[idx].district = selectedBoardDistrict.value || posts.value[idx].district;
  } else {
    const districtToUse = selectedBoardDistrict.value || selectedDistrict.value || '';
    posts.value.unshift({ id: Date.now(), ...boardForm.value, date: new Date().toLocaleDateString(), district: districtToUse, comments: [], likes: 0 });
  }
  updateLocalStorage();
  boardForm.value = { title: '', password: '', content: '' };
  selectedBoardDistrict.value = '';
  isEditing.value = false;
};
const cancelEdit = () => {
  isEditing.value = false;
  editingId.value = null;
  boardForm.value = { title: '', password: '', content: '' };
  selectedBoardDistrict.value = '';
  // scroll back to feed so user sees posts
  nextTick(() => {
    const feedEl = document.querySelector('.feed-wrapper');
    if (feedEl && feedEl.scrollIntoView) feedEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};
const startEdit = (post) => {
  if (!post) return;
  isEditing.value = true;
  editingId.value = post.id;
  boardForm.value = { title: post.title, password: '', content: post.content };
  // Ensure user is on the board tab and scroll to the form for editing
  currentTab.value = 'board';
  nextTick(() => {
    const formEl = document.querySelector('.form-wrapper');
    if (formEl && formEl.scrollIntoView) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const firstInput = formEl.querySelector('input[type="text"]');
      if (firstInput) firstInput.focus();
    }
  });
};
const deletePost = (post) => {
  const pw = prompt('비밀번호를 입력하세요:');
  if (pw === post.password) { posts.value = posts.value.filter(p => p.id !== post.id); updateLocalStorage(); }
  else if (pw !== null) alert('틀렸습니다!');
};

const submitComment = (postId) => {
  const text = (commentsDrafts.value[postId] || '').trim();
  if (!text) return;
  const idx = posts.value.findIndex(p => p.id === postId);
  if (idx === -1) return;
  if (!Array.isArray(posts.value[idx].comments)) posts.value[idx].comments = [];
  const author = (commentAuthors.value[postId] || '').trim() || '익명';
  posts.value[idx].comments.push({ id: Date.now(), text, author, date: new Date().toLocaleString() });
  commentsDrafts.value[postId] = '';
  commentAuthors.value[postId] = '';
  updateLocalStorage();
};

const likePost = (postId) => {
  const idx = posts.value.findIndex(p => p.id === postId);
  if (idx === -1) return;
  posts.value[idx].likes = (posts.value[idx].likes || 0) + 1;
  updateLocalStorage();
};

const startEditComment = (postId, comment) => {
  if (!comment) return;
  commentEdits.value[comment.id] = comment.text;
};

const saveEditComment = (postId, commentId) => {
  const idx = posts.value.findIndex(p => p.id === postId);
  if (idx === -1) return;
  const cidx = posts.value[idx].comments.findIndex(c => c.id === commentId);
  if (cidx === -1) return;
  const newText = (commentEdits.value[commentId] || '').trim();
  if (!newText) return alert('댓글 내용을 입력하세요');
  posts.value[idx].comments[cidx].text = newText;
  commentEdits.value[commentId] = '';
  updateLocalStorage();
};

const deleteComment = (postId, commentId) => {
  const idx = posts.value.findIndex(p => p.id === postId);
  if (idx === -1) return;
  posts.value[idx].comments = (posts.value[idx].comments || []).filter(c => c.id !== commentId);
  updateLocalStorage();
};

const toggleFilterDistrict = (d) => {
  filterDistrict.value = (filterDistrict.value === d) ? '' : d;
};

const selectBoardDistrict = (d) => {
  selectedBoardDistrict.value = d;
  filterDistrict.value = d;
};

const toggleCollapseDistrict = (d) => {
  collapsedDistricts.value[d] = !collapsedDistricts.value[d];
};

const setSortFor = (d, mode) => {
  sortBy.value[d] = mode;
};

const getSortedPosts = (d) => {
  const list = (groupedPosts.value.groups[d] || []).slice();
  const mode = sortBy.value[d] || 'latest';
  if (mode === 'popular') {
    list.sort((a,b) => ((b.likes||0) + (b.comments?.length||0)) - ((a.likes||0) + (a.comments?.length||0)));
  } else {
    list.sort((a,b) => (b.id || 0) - (a.id || 0));
  }
  return list;
};

const groupedPosts = computed(() => {
  const groups = {};
  for (const d of districts) groups[d] = [];
  // normalize and group posts by trimmed district
  for (const p of posts.value) {
    const pd = (p.district || '').toString().trim();
    if (pd) {
      if (!groups[pd]) groups[pd] = [];
      groups[pd].push(p);
    }
  }
  return { groups };
});

const homeFeedPosts = computed(() => {
  // If board filter is active (clicked icons or tag), prioritize it
  const fd = (filterDistrict.value || '').toString().trim();
  if (fd) return posts.value.filter(p => (p.district || '').toString().trim() === fd);

  // Next, if top dropdown is selected, use that
  const sd = (selectedDistrict.value || '').toString().trim();
  if (sd) return posts.value.filter(p => (p.district || '').toString().trim() === sd);

  // otherwise return latest 5 posts
  return posts.value.slice(0, 5);
});

const openPostFromHome = (postId) => {
  currentTab.value = 'board';
  // wait a tick for board to render
  setTimeout(() => { selectedPost.value = postId; }, 50);
};

// 유틸: 다양한 JSON 키에서 좌표를 추출
const extractCoords = (item) => {
  if (!item) return null;
  const latKeys = ['mapy','mapY','lat','latitude','y'];
  const lngKeys = ['mapx','mapX','lng','longitude','x'];
  let lat = null, lng = null;
  for (const k of latKeys) { if (item[k]) { lat = parseFloat(item[k]); break; } }
  for (const k of lngKeys) { if (item[k]) { lng = parseFloat(item[k]); break; } }
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
};

// 구 선택 시 지도 중앙 이동 및 대표 마커 표시
const handleDistrictChange = () => {
  if (!map) return;
  if (selectedDistrict.value && currentTmi.value) {
    const d = currentTmi.value;
    if (currentMarker) { try { map.removeLayer(currentMarker); } catch(e){} currentMarker = null; }
    // if district data has image, use proxy (include image only if showPopupImages)
    let districtImg = d.image || '';
    if (districtImg && districtImg.startsWith('http://')) districtImg = districtImg.replace(/^http:\/\//i, 'https://');
    const proxied = districtImg ? `/.netlify/functions/proxy-image?url=${encodeURIComponent(districtImg)}` : '';
    const popupHtml = showPopupImages.value && proxied ? `<div style="min-width:180px"><strong>${t(selectedDistrict.value)}</strong><div style="margin-top:6px">${d.placeName}</div><div style="margin-top:8px"><img src=\"${proxied}\" onerror=\"this.onerror=null;this.src='https://placehold.co/600x360?text=No+Image'\" style=\"width:100%;height:100px;object-fit:cover;border-radius:6px\"/></div></div>` : `<strong>${t(selectedDistrict.value)}</strong><div style="margin-top:6px">${d.placeName}</div>`;
    currentMarker = L.marker([d.lat, d.lng]).addTo(map).bindPopup(popupHtml, { maxWidth: 260 }).openPopup();
    map.setView([d.lat, d.lng], 12);
  } else {
    map.setView([37.5665, 126.9780], 11);
  }
};

// 리스트 항목 클릭 시 해당 위치로 마커 표시 및 팝업 (이미지 포함)
const clickPlace = (p) => {
  selectedPlaceDetail.value = p;
  if (!map) return;
  const coords = extractCoords(p);
  if (coords) {
  if (currentMarker) { try { map.removeLayer(currentMarker); } catch(e){} currentMarker = null; }
  currentMarker = L.marker([coords.lat, coords.lng]).addTo(map);
  const title = p.title || p.courseName || p.name || '';
  let img = p.firstimage || p.firstimage2 || p.image || p.thumb || '';
  // normalize to https to avoid mixed-content blocking
  if (img && img.startsWith('http://')) img = img.replace(/^http:\/\//i, 'https://');
  if (img && img.startsWith('//')) img = 'https:' + img;
  // use proxy to avoid mixed-content / CORS issues
  const proxiedSrc = img ? `/.netlify/functions/proxy-image?url=${encodeURIComponent(img)}` : '';
  // build popup; include image only if showPopupImages is true
  const popupHtml = showPopupImages.value ? `<div style="min-width:180px;"><strong>${title}</strong>${proxiedSrc ? `<div style=\"margin-top:6px\"><img src=\"${proxiedSrc}\" onerror=\"this.onerror=null;this.src='https://placehold.co/600x360?text=No+Image'\" style=\"width:100%;height:100px;object-fit:cover;border-radius:6px\"/></div>` : ''}</div>` : `<div style="min-width:180px;"><strong>${title}</strong></div>`;
  currentMarker.bindPopup(popupHtml, { maxWidth: 260 }).openPopup();
    map.setView([coords.lat, coords.lng], 15);
  } else if (selectedDistrict.value && currentTmi.value) {
    const d = currentTmi.value;
    if (currentMarker) { try { map.removeLayer(currentMarker); } catch(e){} currentMarker = null; }
    currentMarker = L.marker([d.lat, d.lng]).addTo(map).bindPopup(`<strong>${d.placeName}</strong>`).openPopup();
    map.setView([d.lat, d.lng], 12);
  }
};
</script>

<template>
  <div :class="['app-container', 'lang-' + locale]">
    <header class="navbar">
      <div class="logo">🎈 {{ t('logo') }}</div>
      <div class="nav-controls">
        <nav class="nav-links">
          <button :class="{ active: currentTab === 'home' }" @click="currentTab = 'home'">{{ t('navHome') }}</button>
          <button :class="{ active: currentTab === 'board' }" @click="currentTab = 'board'">{{ t('navBoard') }}</button>
        </nav>
        <div class="lang-switcher">
          <div class="lang-current">
            <button class="lang-btn" @click.stop="langMenuOpen = !langMenuOpen" aria-label="Change language">{{ langLabels[locale] }}</button>
            <div v-if="langMenuOpen" class="lang-menu">
              <button v-for="(label, code) in langLabels" :key="code" @click="selectLang(code)" :class="{ active: locale===code }">{{ label }}</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div v-if="currentTab === 'home'" class="tab-content">
      <section class="hero">
        <h1>{{ t('heroTitle') }}</h1>
        <p>{{ t('heroSub') }}</p>
        <select v-model="selectedDistrict" @change="handleDistrictChange" class="styled-select">
          <option value="">{{ t('selectDistrict') }}</option>
          <option v-for="d in districts" :key="d" :value="d">{{ t(d) }}</option>
        </select>
      </section>

      <main class="main-layout">
        <div class="map-area">
          <div id="map"></div>
          <div v-if="selectedDistrict && currentTmi" class="tmi-card">
            <h4>💡 {{ t(selectedDistrict) }} {{ t('picnicGuide') }}</h4>
            <p><strong>🏠 {{ t('tmiPlace') }}:</strong> {{ currentTmi.placeName }}</p>
            <p class="desc">{{ currentTmi.tmi }}</p>
          </div>
          
        </div>

        <div class="list-area">
          <div class="cat-toggle">
            <button v-for="c in categories" :key="c" :class="{ active: selectedCategory === c }" @click="selectedCategory = c">{{ t(c) }}</button>
          </div>
          <div v-if="selectedPlaceDetail" class="detail-panel">
            <div class="detail-header">
              <h3>{{ selectedPlaceDetail.title || selectedPlaceDetail.courseName }}</h3>
              <button class="close-detail" @click="selectedPlaceDetail = null">✕</button>
            </div>
            <div class="detail-body">
              <img v-if="selectedPlaceDetail.firstimage || selectedPlaceDetail.firstimage2" :src="selectedPlaceDetail.firstimage || selectedPlaceDetail.firstimage2" :alt="selectedPlaceDetail.title" />
              <p v-if="selectedPlaceDetail.addr1">📍 {{ selectedPlaceDetail.addr1 }}</p>
              <p v-if="selectedPlaceDetail.tel">📞 {{ selectedPlaceDetail.tel }}</p>
              <p v-if="selectedPlaceDetail.mapx && selectedPlaceDetail.mapy">🗺️ {{ selectedPlaceDetail.mapy }}, {{ selectedPlaceDetail.mapx }}</p>
              <p v-if="selectedPlaceDetail.contentid">ID: {{ selectedPlaceDetail.contentid }}</p>
            </div>
          </div>
          <div class="scroll-cards">
            <div v-for="(p, i) in filteredPlaces" :key="i" class="place-card" @click="clickPlace(p)">
              <h3>{{ p.title || p.courseName }}</h3>
              <p>📍 {{ p.addr1 || '추천 코스 요약 정보' }}</p>
            </div>
            <p v-if="!filteredPlaces.length" class="empty-tip">🐰 {{ t('noPlaces') }}</p>
          </div>
        </div>
      </main>
    </div>

    <div v-if="currentTab === 'board'" class="tab-content board-layout">
      <div class="feed-wrapper">
        <div class="home-feed-panel">
          <h4>💌 {{ t('postCount') }}</h4>
          <div v-if="!homeFeedPosts.length" style="color:#666">{{ t('noPosts') }}</div>
          <div v-else>
            <div v-for="p in homeFeedPosts" :key="p.id" class="feed-card" @click="selectedPost = selectedPost === p.id ? null : p.id">
              <div class="feed-title-bar">
                <div>
                  <h4>{{ p.title }}</h4>
                  <div class="post-meta">{{ p.district ? '📍 ' + p.district : '' }}</div>
                </div>
                <span>{{ p.date }}</span>
              </div>

              <div v-if="selectedPost === p.id" class="feed-details" @click.stop>
                <p>{{ p.content }}</p>
                <div class="btn-group">
                  <button @click.stop="startEdit(p)">✏️</button>
                  <button @click.stop="deletePost(p)">🗑️</button>
                </div>
                <div class="comments-section">
                  <h4>댓글 ({{ (p.comments || []).length }})</h4>
                  <div class="comment" v-for="c in p.comments || []" :key="c.id">
                    <small>{{ c.date }} · {{ c.author || '익명' }}</small>
                    <p v-if="!commentEdits[c.id]">{{ c.text }}</p>
                    <div v-else>
                      <input v-model="commentEdits[c.id]" />
                      <button @click="saveEditComment(p.id, c.id)">저장</button>
                      <button @click="commentEdits[c.id] = ''">취소</button>
                    </div>
                    <div style="margin-top:6px">
                      <button @click.stop="startEditComment(p.id, c)">수정</button>
                      <button @click.stop="deleteComment(p.id, c.id)">삭제</button>
                    </div>
                  </div>
                  <div class="add-comment">
                    <input v-model="commentAuthors[p.id]" placeholder="작성자명" style="width:120px" />
                    <input v-model="commentsDrafts[p.id]" placeholder="댓글 입력" />
                    <button @click="submitComment(p.id)">등록</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 권역 태그 필터 -->
        <div style="margin-bottom:12px" class="district-filter-bar">
          <select v-model="filterDistrict" class="styled-select">
            <option value="">{{ t('allSeoul') || '모두' }}</option>
            <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
        <div v-for="d in Object.keys(groupedPosts.groups)" :key="d" v-if="groupedPosts.groups[d] && groupedPosts.groups[d].length && (!filterDistrict || filterDistrict===d)">
          <h3 class="district-header" @click="toggleFilterDistrict(d)">
            {{ d }} ({{ groupedPosts.groups[d].length }})
            <small style="margin-left:8px;color:#999;">(클릭으로 필터 토글)</small>
            <div style="float:right;display:flex;gap:8px;align-items:center">
              <button @click.stop="toggleCollapseDistrict(d)">{{ collapsedDistricts[d] ? '펼치기' : '접기' }}</button>
              <button @click.stop="setSortFor(d,'latest')" :class="{ active: sortBy[d]==='latest' }">최신</button>
              <button @click.stop="setSortFor(d,'popular')" :class="{ active: sortBy[d]==='popular' }">인기</button>
            </div>
          </h3>
          <div v-if="!collapsedDistricts[d]">
            <div v-for="post in getSortedPosts(d)" :key="post.id" class="feed-card" @click="selectedPost = selectedPost === post.id ? null : post.id">
            <div class="feed-title-bar">
              <div>
                <h4>{{ post.title }}</h4>
                <div class="post-meta">{{ post.district ? '📍 ' + post.district : '' }}</div>
              </div>
              <span>{{ post.date }}</span>
            </div>
            <div v-if="selectedPost === post.id" class="feed-details" @click.stop>
              <p>{{ post.content }}</p>
              <div class="btn-group">
                <button @click.stop="startEdit(post)">✏️</button>
                <button @click.stop="deletePost(post)">🗑️</button>
              </div>
              <div class="comments-section">
                <h4>댓글 ({{ (post.comments || []).length }})</h4>
                <div class="comment" v-for="c in post.comments || []" :key="c.id">
                  <small>{{ c.date }} · {{ c.author || '익명' }}</small>
                  <p v-if="!commentEdits[c.id]">{{ c.text }}</p>
                  <div v-else>
                    <input v-model="commentEdits[c.id]" />
                    <button @click="saveEditComment(post.id, c.id)">저장</button>
                    <button @click="commentEdits[c.id] = ''">취소</button>
                  </div>
                  <div style="margin-top:6px">
                    <button @click.stop="startEditComment(post.id, c)">수정</button>
                    <button @click.stop="deleteComment(post.id, c.id)">삭제</button>
                  </div>
                </div>
                <div class="add-comment">
                  <input v-model="commentAuthors[post.id]" placeholder="작성자명" style="width:120px" />
                  <input v-model="commentsDrafts[post.id]" placeholder="댓글 입력" />
                  <button @click="submitComment(post.id)">등록</button>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-wrapper">
        <h2>{{ isEditing ? t('editPost') : t('writePost') }}</h2>
        <div class="district-icons">
          <select v-model="selectedBoardDistrict" class="styled-select">
            <option value="">{{ t('selectDistrict') }}</option>
            <option v-for="d in districts" :key="d" :value="d">📍 {{ d }}</option>
          </select>
        </div>
        <p v-if="selectedBoardDistrict">선택된 권역: <strong>{{ selectedBoardDistrict }}</strong></p>
        <input v-model="boardForm.title" type="text" :placeholder="t('phTitle')" />
        <input v-model="boardForm.password" type="password" :placeholder="t('phPw')" />
        <textarea v-model="boardForm.content" :placeholder="t('phContent')" rows="5"></textarea>
        <div class="form-actions">
          <button @click="savePost" class="btn-main">{{ isEditing ? t('btnEditComplete') : t('btnRegister') }}</button>
          <button @click="cancelEdit" class="btn-cancel">{{ t('btnCancel') }}</button>
        </div>
      </div>
    </div>

    <ChatBot />
  </div>
</template>

<style>
:root { --primary: #ff7675; --bg: #fffbf0; --surface: #ffffff; --text: #2d3436; }
body { margin: 0; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; background: var(--bg); color: var(--text); }
.app-container { display: flex; flex-direction: column; min-height: 100vh; }

/* Ensure box-sizing so flex children can shrink properly */
*, *::before, *::after { box-sizing: border-box; }

.navbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 40px; background: var(--surface); box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.logo { font-size: 20px; font-weight: bold; color: var(--primary); }
.nav-controls { display: flex; gap: 20px; }
.nav-links button, .lang-switcher button { background: none; border: none; cursor: pointer; padding: 8px 12px; font-size: 14px; border-radius: 6px; }
.nav-links button.active { background: var(--primary); color: white; }

.hero { text-align: center; padding: 40px 20px; background: linear-gradient(180deg, #ffeaa7 0%, var(--bg) 100%); }
.styled-select { padding: 10px 20px; font-size: 16px; border-radius: 8px; border: 2px solid var(--primary); outline: none; margin-top: 15px; width: 100%; box-sizing: border-box; max-width: none; }

.main-layout { display: flex; flex-direction: column; gap: 24px; padding: 24px 40px; box-sizing: border-box; }
.map-area { position: relative; display: block; gap: 12px; height: auto; }
#map { width: 100%; height: 60vh; max-height: 720px; border-radius: 16px; border: 2px solid #ffeaa7; min-height: 300px; z-index: 1; }
.tmi-card { background: var(--surface); padding: 16px; border-radius: 12px; border-left: 5px solid var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.tmi-card .desc { margin-top:6px; color:#555; font-size:13px; }
.home-feed-panel { background: #fff; padding: 12px; border-radius: 12px; margin-top: 12px; border: 1px solid #f1e6e6; }
.home-feed-panel .place-card { cursor: pointer; }

.list-area { display: flex; flex-direction: column; gap: 16px; background: var(--surface); padding: 16px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); height: auto; overflow: hidden; max-height: 48vh; }
.cat-toggle { display: flex; gap: 8px; }
.cat-toggle button { flex: 1; padding: 10px; border: none; border-radius: 8px; cursor: pointer; background: #eee; font-weight: bold; }
.cat-toggle button.active { background: var(--primary); color: white; }
.detail-panel { background: #fff; border-radius: 12px; padding: 12px; margin-top: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.06); border: 1px solid #f1e6e6; }
.detail-header { display:flex; justify-content: space-between; align-items: center; }
.detail-header h3 { margin:0; font-size: 16px; }
.close-detail { background: transparent; border:none; font-size:18px; cursor:pointer; }
.detail-body img { width:100%; max-height:200px; object-fit:cover; border-radius:8px; margin-bottom:8px; }
.detail-body p { margin:4px 0; font-size:13px; }
.scroll-cards { display: flex; flex-direction: column; gap: 10px; padding-right: 4px; flex: 1 1 auto; overflow-y: auto; max-height: 100%; }
.place-card { padding: 12px; background: #fffbf0; border-radius: 8px; cursor: pointer; border: 1px solid #ffeaa7; transition: transform 0.1s; }
.place-card:hover { transform: translateY(-2px); }
.empty-tip { text-align: center; color: #999; margin-top: 40px; font-size: 14px; }

.board-layout { display: flex; flex-direction: column; gap: 24px; padding: 24px 40px; }
.feed-wrapper { background: var(--surface); padding: 24px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); display: block; }
.feed-wrapper .home-feed-panel { margin-bottom: 12px; }
.feed-wrapper .district-filter-bar { margin-bottom: 12px; }
.form-wrapper { background: var(--surface); padding: 24px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 12px; }
.form-wrapper input, .form-wrapper textarea { width: 100%; border: 1px solid #ddd; padding: 10px; border-radius: 8px; box-sizing: border-box; outline: none; }
.btn-main { background: var(--primary); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; }
.feed-card { padding: 16px; background: #fffbf0; border-radius: 8px; cursor: pointer; border: 1px solid #ffeaa7; }
.feed-title-bar { display: flex; justify-content: space-between; align-items: center; }
.feed-details { margin-top: 12px; padding-top: 12px; border-top: 1px dashed #ffeaa7; }
.feed-details { overflow: visible; }
.btn-group { display: flex; gap: 8px; justify-content: flex-end; }
.btn-group button { border: none; background: none; cursor: pointer; font-size: 16px; }
.district-icons { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:8px; margin-bottom:8px; }
.district-icons button { background:#fff; border:1px solid #eee; padding:8px 12px; border-radius:8px; cursor:pointer; font-size:14px; }
.district-icons button.active { background:var(--primary); color:#fff; }
.district-icons select { grid-column: 1 / -1; width: 100%; }
.district-filter-bar { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:8px; margin-bottom:8px; overflow-x:auto; }
.district-filter-bar button { padding:8px 12px; border-radius:8px; border:1px solid #eee; background:#fff; cursor:pointer; font-size:14px; }
.district-filter-bar button.active { background:var(--primary); color:#fff; }
.district-filter-bar select { grid-column: 1 / -1; width: 100%; }
.post-meta { font-size:12px; color:#666; }
.comments-section { margin-top:12px; border-top:1px dashed #f1e6e6; padding-top:8px; }
.comment { background:#f9f7f7; padding:8px; border-radius:6px; margin-bottom:6px; }
.add-comment { display:flex; gap:8px; }
.add-comment input { flex:1; padding:6px; border-radius:6px; border:1px solid #ddd; min-width:0; }
.comments-section input { min-width:0; }
.comment small, .comment p { word-break: break-word; white-space: normal; }
.add-comment button { background:var(--primary); color:#fff; border:none; padding:6px 10px; border-radius:6px; }

.btn-cancel { background: #f1f1f1; border: 1px solid #ddd; padding: 10px 12px; border-radius: 8px; cursor: pointer; }

/* Use Rubik for all locales (preset D) */
.lang-ko, .lang-zh, .lang-en { font-family: 'Rubik', 'Noto Sans', 'Segoe UI', Roboto, Arial, sans-serif; }

@media (max-width: 768px) {
  .navbar { padding: 10px 12px; }
  .nav-links button, .lang-switcher button { padding: 6px 8px; font-size: 13px; }
  .hero { padding: 20px 12px; }
  .hero h1 { font-size: 24px; }
  .hero p { font-size: 13px; }
  .styled-select { max-width: 100%; }
  .main-layout { gap: 14px; padding: 12px; }
  .map-area, .list-area { height: auto; }
  #map { height: 46vh; min-height: 220px; }
  .scroll-cards { max-height: 36vh; }
  .feed-card, .place-card { font-size: 14px; }
  .cat-toggle button { padding: 9px; font-size: 14px; }
  .district-icons button, .district-filter-bar button { padding: 8px 10px; font-size: 13px; }
  .form-wrapper, .feed-wrapper { padding: 14px; }
  .btn-main { padding: 10px; }
  .add-comment input { padding: 8px; }
  .chatbot-wrapper { bottom: 16px; right: 12px; }
}

@media (max-width: 420px) {
  .hero h1 { font-size: 20px; }
  .styled-select { font-size: 14px; }
  .place-card h3, .feed-card h4 { font-size: 15px; }
  #map { height: 42vh; }
  .scroll-cards { max-height: 40vh; }
  .btn-main { padding: 9px 10px; font-size: 14px; }
}

/* Language switcher as single flag with popup */
.lang-switcher { position: relative; }
.lang-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; }
.lang-btn svg { width: 28px; height: 18px; display: block; }
.lang-menu { position: fixed; right: 16px; top: 64px; background: white; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 8px 20px rgba(0,0,0,0.12); display: flex; flex-direction: column; z-index: 9999; }
.lang-menu button { background: none; border: none; padding: 8px 12px; cursor: pointer; }
.lang-menu button svg { width: 36px; height: 22px; }
.lang-menu button.active { background: var(--primary); color: white; border-radius: 6px; }

/* form actions positioned below inputs */
.form-actions { display:flex; gap:8px; flex-direction: column; align-items: center; margin-top: 12px; }
.form-actions button { white-space: nowrap; min-width: 160px; }

@media (max-width: 1024px) {
  .district-icons { grid-template-columns: repeat(3, minmax(0,1fr)); }
  .district-filter-bar { grid-template-columns: repeat(3, minmax(0,1fr)); }
}

@media (max-width: 420px) {
  .district-icons { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .district-filter-bar { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .form-actions button { min-width: 140px; }
}
</style>