import { DurationInputArg1, DurationInputArg2 } from 'moment'

export const cfg = {
  appKey: 'home_chat',
  baseName: '/',
  dbVersion: 1,
  projectUrl: 'https://github.com/iintothewind/home_chat',
  // mqttUrl: 'ws://192.168.0.147:1884',
  // mqttsUrl: 'wss://mqtt.eclipse.org:443/mqtt',
  mqttUrl: 'ws://192.168.0.147:1884',
  mqttsUrl: 'wss://home-chat.ivarchen.xyz:8084/mqtt',
  mqttTopicPrefx: 'home_chat/',
  mqttDefaultTopic: 'general',
  backendUrl: 'https://home-chat.ivarchen.xyz:8443',
  clientId: 'd091146121f6eb144f83',
  maxInputLength: 5120,
  gaTrackingId: 'UA-171653853-1',
  localImageMessageExpiration: { amount: 1 as DurationInputArg1, unit: 'hours' as DurationInputArg2 },
  localTextMessageExpiration: { amount: 7 as DurationInputArg1, unit: 'days' as DurationInputArg2 },
  maxInListImages: 10,
  maxSticker: 20,
  stickerNameMaxLength: 20
}