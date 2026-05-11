# ZQ Audio Design Portfolio Web App

本项目是一个本地 Web App，不再通过双击 `index.html` 打开。

## 运行

```powershell
npm run dev
```

浏览器访问：

```text
http://127.0.0.1:5173
```

## 使用

- 在“上传与排版”区域添加作品。
- 支持上传 `video/*` 和 `audio/*` 文件，视频会在作品卡片中直接预览。
- 可填写标题、类别、职责、年份、说明、标签。
- 可切换作品排版：网格、紧凑、长卡。
- 可上移、下移、编辑、删除作品。
- 当前默认作品来自 `assets/works/` 和 `data/works.json`。
- Hero 背景视频来自 `assets/hero/hero-interior-gallery.mp4`。

## 数据保存

当前版本把作品信息保存在浏览器 `localStorage`，把视频/音频文件保存在浏览器 `IndexedDB`。
这适合本机整理作品集。正式上线或发给 HR 前，建议改成后端上传或静态资源路径。

## 重新导入本地视频

```powershell
npm run import:videos -- "E:\新建文件夹\作品\赵上琦音效作品"
```

导入会复制视频到 `assets/works/`，生成封面到 `assets/thumbs/`，并刷新 `data/works.json`。

## 重新生成 Hero 背景视频

```powershell
npm run build:hero
```

该脚本会用部分作品封面生成无文字的 Vaporwave / 3D 室内画廊风格背景 MP4。
