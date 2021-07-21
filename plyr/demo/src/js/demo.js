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
    const streamId = getParameterByName('streamId');
    const oldVersion = getParameterByName('oldVersion');
    const productionDomain = 'live.hbhstreaming.com'

    const liveEndpoint = "https://" + productionDomain + ":1111"
    const apiEndpoint =  "https://" + productionDomain + ":1985/api/v1/"
    // const liveEndpoint = "http://192.168.1.76:8081"
    // const apiEndpoint =  "http://192.168.1.76:1985/api/v1/"

    

    // Check if current stream is live
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", apiEndpoint + 'streams', false ); // false for synchronous request
    xmlHttp.send( null );
    let responseJson = JSON.parse(xmlHttp.responseText);
    let isLive = false;
    for(let i in responseJson.streams) {
      let stream = responseJson.streams[i];
      if (stream.name == streamId) {
        isLive = true;
        break;
      }
    }

    const video = document.querySelector('video')

    const defaultOptions = {
      fullscreen: { enabled: true, fallback: true, iosNative: true },
      settings: ['quality', !isLive? 'speed' : ''],
      controls: ['play-large', 'play', 'mute', 'volume', 'current-time', !isLive? 'progress': '' , 'settings', 'pip', 'airplay', 'fullscreen'],
      speed: !isLive? { selected: 1, options: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] } : {},
      invertTime: isLive,
      autoplay: true,
      i18n: {
        qualityLabel: {
          0: 'Auto',
        },
      },
    };

    let source;
    if (isLive) {
      source = liveEndpoint + "/" + streamId + "/master.m3u8"
      // const source = "http://localhost:80/livestream/master.m3u8"
      // var source = "http://kakastream.io:80/livestream/master.m3u8"
    } else {
      if (oldVersion) {
        source = {
          type: 'video',
          title: 'Last Stream',
          sources: [
            {
              src: 'https://live.ie2020.net:8090/video?streamName=' + streamId,
              type: "video/mp4",
              size: 720
            },
          ]
        }
      } else {
        source = {
          type: 'video',
          title: 'Last Stream',
          sources: [
            {
              src: "https://hbhstreaming.s3.eu-central-1.amazonaws.com/live/" + streamId + "/stream-1080p/stream.mp4",
              type: "video/mp4",
              size: 1080
            },
            {
              src: "https://hbhstreaming.s3.eu-central-1.amazonaws.com/live/" + streamId + "/stream-720p/stream.mp4",
              type: "video/mp4",
              size: 720
            },
            {
              src: "https://hbhstreaming.s3.eu-central-1.amazonaws.com/live/" + streamId + "/stream-360p/stream.mp4",
              type: "video/mp4",
              size: 360
            }
          ]
        }
      }
    }

    if (Hls.isSupported() && isLive) {



      // For more Hls.js options, see https://github.com/dailymotion/hls.js

    //   class loader extends Hls.DefaultConfig.loader {
    //     constructor(config) {
    //         super(config);
    //         var load = this.load.bind(this);
    //         this.load = async function(context, config, callbacks) {
    //             if(streamingToken) {
    //               context.url = context.url + '?token=' + streamingToken;
    //             }
    //             load(context, config, callbacks);
    //         };
    //     }
    // }
    
      
      const hls = new Hls({
        liveSyncDuration: 15,
        liveMaxLatencyDuration: 40,
        maxLiveSyncPlaybackRate: 1.5,
        liveDurationInfinity: isLive,
        // loader: loader,
        // backBufferLength: 40,
        debug: true,
        appendErrorMaxRetry: Infinity,
        levelLoadingMaxRetry: Infinity,
        // // capLevelToPlayerSize: false,
        startLevel: isLive? -1 : 0,
        xhrSetup: function (xhr, url) {
          xhr.withCredentials = true; // do send cookies
        },
        // xhrSetup: function (xhr, url) {
        //   xhr.onload = function() {
        //     if (!streamingToken) {
        //       let result = getParameterByName('token', xhr.responseURL)
        //       if (result) {
        //         streamingToken = result
        //       }
        //     }
        //   }
        // },
        fetchSetup: function (context, initParams) {
          // Always send cookies, even for cross-origin calls.
          initParams.credentials = 'include';
          return new Request(context.url, initParams);
        },
        // // testBandwidth: false,
        // // abrEwmaDefaultEstimate: 1200000
      });
      hls.loadSource(source);
  

      // hls.on(Hls.Events.MANIFEST_LOADED, function (event, data) {
      //   console.log('MANIFEST_LOADED')
      //   if (!streamingToken) {
      //     streamingToken = getParameterByName('token', data.url)
      //   }
      // })
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
      player.source = source
      // video.src = source
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

    function getParameterByName(name, url = window.location.href) {
      name = name.replace(/[\[\]]/g, '\\$&');
      var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  });
})();
