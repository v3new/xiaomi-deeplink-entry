import type {App} from './types'

export const navigation: App[] = [
  {
    id: 'yandex-navi',
    name: 'Yandex Navi',
    package: 'ru.yandex.yandexnavi',
    scheme: 'yandexnavi',
    path: '',
    fallbackUrl: 'https://maps.yandex.ru',
    icon: '/app-icons/yandex-navi.webp',
  },
  {
    id: 'yandex-maps',
    name: 'Yandex Maps',
    package: 'ru.yandex.yandexmaps',
    scheme: 'yandexmaps',
    path: '',
    fallbackUrl: 'https://maps.yandex.ru',
    icon: '/app-icons/yandex-maps.webp',
  },
  {
    id: 'google-maps',
    name: 'Google Maps',
    package: 'com.google.android.apps.maps',
    scheme: 'google.navigation',
    path: '',
    fallbackUrl: 'https://maps.google.com',
    icon: '/app-icons/google-maps.webp',
  },
  {
    id: '2gis',
    name: '2GIS',
    package: 'ru.dublgis.dgismobile',
    scheme: 'dublgis',
    path: '',
    fallbackUrl: 'https://2gis.ru',
    icon: '/app-icons/2gis.webp',
  },
  {
    id: 'waze',
    name: 'Waze',
    package: 'com.waze',
    scheme: 'waze',
    path: '',
    fallbackUrl: 'https://www.waze.com',
    icon: '/app-icons/waze.webp',
  },
]
