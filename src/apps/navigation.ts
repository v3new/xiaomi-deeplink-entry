import type {App} from './types'

export const navigation: App[] = [
  {
    id: 'yandex-navi',
    name: 'Yandex Navi',
    package: 'ru.yandex.yandexnavi',
    scheme: 'yandexnavi',
    path: '',
    fallbackUrl: 'https://maps.yandex.ru',
    icon: 'https://play-lh.googleusercontent.com/quo2QK2mxipWCZiBTM58nyENopQsvXpLz1wqLOhlBg8TxJ8tEH_T9buZVdRnSDa-vPY=s64-rw',
  },
  {
    id: 'yandex-maps',
    name: 'Yandex Maps',
    package: 'ru.yandex.yandexmaps',
    scheme: 'yandexmaps',
    path: '',
    fallbackUrl: 'https://maps.yandex.ru',
    icon: 'https://play-lh.googleusercontent.com/DLCdDuCkVMI-vQhbNmPJU8cIDZulGHJxYGz_Cm9Mbrv6ssl9TW-RUMXfzczd9NKZj4w=s64-rw',
  },
  {
    id: 'google-maps',
    name: 'Google Maps',
    package: 'com.google.android.apps.maps',
    scheme: 'google.navigation',
    path: '',
    fallbackUrl: 'https://maps.google.com',
    icon: 'https://play-lh.googleusercontent.com/Kf8WTct65hFJxBUDm5E-EpYsiDoLQiGGbnuyP6HBNax43YShXti9THPon1YKB6zPYpA=s64-rw',
  },
  {
    id: '2gis',
    name: '2GIS',
    package: 'ru.dublgis.dgismobile',
    scheme: 'dublgis',
    path: '',
    fallbackUrl: 'https://2gis.ru',
    icon: 'https://play-lh.googleusercontent.com/55huczUZ05ruaVynURUNqzgTu0qXLF-SPQZKtE9KA6_BavI-g0NgXz1NR98n5xX33HwD=s64-rw',
  },
  {
    id: 'waze',
    name: 'Waze',
    package: 'com.waze',
    scheme: 'waze',
    path: '',
    fallbackUrl: 'https://www.waze.com',
    icon: 'https://play-lh.googleusercontent.com/r7XL36PVNtnidqy6ikRiW1AHEIsjhePrZ8W5M4cNTQy5ViF3-lIDY47hpvxc84kJ7lw=s64-rw',
  },
]
