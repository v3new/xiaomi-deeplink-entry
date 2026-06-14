import type {App} from './types'

export const music: App[] = [
  {
    id: 'yandex-music',
    name: 'Yandex Music',
    package: 'ru.yandex.music',
    scheme: 'yandexmusic',
    path: '',
    fallbackUrl: 'https://music.yandex.ru',
    icon: '/app-icons/yandex-music.webp',
  },
  {
    id: 'youtube-music',
    name: 'YouTube Music',
    package: 'com.google.android.apps.youtube.music',
    scheme: 'vnd.youtube.music',
    path: '',
    fallbackUrl: 'https://music.youtube.com',
    icon: '/app-icons/youtube-music.webp',
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    package: 'com.apple.android.music',
    scheme: 'apple-music',
    path: 'ru/new',
    fallbackUrl: 'https://music.apple.com',
    icon: '/app-icons/apple-music.webp',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    package: 'com.spotify.music',
    scheme: 'spotify',
    path: '',
    fallbackUrl: 'https://open.spotify.com',
    icon: '/app-icons/spotify.webp',
  },
]
