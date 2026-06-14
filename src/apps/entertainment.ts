import type {App} from './types'

export const entertainment: App[] = [
  {
    id: 'kinopub',
    name: 'Kinopub',
    package: 'com.kinopub',
    fallbackUrl: 'https://kino.pub',
    icon: 'https://img.iconpusher.com/com.kinopub/1.33.png?w=64&q=75',
  },
  {
    id: 'kinopoisk',
    name: 'Kinopoisk',
    package: 'ru.kinopoisk',
    scheme: 'kp',
    path: 'mainView',
    fallbackUrl: 'https://hd.kinopoisk.ru',
    icon: 'https://play-lh.googleusercontent.com/5czw6iycA8YhjI653GQdwnnmu8NNzEMXV32gZKoVCYZV6PQUAv_YV0uJ2PU1E-Jm9PE=s64-rw',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    package: 'com.google.android.youtube',
    scheme: 'vnd.youtube',
    path: '',
    fallbackUrl: 'https://m.youtube.com',
    icon: 'https://play-lh.googleusercontent.com/6am0i3walYwNLc08QOOhRJttQENNGkhlKajXSERf3JnPVRQczIyxw2w3DxeMRTOSdsY=s64-rw',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    package: 'com.zhiliaoapp.musically',
    scheme: 'tiktok',
    path: '',
    fallbackUrl: 'https://tiktok.com',
    icon: 'https://play-lh.googleusercontent.com/LdBITldj-tJxqLm-CsWSbnt4BMo2gk53cgM7mWIL-zn44m1ywLyQgxRsHKqp8r0qceXs=s64-rw',
  },
  {
    id: 'okko',
    name: 'Okko',
    package: 'ru.more.play',
    scheme: 'okko',
    path: '',
    fallbackUrl: 'https://okko.tv',
    icon: 'https://play-lh.googleusercontent.com/dz290mv8r8252ofL1c1g0fxpAAmCs4A5NQGOjksBU_QhWrDisG1gaT-ganjqNx1gGpk=s64-rw',
  },
  {
    id: 'ivi',
    name: 'ivi',
    package: 'ru.ivi.client',
    fallbackUrl: 'https://www.ivi.ru',
    icon: 'https://play-lh.googleusercontent.com/GKBFhzd6BuA_gx5z51INJ_shZxWh1rqbkUcDBIZURe0iVArMC66wA3O4YM2F8Yql_1g=s64-rw',
  },
]
