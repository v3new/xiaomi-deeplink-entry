<script lang="ts">
import {APP_BY_ID} from '../apps'
import {tryOpenDeeplink} from '../lib/deeplink'
import {editMode} from '../lib/stores'
import {weatherState} from '../lib/weather'

const weatherApp = APP_BY_ID.get('yandex-weather')

function openWeather() {
  if ($editMode || !weatherApp) return
  tryOpenDeeplink(weatherApp.scheme, weatherApp.path, weatherApp.package, weatherApp.fallbackUrl)
}
</script>

<button type="button" class="weather-area" onclick={openWeather} aria-label="Open Y Weather">
  <div id="weatherCurrent" class="weather-current">
    {#if $weatherState.iconUrl}
      <img id="weatherIcon" class="weather-icon" src={$weatherState.iconUrl} alt="" style="display: block" />
    {/if}
    <span id="weatherTemp" class="weather-temp">{$weatherState.temperature}</span>
  </div>
  <div id="weatherForecast" class="weather-forecast">
    {#if $weatherState.statusText}
      <span class="weather-status">{$weatherState.statusText}</span>
    {:else}
      {#each $weatherState.forecast as hour (`${hour.time}-${hour.temp}`)}
      <div class="hour">
        <img src={hour.iconUrl} alt="" />
        <span>{hour.time}</span>
        <span>{hour.temp}</span>
      </div>
      {/each}
    {/if}
  </div>
</button>
