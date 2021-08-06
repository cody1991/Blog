#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
JEKYLL_ENV=production jekyll build

# 进入生成的文件夹
cd _site/


git init
git add -A
git commit -m '🎉🎉 又发布新内容啦 🎉🎉'

# 如果发布到 https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:cody1991/Blog.git master:gh-pages

