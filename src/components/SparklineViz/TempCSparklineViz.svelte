<script lang="ts">
  import type { LocationsFeatureCollection, TimeSeriesData } from '../../types';
  import { DATA_URL, LOCATIONS_URL } from '../util';
  import { interpolateRgbBasis } from 'd3-interpolate';
  import { scaleSequential } from 'd3-scale';
  import SparklineViz from './SparklineViz.svelte';

  let { locations = ['Brisbane', 'Sydney', 'Melbourne', 'Adelaide'] } = $props();

  // Temperature-specific configuration
  const yDomain: [number, number] = [10, 45];
  const gradientColors = ['#779E00', '#DB7C00', '#F53500'];
  const formatValue = (v: number) => `${v.toFixed(1)}°C`;
  const gradientScale = scaleSequential(yDomain, interpolateRgbBasis(gradientColors));

  // Temperature-specific data loading
  async function loadData() {
    const [geojson, data] = await Promise.all([
      fetch(LOCATIONS_URL).then(res => res.json() as Promise<LocationsFeatureCollection>),
      fetch(DATA_URL).then(res => res.json() as Promise<TimeSeriesData>)
    ]);

    return locations
      .map(location => geojson.features.find(feature => feature.properties.name === location))
      .filter(feature => feature && locations.includes(feature.properties.name))
      .map(feature => {
        const auroraId = feature.properties.auroraId;
        const timeSeries = data.series[auroraId];

        // Transform data with null handling
        let previousNulls = 0;
        let previousValue;
        const chartData = timeSeries.reduce((acc: Array<{ x: number; y: number }>, val, index) => {
          previousValue = val ?? previousValue ?? 0;
          const timestamp = new Date(data.timestamps[index]);

          // Filter out data older than 5 days
          if (Number(timestamp) < Date.now() - 1000 * 60 * 60 * 24 * 5) {
            return acc;
          }

          const hasVal = val !== null;
          previousNulls = hasVal ? 0 : previousNulls + 1;

          acc.push({
            x: timestamp.getTime(),
            y: hasVal ? val : previousNulls < 10 ? previousValue : 0
          });

          return acc;
        }, []);

        return {
          name: feature.properties.name,
          chartData
        };
      });
  }
</script>

<SparklineViz
  {loadData}
  {formatValue}
  {yDomain}
  {gradientScale}
  attribution="Times shown in user's local time. Source: MetraWeather."
/>
