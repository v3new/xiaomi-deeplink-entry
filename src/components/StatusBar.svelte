<script lang="ts">
import {weatherState} from '../lib/weather'
import Battery from './Battery.svelte'
</script>

<div class="status-bar" id="statusBar">
  <div class="geo-location" id="geoLocation">
    <span class="status-dot" id="locationDot" style:background-color={$weatherState.locationColor}></span>
    <span id="weatherPlace">{$weatherState.locationName}</span>
  </div>
  <Battery />
</div>
