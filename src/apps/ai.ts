import type {App} from './types'

export const ai: App[] = [
  {
    id: 'grok',
    name: 'Grok',
    package: 'ai.x.grok',
    fallbackUrl: 'https://grok.com',
    icon: '/app-icons/grok.webp',
  },
  {
    id: 'alice',
    name: 'Alice',
    package: 'com.yandex.aliceapp',
    fallbackUrl: 'https://alice.yandex.ru',
    icon: '/app-icons/alice.webp',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    package: 'com.openai.chatgpt',
    fallbackUrl: 'https://chatgpt.com',
    icon: '/app-icons/chatgpt.webp',
  },
  {
    id: 'claude',
    name: 'Claude',
    package: 'com.anthropic.claude',
    fallbackUrl: 'https://claude.ai',
    icon: '/app-icons/claude.webp',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    package: 'com.google.android.apps.bard',
    fallbackUrl: 'https://gemini.google.com',
    icon: '/app-icons/gemini.webp',
  },
  {
    id: 'qwen',
    name: 'Qwen',
    package: 'ai.qwenlm.chat.android',
    fallbackUrl: 'https://chat.qwen.ai',
    icon: '/app-icons/qwen.webp',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    package: 'com.deepseek.chat',
    fallbackUrl: 'https://chat.deepseek.com',
    icon: '/app-icons/deepseek.webp',
  },
  {
    id: 'kimi',
    name: 'Kimi',
    package: 'com.moonshot.kimichat',
    fallbackUrl: 'https://kimi.com',
    icon: '/app-icons/kimi.webp',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    package: 'ai.perplexity.app.android',
    scheme: 'perplexity',
    fallbackUrl: 'https://perplexity.ai',
    icon: '/app-icons/perplexity.webp',
  },
]
