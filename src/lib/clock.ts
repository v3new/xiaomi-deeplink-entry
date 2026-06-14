import {readable} from 'svelte/store'

export type ClockState = {
  date: string
  time: string
}

function readClock(): ClockState {
  const now = new Date()
  return {
    time: now.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}),
    date: now.toLocaleDateString('en-US', {day: 'numeric', month: 'long', weekday: 'long'}),
  }
}

export const clock = readable<ClockState>(readClock(), set => {
  const tick = () => set(readClock())
  tick()

  const timer = setInterval(tick, 5000)
  return () => clearInterval(timer)
})
