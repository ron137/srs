// ==========================================================================
// Plyr.io demo
// This code is purely for the https://plyr.io website
// Please see README.md in the root or github.com/sampotts/plyr
// ==========================================================================

// import './tab-focus';
import 'custom-event-polyfill';
import 'url-polyfill';

import * as Sentry from '@sentry/browser';
import Shr from 'shr-buttons';
import Hls from 'hls.js'

import Plyr from '../../../src/js/plyr';
import sources from './sources';
import toggleClass from './toggle-class';

(() => {
  const production = 'plyr.io';

  document.addEventListener('DOMContentLoaded', () => {
    const selector = '#player';

    // Setup the player
    const player = new Plyr(selector, {
      debug: true,
      title: 'View From A Blue Moon',
      iconUrl: 'dist/demo.svg',
      autoplay: true,
      keyboard: {
        global: true,
      },
      tooltips: {
        controls: true,
      },
      captions: {
        active: true,
      },
      settings: [],
      controls: ['play-large', 'play', 'mute', 'volume', 'airplay', 'fullscreen'],
      fullscreen: { enabled: true, fallback: true, iosNative: true },
      vimeo: {
        // Prevent Vimeo blocking plyr.io demo site
        referrerPolicy: 'no-referrer',
      },
    });

    // const source = "https://30af609b0200.eu-west-1.playback.live-video.net/api/video/v1/eu-west-1.677470251420.channel.oPqrMMlCOjbK.m3u8"
    const source = "http://35.157.15.116:8080/live/livestream/master.m3u8"
    // const source = "http://localhost:8080/live/livestream/master.m3u8"

    const video = document.querySelector('video')

    if (!Hls.isSupported()) {
      video.src = source;
    } else {
      // For more Hls.js options, see https://github.com/dailymotion/hls.js
      const hls = new Hls({
        // liveSyncDuration: 15,
        // liveMaxLatencyDuration: 40,
        // maxLiveSyncPlaybackRate: 1.5,
        liveDurationInfinity: true,
        // backBufferLength: 40,
        debug: true,
        appendErrorMaxRetry: Infinity,
        levelLoadingMaxRetry: Infinity,
        // capLevelToPlayerSize: false,
        // startLevel: -1,
        // testBandwidth: false,
        // abrEwmaDefaultEstimate: 1200000
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      window.hls = hls;
      
      // Handle changing captions
      player.on('languagechange', () => {
        // Caption support is still flaky. See: https://github.com/sampotts/plyr/issues/994
        setTimeout(() => hls.subtitleTrack = player.currentTrack, 50);
      });
    }

    

    // Expose for tinkering in the console
    window.player = player;

  });
})();
