# 軍儀盤 Webアプリ（試作）

## 内容
- 9×9盤面、黒・白の駒配置
- 駒を選ぶと簡易移動候補を色分け
- 3段までの重ね置き
- 一手戻す
- ブラウザ内保存・JSON書き出し/読み込み
- PWA manifest / service worker / iPhone用アイコン

## 大事な注意
この版は動作確認用の試作です。移動範囲は簡易ルールであり、HUNTER×HUNTERの軍儀公式ルールを完全に実装していません。駒の正式な移動、段数による変化、ツケ、捕獲、成り、勝敗判定などは今後の実装が必要です。

## 公開してURLを作る方法（GitHub Pagesの例）
1. GitHubにログインし、新しい公開リポジトリを作る（例: `gungi-board`）。
2. このZIPを解凍し、`index.html`, `app.js`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` をリポジトリ直下にアップロードする。
3. リポジトリの Settings → Pages を開く。
4. Build and deployment で `Deploy from a branch`、Branch を `main`、フォルダを `/(root)` にして Save。
5. 数分後、`https://ユーザー名.github.io/gungi-board/` のようなURLが発行される。
6. iPhoneのSafariでそのURLを開く → 共有ボタン →「ホーム画面に追加」→「追加」。
7. ホーム画面の「軍儀盤」アイコンから起動できる。

## 保存について
「この端末に保存」は同じブラウザのlocalStorageに保存します。端末間同期はしません。別端末に移す場合は「ファイルに書き出す」を使ってJSONを保存し、もう一方で「ファイルから読み込む」を使います。
