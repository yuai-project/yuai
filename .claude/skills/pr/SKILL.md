---
name: pr
description: 変更をブランチ・コミット・push し、規約に沿った Pull Request を作る。「PR出して」「push して」「プルリク作って」と言われたとき、または main で作業してしまった変更を PR に移したいときに使う。
---

# PR を作る

`main` は ruleset `Protect main` で保護されており、**誰も直 push できない**（admin も不可）。
変更は必ずこの手順で PR にする。

## 1. ブランチを用意する

`main` 上で作業してしまっていた場合も、コミット前ならそのままブランチを切れば移せる。

```bash
git switch -c <prefix>/<短い英語の要約>
```

prefix は変更の性質に合わせる: `feat/` `fix/` `docs/` `chore/` `refactor/`
例: `feat/story-filter` `fix/scroll-restore` `chore/add-skills`

すでにコミットしてしまった場合は `git switch -c <branch>` してから `main` を戻す:

```bash
git branch -f main origin/main
```

## 2. 変更内容を確認する

```bash
git status --short && git diff
```

**意図しないファイルが混ざっていないか必ず見る。** とくに `.env*`、`dist/`、`node_modules/`、
スクリーンショットの一時ファイル。このリポジトリは **public** なので、
API キーが1行でも入ったら即流出する。

## 3. lint と build を実際に通す

PR テンプレートのチェックボックスは、**実行して通ることを確認してから**埋める。
推測で埋めない。

```bash
npm run lint && npm run build
```

落ちたら直してから先に進む。CI は必須チェックになっていないのでマージ自体はできてしまうが、
壊れた main は全員を止める。

## 4. コミットする

Conventional Commits 形式。件名は日本語でよい。

```
<type>: <何をしたか>

<なぜそうしたか。1行で足りるなら省略可>
```

type は `feat` `fix` `docs` `chore` `refactor` `style` `test` `perf` `revert` のいずれか。

## 5. push する

```bash
git push -u origin <branch>
```

## 6. PR を作る

### タイトル

CI の `pr-title-lint` が次の正規表現で検証する。**落ちるとマージがブロックされる。**

```
^(feat|fix|docs|chore|refactor|style|test|perf|revert)(\([a-z0-9 _-]+\))?!?: .+
```

- OK: `feat: 体験談を関係性で絞り込めるようにする`
- OK: `fix(stories): 戻ると先頭にスクロールする`
- NG: `修正` / `update` / `Feat: xxx`（大文字）/ `feat:xxx`（コロン後にスペースなし）

scope を付けるなら小文字英数字・ハイフン・アンダースコア・スペースのみ。

main は squash マージのみ許可されているので、**このタイトルがそのまま履歴に残る**前提で書く。

### 本文

`.github/pull_request_template.md` の見出しを使う。埋める内容:

- **何を変えた？** — 1〜3行。レビュアーが最初に読む
- **なぜ** — 関連 Issue があれば `Closes #12` と書く（マージで自動クローズ）
- **動作確認** — 手順3で実際に通したものだけチェックを入れる
- **スクリーンショット** — **UI を変えた PR は必須**。手順7を参照
- **プロダクト思想チェック** — **文言を足した / 変えた PR のみ**。
  埋める前に `tone-check` スキルを実行して確認すること。惰性でチェックを入れない
- **レビューしてほしい点** — 自信がない箇所を正直に書くとレビューが速い

```bash
gh pr create --title "<タイトル>" --body "<本文>"
```

### ラベル

`area:` と `size:` はワークフローが自動で付ける。**手で付けるのは優先度と緊急度だけ。**

- `P0` 今すぐ。デモが壊れる / `P1` 今日中 / `P2` 余裕があれば
- `デモ必須` 発表に必要で落とせないもの

判断がつかないときはユーザーに聞く。

## 7. UI を変えた場合のスクリーンショット

このアプリは最大幅 430px のモバイルファースト。**PC 幅で確認しても意味がない。**

ブラウザツールで 375x812 程度にして該当画面を開き、スクショを撮って PR 本文に貼る。
before / after が並ぶと最もレビューしやすい。

## 8. 仕上げ

PR には **approve が1件必須**。作成したら PR の URL をユーザーに伝え、
レビュー依頼が必要なことを一言添える。

CI（`CI` / `PR title lint` / `PR labeler`）の結果が出るまで数十秒かかる。
失敗していたら直してから引き渡す。
