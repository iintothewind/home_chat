import { DurationInputArg1, DurationInputArg2 } from 'moment'

export const cfg = {
  appKey: 'home_chat',
  baseName: '/home_chat',
  dbVersion: 1,
  mqttUrl: 'ws://141.164.50.135:8083/mqtt',
  mqttsUrl: 'wss://141.164.50.135:8084/mqtt',
  mqttTopicPrefx: 'home_chat/',
  mqttDefaultTopic: 'general',
  backendUrl: 'https://mqttchat.herokuapp.com',
  clientId: 'd091146121f6eb144f83',
  maxInputLength: 5120,
  gaTrackingId: 'UA-171653853-1',
  localImageMessageExpiration: { amount: 1 as DurationInputArg1, unit: 'hours' as DurationInputArg2 },
  localTextMessageExpiration: { amount: 7 as DurationInputArg1, unit: 'days' as DurationInputArg2 },
  maxInListImages: 10,
  maxSticker: 20,
  stickerNameMaxLength: 20
}