# 海報提示詞產生器 · Poster Generator

繁體中文的課程招生海報提示詞工具。可產生底圖、完整海報或修改現有海報的提示詞。

## 線上使用

GitHub Pages 啟用後： https://squall021.github.io/poster-generator/

## 功能

- 三種製作模式、五種風格、三種排版配置。
- 課程資料、主色與輔色、尺寸方向、Logo 與 QR code 空間設定。
- 即時產生提示詞、手動編輯、一鍵複製、TXT 下載。
- 草稿自動儲存、命名設定與 JSON 匯入／匯出。

## 給試用同事

1. 可以先按「載入美甲課程範例」。
2. 選模式、填課程內容，接著調整風格與版面。
3. 複製提示詞，貼到圖片生成工具。修改模式需另附原海報圖片。
4. 版面示意僅顯示配色與區塊，不是 AI 生成結果。

資料儲存在使用者目前瀏覽器，不跨裝置同步。清除瀏覽器資料會刪除本機草稿及設定；請使用 JSON 匯出備份。紙張比例不代表生成圖已符合印刷解析度，正式印刷前請核對尺寸與文字。

## 首次啟用 GitHub Pages

儲存庫 Settings → Pages → Build and deployment：

- Source：Deploy from a branch
- Branch：main
- Folder：/(root)
- 按 Save，等待 GitHub 完成部署。

## 本機執行與檢查

使用 HTTP 靜態伺服器開啟根目錄；本專案使用 ES modules，請勿直接以 file:// 開啟。

```sh
python -m http.server 8000
node --check app.mjs
node --test tests/engine.test.mjs
```

不需 API 金鑰，也不會直接呼叫圖片生成服務。
