<script lang="ts">
  import Chart from './charts/Chart.svelte';
  import { intersectionObserver } from './useIntersectionObserver.js';
  import { emitResize } from '../util';
  import { untrack } from 'svelte';

  /**
   * Props for the SparklineViz component.
   */
  interface SparklineVizProps {
    /**
     * Array of placeholder names to display charts for.
     */
    placeholders: string[];

    /**
     * Function to load chart data asynchronously.
     * @returns A promise that resolves to an array of chart data objects.
     */
    loadData: () => Promise<
      Array<{
        /** The name of the chart (e.g., location name) */
        name: string;
        /** Array of data points for the chart */
        chartData: Array<{ x: number; y: number }>;
      }>
    >;

    /**
     * Function to format y-axis values for display.
     */
    formatValue: (value: number) => string;

    /**
     * The domain (min/max) for the y-axis.
     */
    yDomain: [number, number];

    /**
     * Scale function for mapping values to colors.
     */
    gradientScale: (value: number) => string;

    /**
     * Free text attribution to display below the charts.
     */
    attribution?: string;
  }

  let { placeholders, loadData, formatValue, yDomain, gradientScale, attribution }: SparklineVizProps = $props();

  let charts = $state<
    Array<{
      name: string;
      chartData: Array<{ x: number; y: number }>;
    }>
  >([]);
  let clientHeight = $state(0);
  let status = $state('offscreen');

  // Create a derived version of charts that returns placeholders when data is loading
  let displayCharts = $derived(
    charts.length > 0
      ? charts
      : placeholders.map(name => ({
          name,
          chartData: []
        }))
  );

  $effect(() => {
    if (clientHeight) {
      emitResize(clientHeight);
    }
  });

  $effect(() => {
    if (status === 'inview') {
      untrack(async () => {
        charts = await loadData();
      });
    }
  });
</script>

<div
  class="app"
  bind:clientHeight
  use:intersectionObserver={{
    threshold: 0.1,
    onEnter: () => {
      status = 'inview';
    }
  }}
>
  <div class="charts">
    {#each displayCharts as chart, i}
      <div style:--delay="{i * 0.5}ms">
        <Chart
          name={chart.name}
          altText={`A chart shows temperatures at ${chart.name}`}
          data={chart.chartData}
          {formatValue}
          {yDomain}
          {gradientScale}
        />
      </div>
    {/each}
  </div>
  {#if attribution}
    <div>
      <p class="attribution">{attribution}</p>
    </div>
  {/if}
</div>

<style lang="scss">
  :global {
    * {
      margin: 0;
      padding: 0;
    }
    body {
      background: transparent;
    }
  }
  .app {
    overflow: hidden;
  }
  .charts {
    display: flex;
    flex-direction: column;
    gap: 50px;
    margin-bottom: 20px;
  }

  .attribution {
    font-family: ABCSans;
    color: #333;
    background: #fff;
    border-radius: 1000px;
    padding: 2px 0.75rem;
    display: inline-block;
  }
</style>
