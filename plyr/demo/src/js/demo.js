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
    // const source = "https://30af609b0200.eu-west-1.playback.live-video.net/api/video/v1/eu-west-1.677470251420.channel.oPqrMMlCOjbK.m3u8"
    const source = "http://35.157.15.116:8080/live/livestream/master.m3u8"
    // const source = "http://localhost:8080/live/livestream/master.m3u8"
    const video = document.querySelector('video')

    const defaultOptions = {
      fullscreen: { enabled: true, fallback: true, iosNative: true },
      settings: ['quality'],
      controls: ['play-large', 'play', 'current-time', 'mute', 'volume', 'settings', 'pip', 'airplay', 'fullscreen'],
      // speed: { selected: 1, options: [1, 1.5] },
      autoplay: true,
      i18n: {
        qualityLabel: {
          0: 'Auto',
        },
      },
    };

    if (Hls.isSupported()) {
      // For more Hls.js options, see https://github.com/dailymotion/hls.js
      const hls = new Hls({
        liveSyncDuration: 15,
        liveMaxLatencyDuration: 40,
        maxLiveSyncPlaybackRate: 1.5,
        liveDurationInfinity: true,
        // backBufferLength: 40,
        debug: true,
        appendErrorMaxRetry: Infinity,
        levelLoadingMaxRetry: Infinity,
        // // capLevelToPlayerSize: false,
        startLevel: -1,
        // // testBandwidth: false,
        // // abrEwmaDefaultEstimate: 1200000
      });
      hls.loadSource(source);
  
      // From the m3u8 playlist, hls parses the manifest and returns
      // all available video qualities. This is important, in this approach,
      // we will have one source on the Plyr player.
      hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
  
        // Transform available levels into an array of integers (height values).
        const availableQualities = hls.levels.map((l) => l.height)
        availableQualities.unshift(0)
        // Add new qualities to option
        defaultOptions.quality = {
          default: 0,
          options: availableQualities,
          // this ensures Plyr to use Hls to update quality level
          // Ref: https://github.com/sampotts/plyr/blob/master/src/js/html5.js#L77
          forced: true,        
          onChange: (e) => updateQuality(e),
        }

        hls.on(Hls.Events.LEVEL_SWITCHED, function (event, data) {
          var span = document.querySelector(".plyr__menu__container [data-plyr='quality'][value='0'] span")
          if (hls.autoLevelEnabled) {
            span.innerHTML = `AUTO (${hls.levels[data.level].height}p)`
          } else {
            span.innerHTML = `AUTO`
          }
        })
  
        // Initialize new Plyr player with quality options
        const player = new Plyr(selector, defaultOptions);
        player.speed = 1
        window.player = player;
      });
      hls.attachMedia(video);
      window.hls = hls;
    } else {
      // default options with no quality update in case Hls is not supported
      const player = new Plyr(selector, defaultOptions);
      player.speed = 1
      window.player = player;
      video.src = source
    }
  
    function updateQuality(newQuality) {
      if (newQuality === 0) {
        if (hls.currentLevel != -1) {
          var span = document.querySelector(".plyr__menu__container [data-plyr='quality'][value='0'] span")
          span.innerHTML = `AUTO (${hls.levels[hls.currentLevel].height}p)`
        }
        window.hls.currentLevel = -1; //Enable AUTO quality if option.value = 0
      } else {
        window.hls.levels.forEach((level, levelIndex) => {
          if (level.height === newQuality) {
            console.log("Found quality match with " + newQuality);
            window.hls.currentLevel = levelIndex;
          }
        });
      }
    }

  });
})();
