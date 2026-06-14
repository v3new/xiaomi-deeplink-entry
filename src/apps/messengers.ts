import type {App} from './types'

export const messengers: App[] = [
  {
    id: 'telegram',
    name: 'Telegram',
    package: 'org.telegram.messenger',
    scheme: 'tg',
    path: '',
    fallbackUrl: 'https://web.telegram.org',
    icon: 'https://play-lh.googleusercontent.com/ZU9cSsyIJZo6Oy7HTHiEPwZg0m2Crep-d5ZrfajqtsH-qgUXSqKpNA2FpPDTn-7qA5Q=s64-rw',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    package: 'com.whatsapp',
    fallbackUrl: 'https://wa.me',
    icon: 'https://play-lh.googleusercontent.com/bYtqbOcTYOlgc6gqZ2rwb8lptHuwlNE75zYJu6Bn076-hTmvd96HH-6v7S0YUAAJXoJN=s64-rw',
  },
  {
    id: 'wechat',
    name: 'WeChat',
    package: 'com.tencent.mm',
    scheme: 'weixin',
    fallbackUrl: 'https://web.wechat.com',
    icon: 'https://play-lh.googleusercontent.com/QbSSiRcodmWx6HlezOtNu3vmZeuFqkQZQQO5Y2-Zg_jBRm-mXjhlXX5yFj8iphfqzQ=s64-rw',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    package: 'com.instagram.android',
    fallbackUrl: 'https://www.instagram.com',
    icon: 'https://play-lh.googleusercontent.com/VRMWkE5p3CkWhJs6nv-9ZsLAs1QOg5ob1_3qg-rckwYW7yp1fMrYZqnEFpk0IoVP4LM=s64-rw',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    package: 'com.facebook.katana',
    scheme: 'fb',
    fallbackUrl: 'https://m.facebook.com',
    icon: 'https://play-lh.googleusercontent.com/KCMTYuiTrKom4Vyf0G4foetVOwhKWzNbHWumV73IXexAIy5TTgZipL52WTt8ICL-oIo=s64-rw',
  },
  {
    id: 'vk',
    name: 'VK',
    package: 'com.vkontakte.android',
    scheme: 'vk',
    path: '',
    fallbackUrl: 'https://vk.com',
    icon: 'https://play-lh.googleusercontent.com/GntsGclzheXXASOhjSF1lCOPOznM_OARDObiTW_NQZtpYVwPQr_0ARyRyiXB0_OocmI=s64-rw',
  },
]
