import type {App} from './types'

export const tools: App[] = [
  {
    id: 'yandex-weather',
    name: 'Y.Weather',
    package: 'ru.yandex.weatherplugin',
    scheme: 'yandexweather',
    fallbackUrl: 'https://yandex.ru/pogoda',
    icon: '/app-icons/yandex-weather.webp',
  },
]
