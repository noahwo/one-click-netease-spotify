# one-click-netease-spotify

Oneclick to import all your playlists from Netease Music to Spotify. 一键导入你的所有网易云音乐歌单到 Spotify

Just started to learn Javascript, this simple program is still with strong Python style, but solves my real problem, any suggestions or questions are welcome. 

> Chinese below | [中文说明](#逐步说明)请往下翻 ↓↓↓

## Step by step instruction

Firstly, clone the project to your local machine and install packages.

```bash
git clone https://github.com/noahwo/one-click-netease-spotify.git
cd one-click-netease-spotify
npm insall
```

You can start up the app by:

```bash
node app.js
```

Then rename `example.env` to `.env`.

### Netease Music side

#### API service hosting

You need to host the NeteaseMusic API service up, follow the instructions from this project [neteasecloudmusicapi](https://gitlab.com/Binaryify/neteasecloudmusicapi). Documentation is available [here](https://binaryify.github.io/NeteaseCloudMusicApi). (Only Chinsese version provided)

Put the API service address in the `.env` for the variable `NE_API`. e.g., `export NE_API=http://localhost:3000`.

#### Get your Netease Music user id

Login to your Netease Music account in **broswer**, and go to your profile page. The user id is in the URL, e.g., `http://music.163.com/#/user/home?id=12345678`, the user id is `12345678`.

Put the user id in the `.env` for the variable `USER_ID`. e.g., `export USER_ID=12345678`.

Count how many playlists you have/you wanna import, which is gonna be used in the program.

> P.S. playlists importing would be done following the order shown in the page. Importing by default includes both the playlists you created and collected.

### Spotify side

I did not figure out how to get the Authorization Code with PKCE Flow nor Implicit Grant which are the only ways to manipulate your own account, so there is a way to work around at the time through the code example given by the official.

#### Get your Spotify Developer account & access token

But anyway you need to login to [Spotify Developer page](https://developer.spotify.com/) first.
you can enter this page by clicking the up-left corner icon **[Spotify for Developers]**. The click 'See it in action'
# one-click-netease-spotify

Oneclick to import all your playlists from Netease Music to Spotify. 一键导入你的所有网易云音乐歌单到 Spotify

Just started to learn Javascript, this simple program is still with strong Python style, but solves my real problem, any suggestions or questions are welcome. 

> Chinese below | [中文说明](#逐步说明)请往下翻 ↓↓↓

## Step by step instruction

Firstly, clone the project to your local machine and install packages.

```bash
git clone https://github.com/noahwo/one-click-netease-spotify.git
cd one-click-netease-spotify
npm insall
```

You can start up the app by:

```bash
node app.js
```

Then rename `example.env` to `.env`.

### Netease Music side

#### API service hosting

You need to host the NeteaseMusic API service up, follow the instructions from this project [neteasecloudmusicapi](https://gitlab.com/Binaryify/neteasecloudmusicapi). Documentation is available [here](https://binaryify.github.io/NeteaseCloudMusicApi). (Only Chinsese version provided)

Put the API service address in the `.env` for the variable `NE_API`. e.g., `export NE_API=http://localhost:3000`.

#### Get your Netease Music user id

Login to your Netease Music account in **broswer**, and go to your profile page. The user id is in the URL, e.g., `http://music.163.com/#/user/home?id=12345678`, the user id is `12345678`.

Put the user id in the `.env` for the variable `USER_ID`. e.g., `export USER_ID=12345678`.

Count how many playlists you have/you wanna import, which is gonna be used in the program.

> P.S. playlists importing would be done following the order shown in the page. Importing by default includes both the playlists you created and collected.

### Spotify side

I did not figure out how to get the Authorization Code with PKCE Flow nor Implicit Grant which are the only ways to manipulate your own account, so there is a way to work around at the time through the code example given by the official.

#### Get your Spotify Developer account & access token

But anyway you need to login to [Spotify Developer page](https://developer.spotify.com/) first.
you can enter this page by clicking the up-left corner icon **[Spotify for Developers]**. The click 'See it in action'

![Spotify Developer Dashboard](images/image.png)
![alt text](images/image2.png)
The `token` variable is what we want, copy the full string to `.env`, e.g., `ACCESS_TOKEN='******your-token-string******'`.

> NOTE: This token expires in 1 hour, you need to refresh it manually.

### In the program

In the function `fetchNeteasePlaylists(USER_ID)`, you can edit `limit` and `offset` in the URL. `limit` (by default 30) determines how many playlists you wanna import, and `offset` (by default 0) determines the starting point (#th of your all lists) of the importing.
e.g.,

```javascript
const response = await fetch(
  `${NE_API}/user/playlist?uid=${USER_ID}&limit=30&offset=0`
);
```

Around the code below you can modify the filter condition to exclude some playlists you don't wanna import. For me, I already imported Favorite music from Netease, and labeled previously imported playlists with a "-" prefix.

e.g.,

```javascript
filteredPlaylist = await simplifiedPlaylist.filter(
  (item) => !item.name.startsWith("-") && !item.name.endsWith("喜欢的音乐")
);
```

> P.S. Due to the 300 character limit of the playlist description in Spotify, the failed song transitions info in playlist description may not be complete, you can check terminal output for missing information.



## 逐步说明

首先，将项目克隆到您的本地计算机并安装node包。

```bash
git clone https://github.com/noahwo/one-click-netease-spotify.git
cd one-click-netease-spotify
npm install
```

您可以通过以下方式启动应用程序：

```bash
node app.js
```

然后将 `example.env` 重命名为 `.env`。

### 网易云音乐端

#### API 服务托管

您需要启动网易云音乐 API 服务，按照此项目的说明进行操作 [neteasecloudmusicapi](https://gitlab.com/Binaryify/neteasecloudmusicapi)。文档可在[这里](https://binaryify.github.io/NeteaseCloudMusicApi)找到。（仅提供中文版）

将 API 服务地址放入 `.env` 中的变量 `NE_API` 中。例如，`export NE_API=http://localhost:3000`。

#### 获取您的网易云音乐用户 ID

在**浏览器**中登录您的网易云音乐帐户，并转到您的个人资料页面。用户 ID 在 URL 中，例如，`http://music.163.com/#/user/home?id=12345678`，用户 ID 是 `12345678`。

将用户 ID 放入 `.env` 中的变量 `USER_ID` 中。例如，`export USER_ID=12345678`。

计算您有/想要导入的播放列表数量，这将在程序中使用。

> 注：导入播放列表将按页面显示的顺序进行。默认情况下，导入包括您创建的和收藏的播放列表。

### Spotify 端

我尚未弄清如何使用 PKCE 流或隐式授权来获取授权码，这是操作您自己帐户的唯一方式，所以当时有一种通过官方给出的代码示例绕过的方法。

#### 获取您的 Spotify 开发者帐户和访问令牌

但无论如何，您首先需要登录[Spotify Developer 页面](https://developer.spotify.com/)。
您可以通过点击左上角图标 **[Spotify for Developers]** 进入此页面。然后点击 'See it in action'。

![Spotify Developer Dashboard](images/image.png)
![alt text](images/image2.png)
`token` 变量是我们想要的，将完整字符串复制到 `.env` 中，例如，`ACCESS_TOKEN='******your-token-string******'`。

> 注意：此令牌在 1 小时后过期，您需要手动刷新它。

### 在程序中
# one-click-netease-spotify

Oneclick to import all your playlists from Netease Music to Spotify. 一键导入你的所有网易云音乐歌单到 Spotify

Just started to learn Javascript, this simple program is still with strong Python style, but solves my real problem, any suggestions or questions are welcome. 

> Chinese below | [中文说明](#逐步说明)请往下翻 ↓↓↓

## Step by step instruction

Firstly, clone the project to your local machine and install packages.

```bash
git clone https://github.com/noahwo/one-click-netease-spotify.git
cd one-click-netease-spotify
npm insall
```

You can start up the app by:

```bash
node app.js
```

Then rename `example.env` to `.env`.

### Netease Music side

#### API service hosting

You need to host the NeteaseMusic API service up, follow the instructions from this project [neteasecloudmusicapi](https://gitlab.com/Binaryify/neteasecloudmusicapi). Documentation is available [here](https://binaryify.github.io/NeteaseCloudMusicApi). (Only Chinsese version provided)

Put the API service address in the `.env` for the variable `NE_API`. e.g., `export NE_API=http://localhost:3000`.

#### Get your Netease Music user id

Login to your Netease Music account in **broswer**, and go to your profile page. The user id is in the URL, e.g., `http://music.163.com/#/user/home?id=12345678`, the user id is `12345678`.

Put the user id in the `.env` for the variable `USER_ID`. e.g., `export USER_ID=12345678`.

Count how many playlists you have/you wanna import, which is gonna be used in the program.

> P.S. playlists importing would be done following the order shown in the page. Importing by default includes both the playlists you created and collected.

### Spotify side

I did not figure out how to get the Authorization Code with PKCE Flow nor Implicit Grant which are the only ways to manipulate your own account, so there is a way to work around at the time through the code example given by the official.

#### Get your Spotify Developer account & access token

But anyway you need to login to [Spotify Developer page](https://developer.spotify.com/) first.
you can enter this page by clicking the up-left corner icon **[Spotify for Developers]**. The click 'See it in action'

![Spotify Developer Dashboard](images/image.png)
![alt text](images/image2.png)
The `token` variable is what we want, copy the full string to `.env`, e.g., `ACCESS_TOKEN='******your-token-string******'`.

> NOTE: This token expires in 1 hour, you need to refresh it manually.

### In the program

In the function `fetchNeteasePlaylists(USER_ID)`, you can edit `limit` and `offset` in the URL. `limit` (by default 30) determines how many playlists you wanna import, and `offset` (by default 0) determines the starting point (#th of your all lists) of the importing.
e.g.,

```javascript
const response = await fetch(
  `${NE_API}/user/playlist?uid=${USER_ID}&limit=30&offset=0`
);
```

Around the code below you can modify the filter condition to exclude some playlists you don't wanna import. For me, I already imported Favorite music from Netease, and labeled previously imported playlists with a "-" prefix.

e.g.,

```javascript
filteredPlaylist = await simplifiedPlaylist.filter(
  (item) => !item.name.startsWith("-") && !item.name.endsWith("喜欢的音乐")
);
```

> P.S. Due to the 300 character limit of the playlist description in Spotify, the failed song transitions info in playlist description may not be complete, you can check terminal output for missing information.



## 逐步说明

首先，将项目克隆到您的本地计算机并安装node包。

```bash
git clone https://github.com/noahwo/one-click-netease-spotify.git
cd one-click-netease-spotify
npm install
```

您可以通过以下方式启动应用程序：

```bash
node app.js
```

然后将 `example.env` 重命名为 `.env`。

### 网易云音乐端

#### API 服务托管

您需要启动网易云音乐 API 服务，按照此项目的说明进行操作 [neteasecloudmusicapi](https://gitlab.com/Binaryify/neteasecloudmusicapi)。文档可在[这里](https://binaryify.github.io/NeteaseCloudMusicApi)找到。（仅提供中文版）

将 API 服务地址放入 `.env` 中的变量 `NE_API` 中。例如，`export NE_API=http://localhost:3000`。

#### 获取您的网易云音乐用户 ID

在**浏览器**中登录您的网易云音乐帐户，并转到您的个人资料页面。用户 ID 在 URL 中，例如，`http://music.163.com/#/user/home?id=12345678`，用户 ID 是 `12345678`。

将用户 ID 放入 `.env` 中的变量 `USER_ID` 中。例如，`export USER_ID=12345678`。

计算您有/想要导入的播放列表数量，这将在程序中使用。

> 注：导入播放列表将按页面显示的顺序进行。默认情况下，导入包括您创建的和收藏的播放列表。

### Spotify 端

我尚未弄清如何使用 PKCE 流或隐式授权来获取授权码，这是操作您自己帐户的唯一方式，所以当时有一种通过官方给出的代码示例绕过的方法。

#### 获取您的 Spotify 开发者帐户和访问令牌

但无论如何，您首先需要登录[Spotify Developer 页面](https://developer.spotify.com/)。
您可以通过点击左上角图标 **[Spotify for Developers]** 进入此页面。然后点击 'See it in action'。

![Spotify Developer Dashboard](images/image.png)
![alt text](images/image2.png)
`token` 变量是我们想要的，将完整字符串复制到 `.env` 中，例如，`ACCESS_TOKEN='******your-token-string******'`。

> 注意：此令牌在 1 小时后过期，您需要手动刷新它。
# one-click-netease-spotify

Oneclick to import all your playlists from Netease Music to Spotify. 一键导入你的所有网易云音乐歌单到 Spotify

Just started to learn Javascript, this simple program is still with strong Python style, but solves my real problem, any suggestions or questions are welcome. 

> Chinese below | [中文说明](#逐步说明)请往下翻 ↓↓↓

## Step by step instruction

Firstly, clone the project to your local machine and install packages.

```bash
git clone https://github.com/noahwo/one-click-netease-spotify.git
cd one-click-netease-spotify
npm insall
```

You can start up the app by:

```bash
node app.js
```

Then rename `example.env` to `.env`.

### Netease Music side

#### API service hosting

You need to host the NeteaseMusic API service up, follow the instructions from this project [neteasecloudmusicapi](https://gitlab.com/Binaryify/neteasecloudmusicapi). Documentation is available [here](https://binaryify.github.io/NeteaseCloudMusicApi). (Only Chinsese version provided)

Put the API service address in the `.env` for the variable `NE_API`. e.g., `export NE_API=http://localhost:3000`.

#### Get your Netease Music user id

Login to your Netease Music account in **broswer**, and go to your profile page. The user id is in the URL, e.g., `http://music.163.com/#/user/home?id=12345678`, the user id is `12345678`.

Put the user id in the `.env` for the variable `USER_ID`. e.g., `export USER_ID=12345678`.

Count how many playlists you have/you wanna import, which is gonna be used in the program.

> P.S. playlists importing would be done following the order shown in the page. Importing by default includes both the playlists you created and collected.

### Spotify side

I did not figure out how to get the Authorization Code with PKCE Flow nor Implicit Grant which are the only ways to manipulate your own account, so there is a way to work around at the time through the code example given by the official.

#### Get your Spotify Developer account & access token

But anyway you need to login to [Spotify Developer page](https://developer.spotify.com/) first.
you can enter this page by clicking the up-left corner icon **[Spotify for Developers]**. The click 'See it in action'

![Spotify Developer Dashboard](images/image.png)
![alt text](images/image2.png)
The `token` variable is what we want, copy the full string to `.env`, e.g., `ACCESS_TOKEN='******your-token-string******'`.

> NOTE: This token expires in 1 hour, you need to refresh it manually.

### In the program

In the function `fetchNeteasePlaylists(USER_ID)`, you can edit `limit` and `offset` in the URL. `limit` (by default 30) determines how many playlists you wanna import, and `offset` (by default 0) determines the starting point (#th of your all lists) of the importing.
e.g.,

```javascript
const response = await fetch(
  `${NE_API}/user/playlist?uid=${USER_ID}&limit=30&offset=0`
);
```

Around the code below you can modify the filter condition to exclude some playlists you don't wanna import. For me, I already imported Favorite music from Netease, and labeled previously imported playlists with a "-" prefix.

e.g.,

```javascript
filteredPlaylist = await simplifiedPlaylist.filter(
  (item) => !item.name.startsWith("-") && !item.name.endsWith("喜欢的音乐")
);
```

> P.S. Due to the 300 character limit of the playlist description in Spotify, the failed song transitions info in playlist description may not be complete, you can check terminal output for missing information.



## 逐步说明

首先，将项目克隆到您的本地计算机并安装node包。

```bash
git clone https://github.com/noahwo/one-click-netease-spotify.git
cd one-click-netease-spotify
npm install
```

您可以通过以下方式启动应用程序：

```bash
node app.js
```

然后将 `example.env` 重命名为 `.env`。

### 网易云音乐端

#### API 服务托管

您需要启动网易云音乐 API 服务，按照此项目的说明进行操作 [neteasecloudmusicapi](https://gitlab.com/Binaryify/neteasecloudmusicapi)。文档可在[这里](https://binaryify.github.io/NeteaseCloudMusicApi)找到。（仅提供中文版）

将 API 服务地址放入 `.env` 中的变量 `NE_API` 中。例如，`export NE_API=http://localhost:3000`。

#### 获取您的网易云音乐用户 ID

在**浏览器**中登录您的网易云音乐帐户，并转到您的个人资料页面。用户 ID 在 URL 中，例如，`http://music.163.com/#/user/home?id=12345678`，用户 ID 是 `12345678`。

将用户 ID 放入 `.env` 中的变量 `USER_ID` 中。例如，`export USER_ID=12345678`。

计算您有/想要导入的播放列表数量，这将在程序中使用。

> 注：导入播放列表将按页面显示的顺序进行。默认情况下，导入包括您创建的和收藏的播放列表。

### Spotify 端

我尚未弄清如何使用 PKCE 流或隐式授权来获取授权码，这是操作您自己帐户的唯一方式，所以当时有一种通过官方给出的代码示例绕过的方法。

#### 获取您的 Spotify 开发者帐户和访问令牌

但无论如何，您首先需要登录[Spotify Developer 页面](https://developer.spotify.com/)。
您可以通过点击左上角图标 **[Spotify for Developers]** 进入此页面。然后点击 'See it in action'。

![Spotify Developer Dashboard](images/image.png)
![alt text](images/image2.png)
`token` 变量是我们想要的，将完整字符串复制到 `.env` 中，例如，`ACCESS_TOKEN='******your-token-string******'`。

> 注意：此令牌在 1 小时后过期，您需要手动刷新它。

### 在程序中
# one-click-netease-spotify

Oneclick to import all your playlists from Netease Music to Spotify. 一键导入你的所有网易云音乐歌单到 Spotify

Just started to learn Javascript, this simple program is still with strong Python style, but solves my real problem, any suggestions or questions are welcome. 

> Chinese below | [中文说明](#逐步说明)请往下翻 ↓↓↓

## Step by step instruction

Firstly, clone the project to your local machine and install packages.

```bash
git clone https://github.com/noahwo/one-click-netease-spotify.git
cd one-click-netease-spotify
npm insall
```

You can start up the app by:

```bash
node app.js
```

Then rename `example.env` to `.env`.

### Netease Music side

#### API service hosting

You need to host the NeteaseMusic API service up, follow the instructions from this project [neteasecloudmusicapi](https://gitlab.com/Binaryify/neteasecloudmusicapi). Documentation is available [here](https://binaryify.github.io/NeteaseCloudMusicApi). (Only Chinsese version provided)

Put the API service address in the `.env` for the variable `NE_API`. e.g., `export NE_API=http://localhost:3000`.

#### Get your Netease Music user id

Login to your Netease Music account in **broswer**, and go to your profile page. The user id is in the URL, e.g., `http://music.163.com/#/user/home?id=12345678`, the user id is `12345678`.

Put the user id in the `.env` for the variable `USER_ID`. e.g., `export USER_ID=12345678`.

Count how many playlists you have/you wanna import, which is gonna be used in the program.

> P.S. playlists importing would be done following the order shown in the page. Importing by default includes both the playlists you created and collected.

### Spotify side

I did not figure out how to get the Authorization Code with PKCE Flow nor Implicit Grant which are the only ways to manipulate your own account, so there is a way to work around at the time through the code example given by the official.

#### Get your Spotify Developer account & access token

But anyway you need to login to [Spotify Developer page](https://developer.spotify.com/) first.
you can enter this page by clicking the up-left corner icon **[Spotify for Developers]**. The click 'See it in action'

![Spotify Developer Dashboard](images/image.png)
![alt text](images/image2.png)
The `token` variable is what we want, copy the full string to `.env`, e.g., `ACCESS_TOKEN='******your-token-string******'`.

> NOTE: This token expires in 1 hour, you need to refresh it manually.

### In the program

In the function `fetchNeteasePlaylists(USER_ID)`, you can edit `limit` and `offset` in the URL. `limit` (by default 30) determines how many playlists you wanna import, and `offset` (by default 0) determines the starting point (#th of your all lists) of the importing.
e.g.,

```javascript
const response = await fetch(
  `${NE_API}/user/playlist?uid=${USER_ID}&limit=30&offset=0`
);
```

Around the code below you can modify the filter condition to exclude some playlists you don't wanna import. For me, I already imported Favorite music from Netease, and labeled previously imported playlists with a "-" prefix.

e.g.,

```javascript
filteredPlaylist = await simplifiedPlaylist.filter(
  (item) => !item.name.startsWith("-") && !item.name.endsWith("喜欢的音乐")
);
```

> P.S. Due to the 300 character limit of the playlist description in Spotify, the failed song transitions info in playlist description may not be complete, you can check terminal output for missing information.



## 逐步说明

首先，将项目克隆到您的本地计算机并安装node包。

```bash
git clone https://github.com/noahwo/one-click-netease-spotify.git
cd one-click-netease-spotify
npm install
```

您可以通过以下方式启动应用程序：

```bash
node app.js
```

然后将 `example.env` 重命名为 `.env`。

### 网易云音乐端

#### API 服务托管

您需要启动网易云音乐 API 服务，按照此项目的说明进行操作 [neteasecloudmusicapi](https://gitlab.com/Binaryify/neteasecloudmusicapi)。文档可在[这里](https://binaryify.github.io/NeteaseCloudMusicApi)找到。（仅提供中文版）

将 API 服务地址放入 `.env` 中的变量 `NE_API` 中。例如，`export NE_API=http://localhost:3000`。

#### 获取您的网易云音乐用户 ID

在**浏览器**中登录您的网易云音乐帐户，并转到您的个人资料页面。用户 ID 在 URL 中，例如，`http://music.163.com/#/user/home?id=12345678`，用户 ID 是 `12345678`。

将用户 ID 放入 `.env` 中的变量 `USER_ID` 中。例如，`export USER_ID=12345678`。

计算您有/想要导入的播放列表数量，这将在程序中使用。

> 注：导入播放列表将按页面显示的顺序进行。默认情况下，导入包括您创建的和收藏的播放列表。

### Spotify 端

我尚未弄清如何使用 PKCE 流或隐式授权来获取授权码，这是操作您自己帐户的唯一方式，所以当时有一种通过官方给出的代码示例绕过的方法。

#### 获取您的 Spotify 开发者帐户和访问令牌

但无论如何，您首先需要登录[Spotify Developer 页面](https://developer.spotify.com/)。
您可以通过点击左上角图标 **[Spotify for Developers]** 进入此页面。然后点击 'See it in action'。

![Spotify Developer Dashboard](images/image.png)
![alt text](images/image2.png)
`token` 变量是我们想要的，将完整字符串复制到 `.env` 中，例如，`ACCESS_TOKEN='******your-token-string******'`。

> 注意：此令牌在 1 小时后过期，您需要手动刷新它。

### 在程序中

在函数 `fetchNeteasePlaylists(USER_ID)` 中，您可以编辑 URL 中的 `limit` 和 `offset`。`limit`（默认为 30）确定您想要导入的播放列表数量，`offset`（默认为 0）确定导入的起始点（您所有列表的第 # 个）。
例如，

```javascript
const response = await fetch(
  `${NE_API}/user/playlist?uid=${USER_ID}&limit=30&offset=0`
);
```

在下面的代码中，您可以修改过滤条件以排除您不想要导入的某些播放列表。对于我来说，我已经从网易云音乐导入了“喜欢的音乐”，并使用“-”前缀标记了先前导入的播放列表。

例如，

```javascript
filteredPlaylist = await simplifiedPlaylist.filter(
  (item) => !item.name.startsWith("-") && !item.name.endsWith("喜欢的音乐")
);
```

> 注：由于 Spotify 中播放列表描述的字符限制为 300，因此播放列表描述中的失败歌曲转换信息可能不完整，您可以检查终端输出以查找缺失的信息。

在函数 `fetchNeteasePlaylists(USER_ID)` 中，您可以编辑 URL 中的 `limit` 和 `offset`。`limit`（默认为 30）确定您想要导入的播放列表数量，`offset`（默认为 0）确定导入的起始点（您所有列表的第 # 个）。
例如，

```javascript
const response = await fetch(
  `${NE_API}/user/playlist?uid=${USER_ID}&limit=30&offset=0`
);
```

在下面的代码中，您可以修改过滤条件以排除您不想要导入的某些播放列表。对于我来说，我已经从网易云音乐导入了“喜欢的音乐”，并使用“-”前缀标记了先前导入的播放列表。

例如，

```javascript
filteredPlaylist = await simplifiedPlaylist.filter(
  (item) => !item.name.startsWith("-") && !item.name.endsWith("喜欢的音乐")
);
```

> 注：由于 Spotify 中播放列表描述的字符限制为 300，因此播放列表描述中的失败歌曲转换信息可能不完整，您可以检查终端输出以查找缺失的信息。

### 在程序中

在函数 `fetchNeteasePlaylists(USER_ID)` 中，您可以编辑 URL 中的 `limit` 和 `offset`。`limit`（默认为 30）确定您想要导入的播放列表数量，`offset`（默认为 0）确定导入的起始点（您所有列表的第 # 个）。
例如，

```javascript
const response = await fetch(
  `${NE_API}/user/playlist?uid=${USER_ID}&limit=30&offset=0`
);
```

在下面的代码中，您可以修改过滤条件以排除您不想要导入的某些播放列表。对于我来说，我已经从网易云音乐导入了“喜欢的音乐”，并使用“-”前缀标记了先前导入的播放列表。

例如，

```javascript
filteredPlaylist = await simplifiedPlaylist.filter(
  (item) => !item.name.startsWith("-") && !item.name.endsWith("喜欢的音乐")
);
```

> 注：由于 Spotify 中播放列表描述的字符限制为 300，因此播放列表描述中的失败歌曲转换信息可能不完整，您可以检查终端输出以查找缺失的信息。

在函数 `fetchNeteasePlaylists(USER_ID)` 中，您可以编辑 URL 中的 `limit` 和 `offset`。`limit`（默认为 30）确定您想要导入的播放列表数量，`offset`（默认为 0）确定导入的起始点（您所有列表的第 # 个）。
例如，

```javascript
const response = await fetch(
  `${NE_API}/user/playlist?uid=${USER_ID}&limit=30&offset=0`
);
```

在下面的代码中，您可以修改过滤条件以排除您不想要导入的某些播放列表。对于我来说，我已经从网易云音乐导入了“喜欢的音乐”，并使用“-”前缀标记了先前导入的播放列表。

例如，

```javascript
filteredPlaylist = await simplifiedPlaylist.filter(
  (item) => !item.name.startsWith("-") && !item.name.endsWith("喜欢的音乐")
);
```

> 注：由于 Spotify 中播放列表描述的字符限制为 300，因此播放列表描述中的失败歌曲转换信息可能不完整，您可以检查终端输出以查找缺失的信息。

![Spotify Developer Dashboard](images/image.png)
![alt text](images/image2.png)
The `token` variable is what we want, copy the full string to `.env`, e.g., `ACCESS_TOKEN='******your-token-string******'`.

> NOTE: This token expires in 1 hour, you need to refresh it manually.

### In the program

In the function `fetchNeteasePlaylists(USER_ID)`, you can edit `limit` and `offset` in the URL. `limit` (by default 30) determines how many playlists you wanna import, and `offset` (by default 0) determines the starting point (#th of your all lists) of the importing.
e.g.,

```javascript
const response = await fetch(
  `${NE_API}/user/playlist?uid=${USER_ID}&limit=30&offset=0`
);
```

Around the code below you can modify the filter condition to exclude some playlists you don't wanna import. For me, I already imported Favorite music from Netease, and labeled previously imported playlists with a "-" prefix.

e.g.,

```javascript
filteredPlaylist = await simplifiedPlaylist.filter(
  (item) => !item.name.startsWith("-") && !item.name.endsWith("喜欢的音乐")
);
```

> P.S. Due to the 300 character limit of the playlist description in Spotify, the failed song transitions info in playlist description may not be complete, you can check terminal output for missing information.



## 逐步说明

首先，将项目克隆到您的本地计算机并安装node包。

```bash
git clone https://github.com/noahwo/one-click-netease-spotify.git
cd one-click-netease-spotify
npm install
```

您可以通过以下方式启动应用程序：

```bash
node app.js
```

然后将 `example.env` 重命名为 `.env`。

### 网易云音乐端

#### API 服务托管

您需要启动网易云音乐 API 服务，按照此项目的说明进行操作 [neteasecloudmusicapi](https://gitlab.com/Binaryify/neteasecloudmusicapi)。文档可在[这里](https://binaryify.github.io/NeteaseCloudMusicApi)找到。（仅提供中文版）

将 API 服务地址放入 `.env` 中的变量 `NE_API` 中。例如，`export NE_API=http://localhost:3000`。

#### 获取您的网易云音乐用户 ID

在**浏览器**中登录您的网易云音乐帐户，并转到您的个人资料页面。用户 ID 在 URL 中，例如，`http://music.163.com/#/user/home?id=12345678`，用户 ID 是 `12345678`。

将用户 ID 放入 `.env` 中的变量 `USER_ID` 中。例如，`export USER_ID=12345678`。

计算您有/想要导入的播放列表数量，这将在程序中使用。

> 注：导入播放列表将按页面显示的顺序进行。默认情况下，导入包括您创建的和收藏的播放列表。

### Spotify 端

我尚未弄清如何使用 PKCE 流或隐式授权来获取授权码，这是操作您自己帐户的唯一方式，所以当时有一种通过官方给出的代码示例绕过的方法。

#### 获取您的 Spotify 开发者帐户和访问令牌

但无论如何，您首先需要登录[Spotify Developer 页面](https://developer.spotify.com/)。
您可以通过点击左上角图标 **[Spotify for Developers]** 进入此页面。然后点击 'See it in action'。

![Spotify Developer Dashboard](images/image.png)
![alt text](images/image2.png)
`token` 变量是我们想要的，将完整字符串复制到 `.env` 中，例如，`ACCESS_TOKEN='******your-token-string******'`。

> 注意：此令牌在 1 小时后过期，您需要手动刷新它。

### 在程序中

在函数 `fetchNeteasePlaylists(USER_ID)` 中，您可以编辑 URL 中的 `limit` 和 `offset`。`limit`（默认为 30）确定您想要导入的播放列表数量，`offset`（默认为 0）确定导入的起始点（您所有列表的第 # 个）。
例如，

```javascript
const response = await fetch(
  `${NE_API}/user/playlist?uid=${USER_ID}&limit=30&offset=0`
);
```

在下面的代码中，您可以修改过滤条件以排除您不想要导入的某些播放列表。对于我来说，我已经从网易云音乐导入了“喜欢的音乐”，并使用“-”前缀标记了先前导入的播放列表。

例如，

```javascript
filteredPlaylist = await simplifiedPlaylist.filter(
  (item) => !item.name.startsWith("-") && !item.name.endsWith("喜欢的音乐")
);
```

> 注：由于 Spotify 中播放列表描述的字符限制为 300，因此播放列表描述中的失败歌曲转换信息可能不完整，您可以检查终端输出以查找缺失的信息。
