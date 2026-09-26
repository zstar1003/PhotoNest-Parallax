# PhotoNest Parallax

将 [hakadao/ArknightsParallaxCarousel](https://github.com/hakadao/ArknightsParallaxCarousel) 的原版视差轮播替换为 ZSTAR 的摄影作品。

网站：https://xdxsb.top/PhotoNest-Parallax/

## 原版效果

保留上游 HTML 布局、CSS、Bender 数字字体、黑色纹理背景、粒子配置、SVG 箭头、毛玻璃标题、四张缩略图、斜杠指示器、图片对角缩放切换与文字错峰滑入，以及前后景分层视差。没有额外导航栏或相册筛选界面。

照片取自 [PhotoNest](https://github.com/zstar1003/PhotoNest)：7 个相册，共 88 张。点击主图打开原图。使用箭头、缩略图、斜杠、键盘或手机滑动切换。

为适配 88 张照片，指示器一次保留原版的 18 个，随当前照片移动；修复首尾缩略图衔接及连续点击时的动画冲突。小屏幕按比例缩小原布局，减少动态效果偏好下关闭动画。

## 本地预览与更新

```sh
python3 -m http.server 8080
```

打开 http://localhost:8080。无需构建。

更新源相册后运行 `python3 scripts/sync-gallery.py`，提交并推送。预览图保存在 `assets/photos/`，原图按需从源仓库打开。GitHub Pages 从 main 分支根目录部署。

## 版权

原项目版权归 Hakadao 所有，MIT 许可证保留于 `THIRD_PARTY_LICENSES.txt`。原版代码与配套资源来自该项目。摄影作品归原作者所有。
