import { DurationInputArg1, DurationInputArg2 } from "moment";

export const cfg = {
  appKey: 'home_chat',
  baseName: '/',
  dbVersion: 1,
  mqttUrl: 'ws://192.168.0.147:1884',
  mqttsUrl: 'wss://mqtt.eclipse.org:443/mqtt',
  mqttDefaultTopic: 'home_chat/general',
  maxInputLength: 5120,
  localImageMessageExpiration: { amount: 1 as DurationInputArg1, unit: 'hours' as DurationInputArg2 },
  localTextMessageExpiration: { amount: 7 as DurationInputArg1, unit: 'days' as DurationInputArg2 },
  maxInListImages: 10,
  maxSticker: 20,
  stickerNameMaxLength: 20
}