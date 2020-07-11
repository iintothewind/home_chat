# home_chat

[中文](https://github.com/iintothewind/home_chat/blob/master/README_CN.md)
![logo](https://github.com/iintothewind/home_chat/raw/master/src/resources/logo70.png)

Home_chat is a web IM tool to transfer messages between home devices.

## why I developed it

I hate to scan the damn QR code when I try to check messages from wechat on PC.

**NO MORE QR CODE**

By using this app and its backend API, messages can easily be shared and viewed via this app or IOS shortcuts.

## features

- [X] Exactly once delivery for both message publish and receive.
- [X] Server side message persistence, undelivered message will be stored on server side for one month for each offline client.
- [X] Client side message persistence (in IndexedDB).
- [X] Backend API support via [home_chat_backend](https://github.com/iintothewind/home_chat_backend)
- [X] HTTPS support
- [X] Markdown support
- [X] Custom sticker support
- [X] Notification push support for desktop and Android web browsers. Nortification will be pushed when the home_chat window is not visible.
- [X] Sign in with github support

## more features on roadmap

- [ ] Access control (Authentication & Authorization)
- [ ] Private Chat support
- [ ] Chat bot support


## installation

This app is built by npm, and it runs on nginx and mosquitto.
It can be deployed on both x86(pc) and armv7(respberrypi) docker containers.

- first of all use `docker` branch to do the follow

- `npm run build`

All compiled pages will be created in `./build` folder.

- `docker network create home_chat`

created network manually to work with [home_chat_backend](https://github.com/iintothewind/home_chat_backend)

- `docker-compose up -d`

mosquitto service uses the port number `1883` for mqtt protocol support and `1884` for websocket protocol support on your host.
nginx service needs to use the port number `8080` on your host.

## usage

If this app has been successfully deployed on host `192.168.0.147`, on any device **within same local area network** that supports websocket you can open the app by using the url:

`http://192.168.0.147:8080/home_chat/messageList?user=username&topic=general`

For the url above, there are three **optional** query parameters you can use:

- user=`username`
The user name of this app, should be unique for every logon device.
If `name` is not given, then a random user name is created.
The name will be used as `client id` for mqtt consumer subscription session.
Please keey user name unique for every connected device to make sure you can always get the missed message for that device when they get back from offline.

- topic=`general`
The topic name for mqtt subscription.
If topic name is not given, then `general` will be used.

Most of the time, on every connecting device, the url should be:

`http://<host_name>:8080/home_chat/messageList?user=<unique_user_name>`

And make sure this url be added into your faviorite bookmarks.

## enable sign in with github

You need to create a client app for your own and change the configuration in `src\util\config.ts`. More details can be found in source code.

## snapshot

![home_chat_demo_009](https://raw.githubusercontent.com/iintothewind/images/master/home_chat_demo_009.png)

