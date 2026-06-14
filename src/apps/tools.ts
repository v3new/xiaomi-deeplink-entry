import type {App} from './types'

export const tools: App[] = [
  {
    id: 'yandex-weather',
    name: 'Y.Weather',
    package: 'ru.yandex.weatherplugin',
    scheme: 'yandexweather',
    fallbackUrl: 'https://yandex.ru/pogoda',
    iconSource:
      'https://play-lh.googleusercontent.com/XZhyhDzl84gwxFEtUYwqm5o5WbVg853JsvPFfxluMncJkH-7wkAbuM8U2oZABurIYC7C2FnDNuOZwP3uR-5PvEE=s64-rw',
    icon: '/app-icons/yandex-weather.webp',
  },
]
