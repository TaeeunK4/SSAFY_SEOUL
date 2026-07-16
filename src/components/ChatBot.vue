<template>
  <div class="chatbot-wrapper">
    <button class="chatbot-toggle-btn" @click="isChatOpen = !isChatOpen" :aria-label="isChatOpen ? 'Close chatbot' : 'Open chatbot'">
      <span v-if="!isChatOpen">🤖</span>
      <span v-else>✕</span>
    </button>

    <div v-if="isChatOpen" class="chatbot-window">
      <div class="chatbot-header">
        <h3>🤖 가이드 봇</h3>
        <p>여행지 위치를 알려드릴게요!</p>
      </div>
      
      <div class="chatbot-messages" ref="messageBox">
        <div v-for="(msg, idx) in chatMessages" :key="idx" :class="['message-bubble', msg.role]">
          <strong>{{ msg.role === 'user' ? '나' : 'AI' }}:</strong>
          <template v-if="msg.role === 'assistant'">
            <div v-if="(parseAssistantContent(msg.content).name || parseAssistantContent(msg.content).address || parseAssistantContent(msg.content).image)" class="assistant-brief">
              <div class="assistant-brief-head">
                <strong class="place-name">{{ parseAssistantContent(msg.content).name }}</strong>
              </div>
              <div class="assistant-brief-body">
                <p v-if="parseAssistantContent(msg.content).address">{{ parseAssistantContent(msg.content).address }}</p>
                <img v-if="parseAssistantContent(msg.content).image" :src="parseAssistantContent(msg.content).image" alt="place image" />
              </div>
            </div>
            <p v-else>{{ msg.content }}</p>
          </template>
          <template v-else>
            <p>{{ msg.content }}</p>
          </template>
        </div>
        <div v-if="isChatLoading" class="message-bubble assistant loading">
          ⏳ AI가 답변을 생성 중입니다...
        </div>
      </div>

      <div class="chatbot-input">
        <input v-model="userInput" @keyup.enter="askChatbot" type="text" placeholder="코스를 물어보세요!" :disabled="isChatLoading" />
        <button @click="askChatbot" :disabled="isChatLoading">보내기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { getChatbotResponse } from '../utils/openai.js';

const userInput = ref('');
const chatMessages = ref([]);
const isChatOpen = ref(false);
const isChatLoading = ref(false);
const messageBox = ref(null);

const askChatbot = async () => {
  if (!userInput.value.trim() || isChatLoading.value) return;
  
  const userText = userInput.value;
  chatMessages.value.push({ role: 'user', content: userText });
  userInput.value = '';
  isChatLoading.value = true;
  
  await nextTick(() => { 
    if (messageBox.value) messageBox.value.scrollTop = messageBox.value.scrollHeight; 
  });

  try {
    const reply = await getChatbotResponse(userText);
    chatMessages.value.push({ role: 'assistant', content: reply });
  } catch (error) {
    console.error(error);
    chatMessages.value.push({ 
      role: 'assistant', 
      content: '앗, 백엔드 서버와의 통신 중에 에러가 발생했어요! FastAPI 서버가 켜져 있는지 확인해 주세요.' 
    });
  } finally {
    isChatLoading.value = false;
    await nextTick(() => { 
      if (messageBox.value) messageBox.value.scrollTop = messageBox.value.scrollHeight; 
    });
  }
};

// Try to extract structured fields from assistant content: name/title, address, image url
const parseAssistantContent = (content) => {
  if (!content) return {};
  // 1) try JSON
  try {
    const j = JSON.parse(content);
    // helper to find keys
    const findKey = (obj, candidates) => {
      if (!obj || typeof obj !== 'object') return null;
      for (const k of Object.keys(obj)) {
        if (candidates.includes(k.toLowerCase())) return obj[k];
      }
      // recursive
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        const res = findKey(v, candidates);
        if (res) return res;
      }
      return null;
    };
    const name = findKey(j, ['name','placename','title','place','place_name']);
    const addr = findKey(j, ['addr','address','addr1','주소']);
    const image = findKey(j, ['image','firstimage','img','imageurl','photo','thumbnail']);
    return { name: name || '', address: addr || '', image: image || '' };
  } catch (e) {
    // not JSON
  }

  // 2) try regex: find first image URL
  const urlRegex = /(https?:\/\/[^\s"']+\.(?:png|jpe?g|gif|webp))/i;
  const urlMatch = content.match(urlRegex);
  const image = urlMatch ? urlMatch[1] : '';

  // 3) try to extract lines like '주소: ...' and first line as name
  const lines = content.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  let name = '';
  let address = '';
  if (lines.length) {
    // prefer a line that looks like '이름:' or 'name:'
    for (const line of lines) {
      const m = line.match(/^(?:이름|name|place|title|장소)[:\s]+(.+)$/i);
      if (m) { name = m[1]; break; }
    }
    for (const line of lines) {
      const m = line.match(/^(?:주소|address|addr)[:\s]+(.+)$/i);
      if (m) { address = m[1]; break; }
    }
    // fallback: first line may be name
    if (!name) name = lines[0];
  }

  return { name: name || '', address: address || '', image: image || '' };
};
</script>

<style scoped>
.chatbot-wrapper { position: fixed; bottom: 25px; right: 25px; z-index: 1000; }
.chatbot-toggle-btn { width: 84px; height: 84px; border-radius: 50%; background: #2d3436; color: white; border: none; font-weight: 900; cursor: pointer; box-shadow: 0 8px 20px rgba(0,0,0,0.18); font-size: 22px; display:flex; align-items:center; justify-content:center; }
.chatbot-window { width: 310px; height: 420px; background: white; border-radius: 20px; box-shadow: 0 8px 25px rgba(0,0,0,0.12); position: absolute; bottom: 85px; right: 0; display: flex; flex-direction: column; overflow: hidden; border: 2px solid #2d3436; }
.chatbot-header { background: #2d3436; color: white; padding: 12px 16px; text-align: left; }
.chatbot-header h3 { margin: 0; font-size: 16px; font-weight: 700; }
.chatbot-header p { margin: 6px 0 0 0; font-size: 12px; opacity: 0.85; }
.chatbot-messages { flex: 1; padding: 12px; overflow-y: auto; background: #faf8f5; display: flex; flex-direction: column; gap: 8px; }
.message-bubble { padding: 8px 12px; border-radius: 12px; max-width: 85%; font-size: 14px; line-height: 1.5; font-weight: 500; text-align: left; white-space: pre-wrap; word-break: break-word; }
.message-bubble strong { display: block; font-weight: 700; font-size: 13px; margin-bottom: 4px; }
.message-bubble p { margin: 0; font-weight: 400; font-size: 14px; }
.message-bubble.user { background: #fff3d6; align-self: flex-end; color: #2d3436; }
.message-bubble.user strong { color: #ff7675; }
.message-bubble.assistant { background: white; align-self: flex-start; border: 1px solid #edf2f7; color: #2d3436; }
.message-bubble.assistant strong { color: #2d3436; }
.assistant-brief { background:#fff; padding:8px; border-radius:8px; border:1px solid #eee; }
.assistant-brief-head { margin-bottom:6px; }
.assistant-brief .place-name { font-size:14px; display:block; }
.assistant-brief-body p { margin:0 0 8px 0; font-size:13px; color:#444; }
.assistant-brief-body img { width:100%; max-width:220px; height:auto; border-radius:6px; display:block; }
.chatbot-input { display: flex; border-top: 1px solid #edf2f7; padding: 8px; background: white; }
.chatbot-input input { flex: 1; padding: 8px; border: 1px solid #edf2f7; border-radius: 8px; outline: none; font-size: 14px; font-weight: 400; }
.chatbot-input button { background: #ff7675; color: white; border: none; padding: 6px 12px; margin-left: 8px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 700; }

/* Responsive sizing removed per request; chatbot keeps fixed dimensions */
</style>