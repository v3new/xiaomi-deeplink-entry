<script lang="ts">
import {refreshLocationFromBrowser, weatherState} from '../lib/weather'
import Battery from './Battery.svelte'

function refreshLocation() {
  void refreshLocationFromBrowser()
}
</script>

<div class="status-bar" id="statusBar">
  <button type="button" class="geo-location" id="geoLocation" onclick={refreshLocation} aria-label="Refresh location">
    <span class="status-dot" id="locationDot" style:background-color={$weatherState.locationColor}></span>
    <span id="weatherPlace">{$weatherState.locationName}</span>
  </button>
  <Battery />
</div>
