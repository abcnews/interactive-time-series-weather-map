<script lang="ts">
  import Chart from 'chart.js/auto';
  let { data, labels } = $props();
  let rootEl = $state<HTMLCanvasElement>();

  $effect(() => {
    console.log({ data, labels });
    if (!data?.length || !labels?.length) {
      return;
    }
    const config = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Acquisitions',
            data: data, // Use the clamped data here
            fill: false,
            borderColor: 'red',
            borderWidth: 1,
            pointRadius: 0,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              callback: (val: any, index: number) => {
                return index % 100 === 0 ? labels[index] : '';
              },
              autoSkip: false,
              maxRotation: 0
            }
          },
          y: {
            display: true, // Set to true to show our 0 and 45 labels
            min: 0,
            max: 45,
            grid: {
              display: false, // Keep it clean
              drawBorder: false
            },
            ticks: {
              stepSize: 45, // Forces ticks at 0 and 45
              callback: (value: number) => {
                // Only return label for 0 and 45
                return value === 0 || value === 45 ? value : '';
              }
            }
          }
        },
        events: []
      }
    };
    console.log(config);

    const chart = new Chart(rootEl, config);

    return () => {
      chart.destroy();
    };
  });
</script>

<div class="line-chart">
  <canvas width="500" height="50" bind:this={rootEl}></canvas>
</div>

<style lang="scss">
  .line-chart {
  }
</style>
