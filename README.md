# PhotoNest Parallax

将 [hakadao/ArknightsParallaxCarousel](https://github.com/hakadao/ArknightsParallaxCarousel) 的原版视差轮播替换为 ZSTAR 的摄影作品。

网站：https://xdxsb.top/PhotoNest-Parallax/

## 原版效果

保留上游 HTML 布局、CSS、Bender 数字字体、黑色纹理背景、粒子配置、SVG 箭头、毛玻璃标题、四张缩略图、斜杠指示器、图片对角缩放切换与文字错峰滑入，以及前后景分层视差。侧边栏为全中文，使用同风格的黑色毛玻璃、灰白文字和斜杠标记。通过侧栏边缘的把手展开或收起，手机以抽屉展开。去除侧栏底部说明和照片标签，缩略图与主图左右边缘对齐。

照片取自 [PhotoNest](https://github.com/zstar1003/PhotoNest)：7 个相册，共 88 张，默认展示西电相册，每次只轮播当前地点。点击主图在当前页面放大本仓库内的 WebP 预览，按 Esc、点击遮罩或关闭按钮退出。使用箭头、缩略图、斜杠、键盘或手机滑动切换。

指示器跟随当前相册数量，最多展示原版的 18 个；修复首尾缩略图衔接及连续点击时的动画冲突。小屏幕按比例缩小原布局，减少动态效果偏好下关闭动画。

## 本地预览与更新

```sh
python3 -m http.server 8080
```

打开 http://localhost:8080。无需构建。

更新源相册后运行 `python3 scripts/sync-gallery.py`，提交并推送。同步脚本需要 `cwebp`（macOS：`brew install webp`）。它会从源仓库下载缩略图并生成两档 WebP：主图预览平均约 66 KB；底部 240px 小图平均约 6 KB。首次只加载当前主图和四张小图，未选择地点不会加载照片。源 JPG 缩略图保留用于再次压缩，不会在浏览时加载；放大查看复用当前仓库的同一张预览图，不跳转、不下载原图，也不请求源仓库。背景也使用压缩 WebP。GitHub Pages 从 main 分支根目录部署。

## 版权

原项目版权归 Hakadao 所有，MIT 许可证保留于 `THIRD_PARTY_LICENSES.txt`。原版代码与配套资源来自该项目。摄影作品归原作者所有。
