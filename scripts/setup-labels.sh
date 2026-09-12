#!/usr/bin/env bash
# ラベル定義をコードで管理するスクリプト。
#
#   ./scripts/setup-labels.sh            # 反映（既存ラベルは色・説明を上書き）
#   ./scripts/setup-labels.sh --dry-run  # 何が起きるか表示するだけ
#
# ラベルを増やしたくなったら下の配列を編集して PR を出し、マージ後にもう一度実行する。
set -euo pipefail

# リポジトリは git remote から自動判定する（Organization への移管後もそのまま動く）。
# 別リポジトリに流用したいときは REPO=owner/name ./scripts/setup-labels.sh で上書き。
REPO="${REPO:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}"
DRY_RUN=false
[ "${1:-}" = "--dry-run" ] && DRY_RUN=true

run() {
  if $DRY_RUN; then echo "  [dry-run] $*"; else "$@"; fi
}

# ---- 削除する GitHub デフォルトラベル -------------------------------------
# 使われていない／新しい体系と重複するもの。必要なものは下で作り直す。
OBSOLETE=(
  # GitHub デフォルト（新体系と重複／未使用）
  "bug"
  "documentation"
  "duplicate"
  "enhancement"
  "help wanted"
  "invalid"
  "question"
  "wontfix"
  "accessibility"
  # 旧・英語の種別ラベル（Issue テンプレを4本立てにしたので日本語の種別に統一）
  "type: feat"
  "type: fix"
  "type: refactor"
  "type: docs"
  "type: chore"
)

# ---- 作成するラベル  "名前|色|説明" ---------------------------------------
LABELS=(
  # 種別（Issue テンプレ4種に1:1で対応。Issue に必ず1つ付く）
  "モヤモヤ|D4C5F9|答えが出ていない・判断に迷っていること"
  "改善要望|FBCA04|既にあるものを直したい（バグ報告を含む）"
  "新機能|0E8A16|まだ無いものを作りたい"
  "その他|C5DEF5|タスク・調査・共有・決めたいこと"

  # 領域（PR は labeler が自動付与）
  "area: ui|BFD4F2|画面・コンポーネント・スタイル"
  "area: data|D4C5F9|モック/データ層・config"
  "area: infra|5319E7|ビルド・依存・lint 設定"
  "area: ci|1D76DB|GitHub Actions・スクリプト"
  "area: docs|C2E0C6|README・CLAUDE.md 等"

  # 規模（PR に自動付与）
  "size: XS|EDEDED|〜20行"
  "size: S|EDEDED|〜100行"
  "size: M|FEF2C0|〜300行"
  "size: L|F9D0C4|〜800行"
  "size: XL|E99695|800行超・分割を検討"

  # 優先度
  "P0|B60205|今すぐ。デモが壊れる"
  "P1|D93F0B|今日中にやる"
  "P2|FBCA04|余裕があれば"

  # 状態
  "status: blocked|000000|他の作業待ち・判断待ち"
  "status: 要相談|D876E3|チームで方針を決めたい"

  # 運用
  "memo|FEF2C0|未整形。AI が構造化 Issue に変換して自動クローズする"
  "good first issue|7057FF|初めての人向け"
  "デモ必須|E99695|発表に必要。落とせない"
  "ci-failure|B60205|CI が壊れている"
)

echo "== $REPO のラベルを整備します =="

echo
echo "-- 削除 --"
# gh label list の結果は取りこぼすことがあるので存在確認はせず、直接削除を試みる。
# 存在しない場合は 404 になるだけなので握りつぶす。
for name in "${OBSOLETE[@]}"; do
  if $DRY_RUN; then
    echo "  [dry-run] gh label delete \"$name\""
  elif gh label delete "$name" -R "$REPO" --yes 2>/dev/null; then
    echo "  削除: $name"
  else
    echo "  すでに無い: $name"
  fi
done

echo
echo "-- 作成 / 更新 --"
for entry in "${LABELS[@]}"; do
  IFS='|' read -r name color desc <<< "$entry"
  echo "  $name"
  # --force で既存ラベルの色・説明も上書きできる（＝定義ファイルが常に正）
  run gh label create "$name" -R "$REPO" --color "$color" --description "$desc" --force
done

echo
echo "完了。https://github.com/$REPO/labels で確認できます。"
