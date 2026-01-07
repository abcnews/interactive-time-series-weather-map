<script lang="ts">
  import Chart from 'chart.js/auto';
  import { onMount } from 'svelte';
  import type { LocationsFeatureCollection, TimeSeriesData } from '../../types';
  import { DATA_URL } from '../util';
  import LineChart from './LineChart/LineChart.svelte';
  let geojson = $state<LocationsFeatureCollection>();
  let data = $state<TimeSeriesData>();
  let rootEl = $state<HTMLCanvasElement>();

  onMount(async () => {
    const [loadedGeojson, loadedData] = await Promise.all([
      fetch('/au.geo.json').then(res => res.json() as Promise<LocationsFeatureCollection>),
      fetch(DATA_URL).then(res => res.json() as Promise<TimeSeriesData>)
    ]);
    geojson = loadedGeojson;
    data = loadedData;
  });

  const locations = [
    'Port Augusta', // SA
    'Coober Pedy', // SA
    'Adelaide', // SA
    'Mildura', // VIC
    'Echuca', // VIC
    'Melbourne', // VIC
    'Bendigo', // VIC
    'Broken Hill', // NSW
    'Sydney', // NSW
    'Canberra', // ACT
    'Hobart', // TAS
    'Launceston' // TAS
  ];

  let labels = $derived.by(() => {
    return (data?.timestamps || []).map((ts: string | number) => {
      return new Date(ts).toLocaleDateString('en-AU', {
        day: '2-digit',
        month: '2-digit'
      });
    });
  });

  let foundLocations = $derived.by(() => {
    if (!geojson || !data) {
      return [];
    }
    return geojson.features
      .filter(feature => locations.includes(feature.properties.name))
      .map(feature => {
        const auroraId = feature.properties.auroraId;

        const chartData = data.series[auroraId].reduce((acc: number[], val: number | null) => {
          if (val !== null) {
            acc.push(val);
          } else {
            const previousValue = acc.length > 0 ? acc[acc.length - 1] : 0;
            acc.push(previousValue);
          }
          return acc;
        }, []);

        console.log(feature.properties.name, data.series[auroraId]);

        return {
          name: feature.properties.name,
          chartData
        };
      });
  });
</script>

<div class="app">
  {#each foundLocations as location}
    <h2>{location.name}</h2>
    <LineChart {labels} data={location.chartData} />
  {/each}
</div>

<style lang="scss">
  :global {
    * {
      margin: 0;
      padding: 0;
    }
  }
</style>
