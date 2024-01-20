import { DurationInputArg1, DurationInputArg2 } from 'moment'

export const cfg = {
  appKey: 'home_chat',
  baseName: '/',
  dbVersion: 1,
  projectUrl: 'https://github.com/iintothewind/home_chat',
  // initMqttConnection looks up window location protocol to check with mqtt or mqtts should be used
  mqttUrl: 'ws://23.239.7.88:8083/mqtt',
  mqttsUrl: 'ws://23.239.7.88:8083/mqtt',
  // mqttsUrl: 'wss://mqtt.eclipseprojects.io:443/mqtt',
  mqttTopicPrefx: 'home_chat/',
  mqttDefaultTopic: 'general',
  backendUrl: 'https://121.5.128.159:8443',
  clientId: 'd091146121f6eb144f83',
  maxInputLength: 5120,
  gaTrackingId: 'UA-171653853-1',
  localImageMessageExpiration: { amount: 1 as DurationInputArg1, unit: 'hours' as DurationInputArg2 },
  localTextMessageExpiration: { amount: 7 as DurationInputArg1, unit: 'days' as DurationInputArg2 },
  maxInListImages: 10,
  maxSticker: 20,
  stickerNameMaxLength: 20
}
