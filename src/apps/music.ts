import type {App} from './types'

export const music: App[] = [
  {
    id: 'yandex-music',
    name: 'Yandex Music',
    package: 'ru.yandex.music',
    scheme: 'yandexmusic',
    path: '',
    fallbackUrl: 'https://music.yandex.ru',
    icon: 'https://play-lh.googleusercontent.com/mfSdQmzaqOdlWlygbCuJqNC0TNOSbjdXOH9BN9MVyuYYp5p6VD54KOmRmgPVv2sXlkc=s64-rw',
  },
  {
    id: 'youtube-music',
    name: 'YouTube Music',
    package: 'com.google.android.apps.youtube.music',
    scheme: 'vnd.youtube.music',
    path: '',
    fallbackUrl: 'https://music.youtube.com',
    icon: 'https://play-lh.googleusercontent.com/zD8UA5CRdiPzbvTwGKtzR4KjQpxqEK6X0tGDpzEaOo0xPEvG6HUiC_0qkpTfzpuMTqU=s64-rw',
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    package: 'com.apple.android.music',
    scheme: 'apple-music',
    path: 'ru/new',
    fallbackUrl: 'https://music.apple.com',
    icon: 'https://play-lh.googleusercontent.com/mOkjjo5Rzcpk7BsHrsLWnqVadUK1FlLd2-UlQvYkLL4E9A0LpyODNIQinXPfUMjUrbE=s64-rw',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    package: 'com.spotify.music',
    scheme: 'spotify',
    path: '',
    fallbackUrl: 'https://open.spotify.com',
    icon: 'https://play-lh.googleusercontent.com/7ynvVIRdhJNAngCg_GI7i8TtH8BqkJYmffeUHsG-mJOdzt1XLvGmbsKuc5Q1SInBjDKN=s64-rw',
  },
]
