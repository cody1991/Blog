---
layout: post
title: Vue CLI 项目使用 Github Pages 自动部署静态页面
tags: [Vue]
---

# 前言

今天写了一篇 [Vue3 + TypeScript + Vuex4 初尝试](https://codytang.cn/2021/03/20/vue3-ts-list/) 的博客，代码放在 [vue3-typescript](https://github.com/cody1991/vue3-typescript) 上面了

但是项目代码没有自动构建，现在只能下载到本地进行体验。想起之前写过的一个项目 [ticket-purchase](https://github.com/cody1991/ticket-purchase) 有自动构建到 Github Pages 的流程，但是没有总结是怎么处理的，今天记录下

# 资料参考

`Vue CLI` 如果构建到 `Github Pages` 官网是有介绍的，这里做个简单的总结和记录，地址是 [https://cli.vuejs.org/guide/deployment.html#github-pages](https://cli.vuejs.org/guide/deployment.html#github-pages)

# 流程

## 创建/修改 vue.config.js 文件

我们需要在 `vue.config.js` 里面添加 `publicPath` ，指定路径。代码如下：

```js
module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/vue3-typescript/' : '/',
};
```

按照官网的说法

> If you are deploying to https://<USERNAME>.github.io/ or to a custom domain, you can omit publicPath as it defaults to "/".

> If you are deploying to https://<USERNAME>.github.io/<REPO>/, (i.e. your repository is at https://github.com/<USERNAME>/<REPO>), set publicPath to "/<REPO>/"

## 创建 deploy.sh 文件 (手动的方式)

按照官网的说明来也很简单就写好了

```sh
#!/usr/bin/env sh

# 当发生错误时中止脚本
set -e

# 构建
npm run build

# cd 到构建输出的目录下
cd dist

# 部署到自定义域域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 部署到 https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# 部署到 https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:cody1991/vue3-typescript.git master:gh-pages

cd -
```

## Using Travis CI for automatic updates (自动的方式)

可以利用 Travis CI 进行自动更新和构建

我们看看详细的步骤

1. Set correct publicPath in vue.config.js as explained above.
2. Install the Travis CLI client: gem install travis && travis --login
3. Generate a GitHub access token with repo permissions.
4. Grant the Travis job access to your repository: travis env set GITHUB_TOKEN xxx (xxx is the personal access token from step 3.)
5. Create a .travis.yml file in the root of your project.

第一步我们已经做好了

直接到第二步，我们安装下 `gem install travis` 然后进行登陆

不过发现 `travis --login` 登不上去。。emmm

看了下 `travis report` 也没看出啥，然后看到了一条 [issues](https://github.com/travis-ci/travis.rb/issues/788#issuecomment-750927765) ，按照它的做法成功登陆上去了。其实问题应该是要有 `Github access token` 授权才可以

那按照他们的说法，先去 [创建个人访问令牌](https://docs.github.com/cn/github/authenticating-to-github/creating-a-personal-access-token)

`然后 travis login --pro -g bb74b59628608f0......` 就可以了

继续往下第四步，发现 `travis env set GITHUB_TOKEN bb74b59628608f0......` 又报错了

```bash
Detected repository as cody1991/vue3-typescript, is this correct? |yes| yes
repository not known to https://api.travis-ci.org/: cody1991/vue3-typescript
```

我印象中是需要登陆 `https://travis-ci.org/profile` 官网去授权的。<del>但是很不幸我一直上不去，尴尬了。</del>。

突然又可以了，我印象中之前配置那个项目的时候也是很难登上去。

另外其实我们可以不再本地去执行 `travis env set GITHUB_TOKEN bb74b59628608f0......` 命令的，直接在官网上进行设置（这个以前忘记看过哪篇文章了，推荐在官网后台设置，方便也安全）

地址是类似于 [https://travis-ci.org/github/cody1991/vue3-typescript/settings](https://travis-ci.org/github/cody1991/vue-cli/settings)

截图如下：

![](/img/posts/vue-cli-github-pages-1.png)

## 创建 .travis.yml

```
language: node_js
node_js:
  - 'node'

cache: npm

script: npm run build

after_success:
  - cd dist
  - git init
  - git add .
  - git config user.name cody1991
  - git config user.email "476490767@qq.com"
  - git commit -m "自动更新pages"
  - git push --force --quiet "https://${GITHUB_TOKEN}@github.com/cody1991/vue3-typescript" master:gh-pages

deploy:
  provider: pages
  skip_cleanup: true
  github_token: $GITHUB_TOKEN
  local_dir: dist
  on:
    tags: true
```

然后放到我们目录下就好了，大功告成

## 结束语

后面遇到一个比较无语的事情，一直构建失败。。看了下 `travis` 上的日志，提示有些安装包无法下载？？？我们看了下我在跑项目的时候用的是 `yarn`，然后 `yarn` 的 `registry` 配置的是公司的地址，又生成了 `yarn.lock` 文件，导致一直无法下载。清除一下终于好了

![](/img/posts/vue-cli-github-pages-2.png) 构建成功～

[https://cody1991.github.io/vue3-typescript/](https://cody1991.github.io/vue3-typescript/) 也可以正常访问了～ nice
