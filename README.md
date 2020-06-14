# home chat

Home chat is a web IM tool to transfer messages between home devices.
![home_chat_demo](https://raw.githubusercontent.com/iintothewind/images/master/home_chat_demo_003.png)

## why I developed it

Text message transmission between home devices is a high frenquency requirement at home.

It can be painful if you try to receive message on web IM such as web wechat or web qq.
If your family member sent a text message via wechat or qq, what you are surpposed to receive this message on PC? You probably need to open web wechat or web qq, take out your phone, then use the mobile IM app to scan the QR code shown on the web page to login then finally you can see the message.
The whole process is so inconvenient.

This is the problem I want to solve.

By using home chat, you just need to open it by simply click the link from your favorite bookmark folder.
Then any device that supports websoket can be used with this app to sync up messages with your family.

## features

- [X] Exactly once delivery for both message publish and receive.
- [X] Server side message persistence, undelivered message will be stored on server side for one month for each offline client.
- [X] Client side message persistence, the latest 50 received messages will be stored on browser local storage.
- [X] Backend API support via [home_chat_backend](https://github.com/iintothewind/home_chat_backend)

## more features in roadmap

- [ ] HTTPS support
- [ ] Access control support(Authentication & Authorization)
- [ ] Private Chat support
- [ ] Chat bot support
- [ ] Image support
- [ ] Emoji support
- [ ] Audio support
- [ ] Video support

## installation

This app should be built by npm, and it runs on nginx and mosquitto.
It can be deployed in x86(pc) and armv7(respberrypi) docker containers.

- `npm run build`

All compiled pages will be created in `./build` folder.

- `docker network create home_chat`

- `docker-compose up -d`

mosquitto service needs to use the port number `1883` for mqtt protocol support and `1884` for websocket protocol support on your host.
nginx service needs to use the port number `8080` on your host.

## usage

If this app has been successfully deployed on host `192.168.0.147`, on any device **within same local area network** that supports websocket you can open the app by using the url:

`http://192.168.0.147:8080/home_chat/messageBoard?name=username&mqtt_url=mqtt%3A%2F%2F192.168.0.147%3A1884&topic=home_chat%2Fgeneral`

For the url above, there are three **optional** query parameters you can use:

- name=`username`
The user name of this app, should be unique for every logon device.
If `name` is not given, then a random user name is used.
The name will be used as `client id` for mqtt consumer subscription session.
Please keey user name unique for every connected device to make sure you can always get the missed message on that device when they get back from offline.

- mqtt_url=`mqtt%3A%2F%2F192.168.0.147%3A1884`
The mqtt message broker url, url encoded.
If `mqtt_url` is not given, then `mqtt://<http_host_name>:1884` will be used.

- topic=`home_chat%2Fgeneral`
The topic name for mqtt subscription.
If topic name is not given, then `home_chat/general` will be used.

Most of the time, on every connecting device, the url should be:

`http://<host_name>:8080/home_chat/messageBoard?name=<unique_user_name>`

And make sure this url be added into your faviorite bookmarks.

