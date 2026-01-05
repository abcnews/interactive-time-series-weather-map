import acto from '@abcnews/alternating-case-to-object';
import { whenDOMReady } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import type { Mount } from '@abcnews/mount-utils';
import App from './components/App/App.svelte';
import { mount } from 'svelte';

let appMountEl: Mount;
let appProps;

whenDOMReady.then(() => {
  [appMountEl] = selectMounts('interactivetimeseriesweathermap');

  if (appMountEl) {
    appProps = acto(getMountValue(appMountEl));
    
    mount(App, {
      target: appMountEl,
      props: appProps
    });
  }
});

if (process.env.NODE_ENV === 'development') {
  console.debug(`[interactive-time-series-weather-map] public path: ${__webpack_public_path__}`);
}
