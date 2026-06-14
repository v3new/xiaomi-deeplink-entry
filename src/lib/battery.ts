import {readable} from 'svelte/store'
import {fmtTime} from './deeplink'
import {Device} from './device'

export type BatteryViewState = {
  charging: boolean
  color: string
  fillWidth: number
  low: boolean
  pct: number
  supported: boolean
  title: string
}

const MAX_FILL_WIDTH = 22

function colorForPct(pct: number): string {
  if (pct >= 60) return '#26c281'
  if (pct >= 40) return '#ffd166'
  if (pct >= 15) return '#ff8c42'
  return '#ff3b30'
}

function titleForBattery({
  charging,
  chargingTime,
  dischargingTime,
  pct,
}: {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  pct: number
}): string {
  const tail = charging
    ? Number.isFinite(chargingTime) && chargingTime > 0
      ? ` • to 100%: ${fmtTime(chargingTime)}`
      : ''
    : Number.isFinite(dischargingTime) && dischargingTime > 0
      ? ` • remaining: ${fmtTime(dischargingTime)}`
      : ''

  return charging ? `${pct}% charging${tail}` : `${pct}%${tail}`
}

export const battery = readable<BatteryViewState>(
  {
    charging: false,
    color: colorForPct(100),
    fillWidth: 0,
    low: false,
    pct: 0,
    supported: Device.hasBatterySupport(),
    title: '',
  },
  set => {
    if (!Device.hasBatterySupport()) {
      set({
        charging: false,
        color: colorForPct(100),
        fillWidth: 0,
        low: false,
        pct: 0,
        supported: false,
        title: '',
      })
      return () => {}
    }

    return Device.watchBattery(b => {
      const fillWidth = Math.max(0, Math.min(MAX_FILL_WIDTH, Math.round((b.pct / 100) * MAX_FILL_WIDTH)))

      set({
        charging: b.charging,
        color: colorForPct(b.pct),
        fillWidth,
        low: b.pct < 15 && !b.charging,
        pct: b.pct,
        supported: true,
        title: titleForBattery(b),
      })
    })
  },
)
