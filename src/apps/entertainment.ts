import type {App} from './types'

export const entertainment: App[] = [
  {
    id: 'kinopub',
    name: 'Kinopub',
    package: 'com.kinopub',
    fallbackUrl: 'https://kino.pub',
    icon: '/app-icons/kinopub.png',
  },
  {
    id: 'kinopoisk',
    name: 'Kinopoisk',
    package: 'ru.kinopoisk',
    scheme: 'kp',
    path: 'mainView',
    fallbackUrl: 'https://hd.kinopoisk.ru',
    icon: '/app-icons/kinopoisk.webp',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    package: 'com.google.android.youtube',
    scheme: 'vnd.youtube',
    path: '',
    fallbackUrl: 'https://m.youtube.com',
    icon: '/app-icons/youtube.webp',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    package: 'com.zhiliaoapp.musically',
    scheme: 'tiktok',
    path: '',
    fallbackUrl: 'https://tiktok.com',
    icon: '/app-icons/tiktok.webp',
  },
  {
    id: 'okko',
    name: 'Okko',
    package: 'ru.more.play',
    scheme: 'okko',
    path: '',
    fallbackUrl: 'https://okko.tv',
    icon: '/app-icons/okko.webp',
  },
  {
    id: 'ivi',
    name: 'ivi',
    package: 'ru.ivi.client',
    fallbackUrl: 'https://www.ivi.ru',
    icon: '/app-icons/ivi.webp',
  },
]
