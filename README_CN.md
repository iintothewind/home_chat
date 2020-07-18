# home chat

[English](https://github.com/iintothewind/home_chat/blob/master/README.md)
![logo](https://github.com/iintothewind/home_chat/raw/master/src/resources/logo70.png)

home_chat是一个可以在不同家庭设备直接传输消息的网页及时通讯工具.

## 为什么要做这个WebIM

因为我恨死了每次我在PC上查看微信发过来的消息的时候, 不得不扫那个该死的二维码.


我曾经想过一些替代方案, 首先我不想装微信桌面应用, 因为就算那样也得扫那个该死的二维码. 其次我想过用slack, 但是国内的网络状况, slack有时候登录真的很慢. 想过部署一些现有的IM, 比如mattermost等, 部署比较麻烦而且比较重....

所以还是自己写一个吧, 就当拿typescript练手了.

配合这款APP和它的后端API, 在IOS平台上可以很方便的传输消息, 打开网页直接发消息, 或者直接长按使用捷径通过后端API发送都可以.

## 功能特性

- [X] 支持消息发送和接收的exact once QoS
- [X] 支持服务端消息持久化. 对于还没有发送到客户端的消息可以在服务器端存储一段时间, 等客户端下次连接才会推送.
- [X] 支持客户端消息持久化. 已经接收到的消息会保存在浏览器的IndexedDB内, 文本和图片消息都有不同的保存期限.
- [X] 支持后端API, 通过 [home_chat_backend](https://github.com/iintothewind/home_chat_backend)
- [X] 支持HTTPS, 目前是Vercel自动提供
- [X] 支持Markdown, 图片只负责渲染, 不提供持久化功能.
- [X] 支持自定义表情, 只保存表情图片的URL, 不提供图片本地存储.
- [X] 支持桌面已经安卓系统浏览器的消息推送, 当窗口处于不可见状态时, 会推送收到的消息到桌面
- [X] 支持从github登录

## 更多功能(计划中)

- [ ] 私聊支持, 可以使用@user
- [ ] 聊天机器人支持
- [ ] 更细粒度更严谨的访问控制


## 安装

这个app是基于npm构建, 并运行在nginx和mosquitto的docker容器里面的.
它可以被部署在`x86`和`armv7(respberrypi)`的docker容器里面.

- 首先, 你需要切换到[docker](https://github.com/iintothewind/home_chat/tree/docker)分支来做以下步骤

- 更新配置文件`util/config.ts`, 比如`mqttUrl`, `backendUrl`, `baseName`等

- `npm run build`

编译好的文件会放在`./build`里面

- `docker network create home_chat`

为了配合后端服务[home_chat_backend](https://github.com/iintothewind/home_chat_backend), 需要手动创建名为`home_chat`的network

- `docker-compose up -d`

mosquitto使用端口号`1883`来提供未加密版本的`mqtt`服务
mosquitto使用端口号`1884`来提供未加密版本的`mqtt-over-websocket`服务
nginx使用端口号`8080`来提供`http`服务

## 使用

假设app已经被顺利部署在了`192.168.0.147`这个主机上, 在同一个局域网内的机器可以通过访问下面的URL来打开页面:

`http://192.168.0.147:8080/home_chat/messageList?user=username&topic=general`

对于上面的URL, 有两个你可以使用的请求参数:

- user=`username`

你使用的登录用户名, 对于每台设备来说应该是唯一的.
如果这个参数没有提供, 将会有一个随机的用户名分配给本次登录的页面.
这个用户名将会被用作mqtt客户端订阅的`client id`用来保存服务器端的session.
请尽量确保为每一台设备使用不同的唯一用户名, 这样下次上线的时候, 没有接收到的信息才会被再次接收到.

- topic=`general`

mqtt客户端订阅的主题名字.
如果这个参数没有提供, `general`将会作为默认主题来订阅.


对于大多数情况来说, 对于连接的设备, 如果我们不需要使用特殊主题, 我们只需要提供用户名就可以了:

`http://<host_name>:8080/home_chat/messageList?user=<unique_user_name>`

然后将这个URL加到浏览器的收藏夹里面确保每次使用不用手动输入.

## 启用从github登录

你需要首先创建一个属于你自己的client app, 然后再修改文件`src\util\config.ts`的相关配置.
具体请查看源代码和github的API文档.

## 界面截图

![home_chat_demo_009](https://raw.githubusercontent.com/iintothewind/images/master/home_chat_demo_009.png)

