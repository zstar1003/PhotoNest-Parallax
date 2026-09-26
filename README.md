# PhotoNest · 光影之间

ZSTAR 的旅行摄影展廊，以分层视差、悬浮标题和缩略图胶片呈现摄影作品。

## 在线浏览

https://zstar1003.github.io/PhotoNest-Parallax/

## 功能

- 7 个相册，全部照片及城市筛选
- 鼠标分层视差，照片淡入缩放与标题滑入
- 上一张 / 下一张、键盘方向键、手机左右滑动、可暂停自动播放
- 大图预览、原始分辨率照片入口
- 响应式布局、键盘焦点和减少动态效果偏好支持
- 预览图片随仓库部署，无运行时框架依赖

## 本地预览

```sh
python3 -m http.server 8080
```

打开 http://localhost:8080。无需构建。

## 更新图片

照片和元数据来自 [PhotoNest](https://github.com/zstar1003/PhotoNest)。修改源仓库后运行：

```sh
python3 scripts/sync-gallery.py
```

提交 `gallery.json` 和 `assets/photos/`。推送 main 分支后 GitHub Pages 自动部署。
原图链接指向源仓库，预览图存放在当前仓库。Google Fonts 无法访问时使用本地字体回退。

## 部署

GitHub Settings → Pages → Deploy from a branch → `main` / `/ (root)`。

## 致谢与版权

交互设计参考 [hakadao/ArknightsParallaxCarousel](https://github.com/hakadao/ArknightsParallaxCarousel)（MIT），保留其许可证于 `THIRD_PARTY_LICENSES.txt`。本站 HTML/CSS/JavaScript 为重新实现；不使用参考项目的游戏图片或字体。摄影作品来自 ZSTAR 的 PhotoNest 仓库，摄影版权归原作者所有。
