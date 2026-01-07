<script lang="ts">
  import { BuilderStyleRoot, BuilderFrame, UpdateChecker } from '@abcnews/components-builder';
  import { onMount } from 'svelte';
  const defaultParams = new URLSearchParams(location.hash.slice(1));

  let textarea = $state('');

  let locations = $state((defaultParams.get('locations') || '').split(','));
  let hash = $state(window.location.hash.slice(1));
  onMount(async () => {
    addEventListener('hashchange', () => {
      const newHash = window.location.hash.slice(1);
      if (hash !== newHash) {
        hash = newHash;
      }
    });
  });

  $effect(() => {
    const params = new URLSearchParams();
    params.append('locations', locations.join());
    window.location.hash = params.toString();
  });

  $effect(() => {
    if (textarea) {
      locations = textarea
        .split('\n')
        .map(location => location.trim())
        .filter(Boolean);
      textarea = '';
    }
  });

  let iframeUrl = $derived.by(
    () => `https://${location.host}${location.pathname.replace(/\/builder\/?/, '/')}?${hash}&abcnewsembedheight=600`
  );
</script>

{#snippet Viz()}
  <div class="frame">No preview available</div>
{/snippet}

{#snippet Sidebar()}
  <fieldset>
    <legend>Paste locations</legend>
    <textarea bind:value={textarea}> </textarea>
  </fieldset>
  <fieldset>
    <legend>Iframe url</legend>
    <input readonly value={iframeUrl} />
  </fieldset>
  <UpdateChecker />
{/snippet}

<BuilderStyleRoot>
  <BuilderFrame {Viz} {Sidebar} />
</BuilderStyleRoot>

<style lang="scss">
  .frame {
    width: 100%;
    height: 100%;
    border: 0;
    position: relative;
  }
</style>
