---
name: pr
description: 作業を終えた変更をコミット・push し、規約に沿った Pull Request を作ってレビューに出す。「PR出して」「push して」「プルリク作って」と言われたとき、または main で作業してしまった変更を PR に移したいときに使う。着手時のブランチ作成は start-issue を使う。
---

# PR を作る

`main` は ruleset `Protect main` で保護されており、**誰も直 push できない**（admin も不可）。
変更は必ずこの手順で PR にする。

## 1. ブランチを確認する

**このスキルは作業の終わりに呼ばれる。ブランチを切るのは `start-issue` スキルの仕事。**

まず今いるブランチが Issue から生えているか確かめる:

```bash
git branch --show-current
gh issue develop --list <Issue番号>
```

`<type>/<Issue番号>-<要約>`（例 `feat/12-story-filter`）になっていれば、
`link-issue` ワークフローが PR 本文に `Closes #12` を自動で入れる。

### まだブランチを切っていない場合

`start-issue` スキルを先に使う。Issue から生やしたブランチでないと Issue に紐づかない。

### `main` 上で作業してしまった場合（事故の救済）

コミット前ならそのままブランチを切れば移せる。

```bash
git switch -c <type>/<Issue番号>-<短い英語の要約>
```

すでにコミットしてしまった場合は `git switch -c <branch>` してから `main` を戻す:

```bash
git branch -f main origin/main
```

この経路で切ったブランチは Issue の Development 欄に載らないが、
ブランチ名に Issue 番号が入っていれば `Closes` の自動付与は効く。

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

main は squash マージのみ許可で、squash コミットの件名は PR タイトルが使われる。
**このタイトルがそのまま履歴に残る**前提で書く。

### 本文

`.github/pull_request_template.md` の見出しを使う。埋める内容:

- **何を変えた？** — 1〜3行。レビュアーが最初に読む
- **なぜ** — なぜその変更が要るのか。`Closes #12` は `link-issue` ワークフローが
  ブランチ名から自動で埋めるので**手で書かなくてよい**。番号なしのブランチのときだけ手で書く
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

[ボード](https://github.com/orgs/yuai-project/projects/1)のカードは、
**Issue に PR が紐づいた時点で自動的に `In Review` へ動く**。
手順1でブランチが `<type>/<Issue番号>-<要約>` になっていれば、これは勝手に起きる。

動かないときだけ手で直す（ブランチ名に Issue 番号が無い PR は紐づかないので自動で動かない）:

```bash
ITEM=$(gh project item-list 1 --owner yuai-project --format json \
  | python3 -c "import json,sys,os;print(next(i['id'] for i in json.load(sys.stdin)['items'] if i.get('content',{}).get('number')==int(os.environ['N'])))" )
gh project item-edit --id "$ITEM" \
  --project-id PVT_kwDOE5FHFM4BjRck \
  --field-id PVTSSF_lADOE5FHFM4BjRckzhiGaHw \
  --single-select-option-id 37d39e1d    # In Review
```

（`N=<Issue番号>` を環境変数で渡す。ボード上でドラッグしても同じ）

PR には **approve が1件必須**。作成したら PR の URL をユーザーに伝え、
レビュー依頼が必要なことを一言添える。

CI（`CI` / `PR title lint` / `PR labeler` / `Link issue`）の結果が出るまで数十秒かかる。
失敗していたら直してから引き渡す。
