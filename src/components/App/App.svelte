<script lang="ts">
  import { buffer } from '@turf/turf';
  import Maplibre from '../Maplibre/Maplibre.svelte';
  import type { FeatureCollection, Geometry } from 'geojson';
  import { createContinuousScale, SequentialPalette } from '@abcnews/palette';
  import { onMount } from 'svelte';
  type MyFeatureCollection = FeatureCollection<
    Geometry,
    {
      // Your types go here
      name: string;
      auroraId: string;
      height?: number;
      colour?: string;
      temp?: number | null;
    }
  >;

  type Data = {
    timestamps: string[];
    series: Record<string, (number | null)[]>;
  };

  let geojson = $state<MyFeatureCollection>({} as MyFeatureCollection);
  let data = $state<Data>({} as Data);
  let status = $state<'loading' | 'ready'>('loading');
  onMount(async () => {
    const [loadedGeojson, loadedData] = await Promise.all([
      fetch('/au.geo.json').then(res => res.json() as Promise<MyFeatureCollection>),
      fetch('/data.json').then(res => res.json() as Promise<Data>)
    ]);
    geojson = loadedGeojson;
    data = loadedData;
    status = 'ready';
    setInterval(() => {
      index++;
      if (index > data.timestamps.length) {
        index = 0;
      }
    }, 5000);
  });

  let index = 0;
  $effect(() => {});
</script>

<div class="app">
  <Maplibre
    onLoad={async ({ rootNode, maplibregl }) => {
      await loadingPromise;

      if (process.env.NODE_ENV === 'development') {
      }

      const palette = SequentialPalette.Blue;
      const domain: [number, number] = [35, 0];
      const scale = createContinuousScale(palette, 'l', domain);

      geojson.features = geojson.features
        .map(feature => {
          const circleFeature = buffer(feature, 10, { units: 'kilometers' }) as MyFeatureCollection['features'][0];
          const series = data.series[feature.properties.auroraId];

          const temp = series?.[3] || null;
          console.log(feature.properties.name, !!series, temp, scale(temp));
          // Preserve properties and apply new ones
          circleFeature.properties = {
            ...feature.properties,
            height: 10000 * (temp || 1),
            colour: scale(temp),
            temp
          };

          return circleFeature;
        })
        .filter(feature => feature.properties.temp);

      const map = new maplibregl.Map({
        zoom: 1,
        minZoom: 2,
        maxZoom: 10,
        attributionControl: false,
        dragRotate: false,
        doubleClickZoom: false,
        style: 'https://www.abc.net.au/res/sites/news-projects/map-vector-style-bright/style.json',
        container: rootNode,
        interactive: true,
        cooperativeGestures: true,
        center: [133.28, -28.15]
      });

      await new Promise(resolve => map.on('load', resolve));

      map.setProjection({
        type: 'globe' // Set projection to globe
      });

      map.addSource('extrude-polygons', {
        type: 'geojson',
        data: geojson
      });

      map.addLayer({
        id: 'extrude-polygon-layer',
        source: 'extrude-polygons',
        type: 'fill-extrusion',
        paint: {
          'fill-extrusion-color': ['get', 'colour'],
          'fill-extrusion-opacity': 1,
          'fill-extrusion-height': ['get', 'height']
        }
      });

      function updateData() {}
    }}
  />
</div>

<style lang="scss">
  :global {
    * {
      margin: 0;
      padding: 0;
    }
  }
  .app {
    width: 100%;
    height: 100dvh;
    position: relative;
  }
</style>
