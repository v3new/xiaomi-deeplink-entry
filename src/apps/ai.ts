import type {App} from './types'

export const ai: App[] = [
  {
    id: 'grok',
    name: 'Grok',
    package: 'ai.x.grok',
    fallbackUrl: 'https://grok.com',
    iconSource:
      'https://play-lh.googleusercontent.com/-VnI9BrQO0PYyZG15YE6wt68KOmZ7AXGAqGti58g25ES1XdXWDBaaWUMIewHaiROwge6ibvn_b3WalmpgWGG=s64-rw',
    icon: '/app-icons/grok.webp',
  },
  {
    id: 'alice',
    name: 'Alice',
    package: 'com.yandex.aliceapp',
    fallbackUrl: 'https://alice.yandex.ru',
    iconSource:
      'https://play-lh.googleusercontent.com/EJpCCkNQrYAyD4NdTcWUe-RSdr1LGTz9ya6FQ1Q-H9RLRdhdg85_oHgHNrWxNiCVgcVD=w480-h960-rw',
    icon: '/app-icons/alice.webp',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    package: 'com.openai.chatgpt',
    fallbackUrl: 'https://chatgpt.com',
    iconSource:
      'https://play-lh.googleusercontent.com/lmG9HlI0awHie0cyBieWXeNjpyXvHPwDBb8MNOVIyp0P8VEh95AiBHtUZSDVR3HLe3A=s64-rw',
    icon: '/app-icons/chatgpt.webp',
  },
  {
    id: 'claude',
    name: 'Claude',
    package: 'com.anthropic.claude',
    fallbackUrl: 'https://claude.ai',
    iconSource:
      'https://play-lh.googleusercontent.com/YeFCFSW5LkBVdsEAL_fjzxDxTbhKz31j1uZUfDbSaCeM0t4Bi3SqyHTWzWsUsZnbwjofXhYajitG_gr2_B2xil8=s64-rw',
    icon: '/app-icons/claude.webp',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    package: 'com.google.android.apps.bard',
    fallbackUrl: 'https://gemini.google.com',
    iconSource:
      'https://play-lh.googleusercontent.com/C64IqPWyFoCZzXVxXVl0Y6mliiNlG_sZJsqul-SBvk9ZL0wJHlU0Eho2wvsBHhho0FT5XQtH55RVGerIwXF_MA=s64-rw',
    icon: '/app-icons/gemini.webp',
  },
  {
    id: 'qwen',
    name: 'Qwen',
    package: 'ai.qwenlm.chat.android',
    fallbackUrl: 'https://chat.qwen.ai',
    iconSource:
      'https://play-lh.googleusercontent.com/xHa2Dp5swUn3bkD1PexbSn8pDqfLjQ_H_p4aGmh_rOaq70ZzA8HFqcRkSZFO6ZhChlus=s64-rw',
    icon: '/app-icons/qwen.webp',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    package: 'com.deepseek.chat',
    fallbackUrl: 'https://chat.deepseek.com',
    iconSource:
      'https://play-lh.googleusercontent.com/d2zqBFBEymSZKaVg_dRo1gh3hBFn7_Kl9rO74xkDmnJeLgDW0MoJD3cUx0QzZN6jdsg=s64-rw',
    icon: '/app-icons/deepseek.webp',
  },
  {
    id: 'kimi',
    name: 'Kimi',
    package: 'com.moonshot.kimichat',
    fallbackUrl: 'https://kimi.com',
    iconSource:
      'https://play-lh.googleusercontent.com/auZDYrlHiwgmB9VCsS9V-VeKM1-dlZmQ5K6nwLWjsBcTbGaLdxBh2TQKM0Z5k8QRrzU=s64-rw',
    icon: '/app-icons/kimi.webp',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    package: 'ai.perplexity.app.android',
    scheme: 'perplexity',
    fallbackUrl: 'https://perplexity.ai',
    iconSource:
      'https://play-lh.googleusercontent.com/6STp0lYx2ctvQ-JZpXA1LeAAZIlq6qN9gpy7swLPlRhmp-hfvZePcBxqwVkqN2BH1g=s64-rw',
    icon: '/app-icons/perplexity.webp',
  },
]
