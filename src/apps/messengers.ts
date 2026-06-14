import type {App} from './types'

export const messengers: App[] = [
  {
    id: 'telegram',
    name: 'Telegram',
    package: 'org.telegram.messenger',
    scheme: 'tg',
    path: '',
    fallbackUrl: 'https://web.telegram.org',
    icon: '/app-icons/telegram.webp',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    package: 'com.whatsapp',
    fallbackUrl: 'https://wa.me',
    icon: '/app-icons/whatsapp.webp',
  },
  {
    id: 'wechat',
    name: 'WeChat',
    package: 'com.tencent.mm',
    scheme: 'weixin',
    fallbackUrl: 'https://web.wechat.com',
    icon: '/app-icons/wechat.webp',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    package: 'com.instagram.android',
    fallbackUrl: 'https://www.instagram.com',
    icon: '/app-icons/instagram.webp',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    package: 'com.facebook.katana',
    scheme: 'fb',
    fallbackUrl: 'https://m.facebook.com',
    icon: '/app-icons/facebook.webp',
  },
  {
    id: 'vk',
    name: 'VK',
    package: 'com.vkontakte.android',
    scheme: 'vk',
    path: '',
    fallbackUrl: 'https://vk.com',
    icon: '/app-icons/vk.webp',
  },
]
