---
name: start-issue
description: Issue に着手するときの入り口。Issue からブランチを生やして checkout し、担当とボードの状態を合わせる。「#12 やる」「Issue に着手する」「次の作業を始める」「何から手を付ける？」と言われたときに使う。
---

# Issue に着手する

作業は必ず Issue から始める。**Issue を持たない変更はボードに乗らず、他の3人から見えなくなる。**

このスキルは「これから作る」ときのもの。できあがって PR を出す段は `pr` スキル。

## 1. 何をやるか決める

指示がなければ、ボードの `Todo` から誰も持っていないものを上から取る。

```bash
gh issue list --state open --search 'no:assignee sort:created-asc' --limit 20
```

期限が近いものだけ見たいとき:

```bash
gh issue list --state open --milestone 'プロトタイプ完成'
```

取る前に Issue の本文を読む。**「完了条件」が書かれていない Issue は、着手前に何をもって終わりとするかをユーザーに確認する。**
ハッカソン中は「どこまでやるか」の合意が無いまま作り込むのが一番時間を溶かす。

## 2. Issue からブランチを生やす

```bash
gh issue develop <番号> --name <type>/<番号>-<英語の短い要約> --base main --checkout
```

例:

```bash
gh issue develop 12 --name feat/12-story-filter --base main --checkout
```

**`git switch -c` で自分で切らない。** `gh issue develop` は Issue の Development 欄にブランチを登録する。
これがあると、そのブランチから出した PR が**自動で Issue に紐づき、マージで Issue が閉じる**。
自分で切ったブランチにはこの紐づけが無く、後から付け直す手段もない。

- 番号を先頭に入れるのは、`link-issue` ワークフローがブランチ名から番号を拾って
  PR 本文に `Closes #12` を自動で入れるため。番号が無いと自動化が効かない
- type は `feat` `fix` `docs` `chore` `refactor` のいずれか
- 要約は英語・小文字・ハイフン区切りで2〜3語

すでに `git switch -c` で切ってしまっていた場合は、**切り直すのが速い**（コミット前ならそのまま移せる）。
どうしても今のブランチで続けるなら、PR 本文に手で `Closes #12` と書けば紐づけ自体はできる。

## 3. 着手を宣言する

```bash
gh issue edit <番号> --add-assignee @me
```

そのうえで [ボード](https://github.com/orgs/yuai-project/projects/1) のカードを **`In Progress` に動かす**。
ドラッグで済むが、CLI からやるなら:

```bash
ITEM=$(gh project item-list 1 --owner yuai-project --format json \
  | python3 -c "import json,sys,os;print(next(i['id'] for i in json.load(sys.stdin)['items'] if i.get('content',{}).get('number')==int(os.environ['N'])))" )
gh project item-edit --id "$ITEM" \
  --project-id PVT_kwDOE5FHFM4BjRck \
  --field-id PVTSSF_lADOE5FHFM4BjRckzhiGaHw \
  --single-select-option-id eb6d667f    # In Progress
```

（`N=12` のように環境変数で Issue 番号を渡す）

**assign とカード移動を飛ばさない。** 4人が並行で動くので、これが無いと同じ Issue を2人が触る。

## 4. 手元を整える

```bash
npm install    # package.json が変わっている可能性があるので一度は流す
npm run dev
```

## 5. 作業中に忘れないこと

- **小さく出す。** 1 Issue = 1 PR。途中で別の問題を見つけたら、直さずに新しい Issue を立てる
- 利用者の目に触れる日本語を足す・変えるときは `tone-check` スキルを通す。
  [CLAUDE.md](../../../CLAUDE.md) の「絶対に守るルール」7項目はこのプロダクトの価値そのもの
- 色・余白・角丸は直値ではなく `src/index.css` の `@theme` トークンを使う
- API 差し替えの境界は `src/data/*`。UI から直接 fetch を書かない

## 6. できたら

`pr` スキルに引き渡す。ブランチはもう Issue に紐づいているので、`pr` 側でブランチを切り直す必要はない。
