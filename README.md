# home chat

a web im based on top of react and mqtt.
![home_chat_demo](https://github.com/iintothewind/images/raw/master/home_chat_demo_002.jpg)

## why I develop it

Text message transmission is frequently at home.
Imagine when you saw a funny web page on your phone and you need to send the url of this page to one of your family member.
While he or she is using a PC or tablet but not a phone.

If you sent the text message via wechat or qq, what your family member is surpposed to receive this message on PC? He or she probably needs to open web wechat or web qq, take out his or her phone use the IM app to scan the QR code shown on the web page to login the account.

The whole process is so inconvenient.

This is why I developed this web app.

By using home chat, you just need to open it by simply click the link from your favorite bookmark folder.
And device that supports websoket web page can open this app to sync up messages with your family.

## installation

This app should be build by npm, and it runs on nginx and mosquitto.
It can be deployed in x86(pc) and armv7(respberrypi) docker environment.

- `npm run build`

All compile pages have been created in `./build` folder.

- `docker up -d`

mosquitto service needs to use the port number `1883` for mqtt protocol support and `1884` for websocket protocol support on your host.
nginx service needs to use the port number `8080` on your host.

## usage

If this app has been successfully deployed on host `192.168.0.147`, on any device **within same local area network** that supports websocket you can open the app by using the url:
`http://192.168.0.147:8080/messageBoard?name=yourname&mqtt_url=mqtt%3A%2F%2F192.168.0.147%3A1884&topic=topic01`

For the url above, there are three **optional** query parameters you can use:

- name=`username`
The user name of this app, should be unique for every logon device.
If `name` is not given, then a random user name is used.
The name will be used as `client id` for mqtt consumer subscription session.
Please keey user name the same for every connected device to make sure you can always get the missed message when they go offline.

- mqtt_url=`mqtt%3A%2F%2F192.168.0.147%3A1884`
The mqtt message broker url, url encoded.
If `mqtt_url` is not given, then `mqtt://<host_name>:1884` will be used.

- topic=`topic01`
The topic name for mqtt subscription.
If topic name is not given, then `home` will be used.

Most of the time, on every connecting device, the url should be:
`http://192.168.0.147:8080/messageBoard?name=<unique_user_name>`

And make sure this url should be added into your faviorite bookmarks.

