# Yorido

> 身近な人が陰謀論にのめり込み、
> どう接すればいいか分からないあなたへ。
>
> **ひとりで抱え込まないための、最初のよりどころ。**

Yorido は「よりどころ」をイメージした名前です。家族・友人・恋人など、身近な人が
陰謀論や誤情報にのめり込んでしまい、どう接すればよいか分からず悩んでいる
「支える側」のための、モバイルファーストの Web アプリプロトタイプです。

本人を論破したり、考えを変えさせたりすることは目的にしません。利用者自身の
心理的負担を軽くし、ひとりで抱え込まずに最初に相談できる場所を目指します。

---

## 開発に参加する

いまのタスクと進捗は **[開発ボード](https://github.com/orgs/yuai-project/projects/1/views/3)** にまとまっています。
何から手を付けるか迷ったら、まずボードの `Todo` を上から見てください。

- 開発の進め方（Issue → ブランチ → PR）→ [CONTRIBUTING.md](CONTRIBUTING.md)
- 気づいたこと・困っていることは [新規 Issue](../../issues/new/choose) から。話し言葉・箇条書きのままで大丈夫です

---

## 起動方法

WSL2 上の Linux ファイルシステムでの実行を前提にしています。

```bash
npm install      # 依存関係のインストール
npm run dev      # 開発サーバー起動 → http://localhost:5173/
npm run build    # 本番ビルド（dist/ に出力）
npm run preview  # ビルド結果のプレビュー
npm run lint     # oxlint
```

スマホ幅（最大 430px）を基本に設計しています。

- スマホ（〜767px）：モバイルUI＋下部ナビ
- タブレット（768〜1023px）：1カラムのまま幅を少し広げる
- PC（1024px〜）：上部ヘッダーナビ＋最大 1160px の Web サイト型レイアウト。
  相談結果・相談フォーム・体験談などは2カラム（結果画面の右列は追従サイドバー）ブラウザの開発者ツールでモバイル表示にすると
より本物のアプリらしく確認できます。

---

## 技術スタック

- **React 19** + **Vite 8**
- **Tailwind CSS v4**（`@tailwindcss/vite` プラグイン。設定は `src/index.css` の `@theme`）
- **React Router v7**
- **lucide-react**（アイコン）

---

## 画面構成

| ルート | 画面 | 説明 |
| --- | --- | --- |
| `/` | ホーム | 課題提起・2つのCTA・「こんな悩み」カード |
| `/consult` | AI相談入力 | 3ステップの相談内容入力フォーム（あなたと相手 / 困っていること / これから）＋ローディング演出 |
| `/consult/result` | **AI相談結果** | 構造化された7セクションのカードUI（最重要画面） |
| `/stories` | 体験談一覧 | 匿名投稿カード12件＋投稿FAB |
| `/stories/:id` | 体験談詳細 | 5セクションの全文＋役に立ったボタン |
| `/stories/new` | 体験談投稿 | 匿名フォーム＋投稿完了画面 |
| `/mypage` | マイページ | ダミー（履歴・相談窓口案内など） |

下部ナビ（ホーム / AI相談 / 体験談 / マイページ）で主要画面を移動できます。

### AI相談結果画面の7セクション

1. まず、あなた自身へ（利用者本人のケア）
2. 今、起きているかもしれないこと（**断定せず仮説**として提示）
3. できれば避けたい対応（赤黒ではなく**やさしい警告色**）
4. こんな返し方を試してみる（**タップでコピー**可能）
5. 次に聞いてみる質問
6. こんなときは無理に話さなくて大丈夫（**安全優先**の案内）
7. 似た体験談（→ 一覧へ）

汎用チャットUIにせず、価値が視覚的に伝わる構造化回答にしています。

---

## ディレクトリ構成

```
src/
  config.js              # サービス名・コピー（名称変更はここだけ）
  App.jsx                # ルーティング＋モバイルシェル
  main.jsx               # エントリ（BrowserRouter）
  index.css              # Tailwind＋デザイントークン（@theme）
  components/
    Header.jsx           # 戻る付きヘッダー（PCではページタイトル）
    BottomNav.jsx        # 下部タブナビ（スマホ・タブレット）
    SiteHeader.jsx       # 上部ナビ（PC）
    SiteFooter.jsx       # フッター（PC）
    AdviceCard.jsx       # AI回答セクションのカード（tone切替）
    StoryCard.jsx        # 体験談カード
    CopyableLine.jsx     # コピー可能な「返し方」
    Tag.jsx              # 関係性・テーマタグ
    ScrollToTop.jsx      # 画面遷移時にページ最上部へスクロール
    intake/              # 相談フォーム部品（StepProgress / ChoiceGroup / SelectField / FormField / ImmersionSlider / IntakeSummary / DesiredSupportCard）
  pages/                 # 上記7画面
  data/
    mockAdvice.js        # AI回答モック＋getAdvice()
    consultationIntake.js # 相談フォームの選択肢・初期値・buildAdviceRequest()
    mockStories.js       # 体験談モック＋getStories()/getStory()/getStoryById()
```

---

## プロダクト思想（UI・文章で徹底）

- 相手の心理状態を**断定・診断しない**
- 相手を「陰謀論者」と**ラベリングしない**
- 相手を必ず変えられると**約束しない**
- 危険な状況では**利用者自身の安全を最優先**
- 暗い・攻撃的・監視的でなく、安心感・やさしさ・信頼感のあるデザイン

---

## ブランド

- サービス名：**Yorido**（英字表記は常にこの形。`src/config.js` で一括管理）
- ベース：白（補助背景にごく薄いアイボリー `#faf8f5`）
- アクセント：淡いオレンジ **`#ffb37c`**（`brand`）。CTA・選択中・active ナビ・ステップ表示に使用
- 派生色（`src/index.css` の `@theme`）
  - `brand-50 / 100 / 200`：薄い背景・罫線・hover
  - `brand-400`：CTA の hover
  - `brand-600`：アイコン・フォーカス枠（白背景で 3:1 以上）
  - `brand-700`：オレンジ系の文字（白背景で 4.5:1 以上）
  - `brand-ink`：`#ffb37c` の上に載せる文字（7.3:1。白文字は使わない）
- 状態色はブランド色と分ける：注意＝ローズ（`notice`）、安全・案内＝ブルー（`calm`）、完了＝グリーン（`success`）

---

## 現在モックになっている部分

- **AI回答**：`src/data/mockAdvice.js` の固定データ。`getAdvice()` は擬似ローディングのみ。
- **体験談データ**：`src/data/mockStories.js` の固定12件。投稿は保存されず完了画面に遷移するだけ。
- **共感 / 役に立った / いいね**：ローカル state のみ（永続化なし）。
- **一覧のフィルタチップ**：見た目のみ（絞り込み未実装）。
- **マイページ**：全体がダミー。認証・履歴なし。
- **相談窓口情報**：本番実装時に実データを掲載予定。

---

## 本番化するときの次の3ステップ

1. **LLM API 接続**：`src/data/mockAdvice.js` の `getAdvice(request)` を
   OpenAI / Anthropic 等の呼び出しに置き換える。`request` は相談フォームの
   `buildAdviceRequest()`（`src/data/consultationIntake.js`）の戻り値。返却JSONを `mockAdvice` と同じ構造に
   させるようプロンプト設計すれば UI は無改修。安全・非断定・ラベリング禁止を
   システムプロンプトに明記する。
2. **DB 接続**：`src/data/mockStories.js` の `getStories()` / `getStory()` /
   投稿処理を Supabase / Firebase 等に差し替え。体験談の CRUD と共感数を永続化。
   投稿には不適切内容フィルタ（実在の個人・団体攻撃の排除）を挟む。
3. **認証**：匿名利用を基本にしつつ、保存・投稿履歴のために任意ログイン
   （Supabase Auth 等）を追加。マイページを実データ化し、相談窓口情報を掲載する。
