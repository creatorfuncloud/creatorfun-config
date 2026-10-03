# CreatorFun - オンチェーン・ローンチルール

[English](../README.md) | [한국어](README.ko.md) | [中文](README.zh.md) | **日本語**

[creatorfun.cloud](https://creatorfun.cloud) で Meteora 方式によりローンチされるすべてのトークンは、Solana 上の **CreatorFun オンチェーン config** を使用します。
config は 2 つあり、**ルールはまったく同じ**です（[2 つの config、同じルール](#2-つの-config同じルール)を参照）。各 config は一度だけ作成され、**CreatorFun を含め誰も変更できません。**
このリポジトリには、config を作成した実際のコードと、私たちを信頼しなくても誰でも検証できるスクリプトが含まれています。

## ルール

| 項目 | 値 |
|---|---|
| 売買手数料 | **1.25%**、固定、すべての取引で同一 |
| クリエイター分配 | 取引額の **0.80%** |
| CreatorFun プラットフォーム分配 | 取引額の **0.20%** |
| Meteora プロトコル分配 | 取引額の **0.25%** |
| ローンチ費用 | **無料**（プラットフォーム手数料 0 SOL、Solana ネットワークのレントのみ） |
| 総供給量 | 10 億枚、小数点 6 桁、**固定**（追加発行不可） |
| トークンメタデータ | **変更不可** |
| チーム・内部者の割当 | **なし**（ベスティングなし、予約分なし） |
| 卒業 | **85 SOL** 集まると Meteora DAMM v2 プールへ移行 |
| 卒業後 | プール手数料 1%、LP **100% 永久ロック**（クリエイター 80%、プラットフォーム 20%） |

### 1.25% の分配方法

Meteora Dynamic Bonding Curve プログラムは、取引手数料の 20% を常にプロトコル分として受け取ります。
残りの 80% を本 config に従い、クリエイター 80%、CreatorFun 20% で分配します。

```
1.25% x 20%             = 0.25%  Meteora（プロトコル）
1.25% x 80% x 80%       = 0.80%  クリエイター
1.25% x 80% x 20%       = 0.20%  CreatorFun
```

**リファラルについて：** 取引にリファラルアカウントが含まれる場合、Meteora は自身のプロトコル分の 20% をそのアカウントに付与します。
CreatorFun のウェブサイトは CreatorFun の運営ウォレットをリファラーに設定しており、その取引では
Meteora が 0.20%、CreatorFun が追加で 0.05% を受け取ります。ユーザーが支払う手数料（1.25%）とクリエイター分配（0.80%）は決して変わりません。

### pump.fun との比較（2026 年 9 月時点）

| | pump.fun | CreatorFun |
|---|---|---|
| 売買手数料 | 1.25% | 1.25% |
| クリエイター分配 | 0.30% | **0.80%** |
| プラットフォーム分配 | 0.95% | 0.20% |
| インフラ（Meteora） | - | 0.25% |

pump.fun の数値の出典：[pump.fun/docs/fees](https://pump.fun/docs/fees)（随時変更される可能性があります）

## オンチェーンアドレス

| | アドレス |
|---|---|
| CreatorFun config v1（2026-10-03 まで） | [`GRFxBcjZEcjMV8qAMsdiGu43gmqr8WgyyPJh1w3inBPo`](https://solscan.io/account/GRFxBcjZEcjMV8qAMsdiGu43gmqr8WgyyPJh1w3inBPo) |
| v1 作成トランザクション | [`5RPCVMvY...V5Uq4g`](https://solscan.io/tx/5RPCVMvYmYDrxHozf2dnTRLxDCRjF1WZhGSqpizwQ5yfkFfaaadJALLEWuw9gsDeYbc1RezNDoWF5GUAW1V5Uq4g) |
| CreatorFun config v2（2026-10-04 から） | [`5wepwtpxdTErVNAn8PXq1J9fZZR3foBS3AssHLJPxkfY`](https://solscan.io/account/5wepwtpxdTErVNAn8PXq1J9fZZR3foBS3AssHLJPxkfY) |
| v2 作成トランザクション | [`aSqNcBPh...rkd7J7`](https://solscan.io/tx/aSqNcBPhcwMcumHR7grz9dzEYJjHTUq5t3GEV8fbnTLjj7ewtU9P1aBvUw6A5ytsHj8wUM6idQQqnPtCnkrd7J7) |
| プラットフォーム手数料ウォレット | [`CooB38vtmMP4oLcSsLsmUn1YfLELG7NkfPXYTv21NcBx`](https://solscan.io/account/CooB38vtmMP4oLcSsLsmUn1YfLELG7NkfPXYTv21NcBx) |
| 運営ウォレット（v2 手数料受取人） | [`5KQ2oGJbnsJiQ8GXZ1w7QCro2sYZfMEPsmvmLter4irF`](https://solscan.io/account/5KQ2oGJbnsJiQ8GXZ1w7QCro2sYZfMEPsmvmLter4irF) |

## 2 つの config、同じルール

| | v1 | v2 |
|---|---|---|
| 対象コイン | 2026-10-03 までにローンチされたコイン | 2026-10-04 以降にローンチされたコイン |
| 上表のすべてのルール | 同じ | 同じ |
| 手数料の受取人（プラットフォーム分 0.20% とプラットフォーム LP 手数料を受け取る） | プラットフォーム手数料ウォレット | 運営ウォレット（自動で受け取り） |
| 残余の受取人 | プラットフォーム手数料ウォレット | プラットフォーム手数料ウォレット |

違いは**どの CreatorFun ウォレットがプラットフォーム分を受け取るか**だけです。v2 では運営ウォレットがプラットフォーム分を自動で受け取り、卒業費用（満杯になったカーブをすぐに DAMM v2 プールへ移す費用）とバイバック keeper のネットワーク手数料を支払い、運営に必要な準備金を超えた分はプラットフォーム手数料ウォレットへ送ります。
トレーダーとクリエイターにとって変わることはありません。支払う手数料、クリエイターの 0.80%、LP ロックはすべて同じで、下の検証スクリプトが 2 つの config を項目ごとに検査します。

## 自分で検証する

Node.js 18 以上が必要です。ウォレットや秘密鍵は不要です。

```bash
git clone https://github.com/creatorfuncloud/creatorfun-config.git
cd creatorfun-config
npm install
npm run verify
```

スクリプトは Solana から config アカウントを直接読み取り、Meteora DBC プログラムの所有であることを確認し、2 つの config について 21 項目のルールをすべて検査します：

```
PASS  Trading fee 1.25% (12500000 / 1e9)
PASS  Creator gets 80% of trading fees (after Meteora share)
PASS  Creator LP 80% permanently locked
PASS  Fixed supply (no minting)
...
21/21 checks passed
RESULT: ALL CHECKS PASSED
```

特定のトークンがいずれかの config でローンチされたか確認するには、mint アドレスを指定します：

```bash
npm run verify -- <トークンの_MINT_アドレス>
```

独自の RPC を使う場合：`RPC_URL=<URL> npm run verify`

## 変更できないもの・変更できるもの

**変更できないもの（オンチェーンで強制）：**
- 上表のすべての値。いずれの config でローンチされたトークンにも適用されます。
- 卒業後にロックされた LP は、クリエイターも CreatorFun も引き出せません。

**変更できるもの（オフチェーンのため、あらかじめ明示します）：**
- CreatorFun のウェブサイトとその機能。
- オプションの **pump.fun** ローンチで作成されたトークンは本 config を**使用しません**。pump.fun 独自のルールと手数料に従います。
- Meteora DBC プログラム自体は Meteora が運営しており、Meteora のアップグレード方針に従います。

## リポジトリの内容

| ファイル | 用途 |
|---|---|
| `scripts/create-config.js` | config を作成した実際のスクリプト（2026-09-24 に 1 回実行） |
| `scripts/create-config-v2.js` | v2 config を作成した実際のスクリプト（2026-10-03 UTC に 1 回実行） |
| `scripts/verify-config.js` | 公開検証スクリプト |
| `deployments/mainnet-config.json` | 作成記録：アドレス、トランザクション、ルール、作成直後に読み取ったオンチェーン状態 |
| `deployments/mainnet-config-v2.json` | v2 作成記録（オンチェーン状態は手数料受取人以外 v1 と同じ） |
| `package.json` / `package-lock.json` | 実際に使用した依存バージョン（`@meteora-ag/dynamic-bonding-curve-sdk@1.5.13` を含む） |

`npm audit` は Solana / Meteora SDK の間接依存に関する勧告を表示します。
本リポジトリは公開チェーンデータの読み取り（検証）または運営者による 1 回の実行（作成）のみのため、影響を受けません。

## リスクに関する注意

ミームコインは非常に変動が大きく、ほとんどが価値を失います。固定されたオンチェーンルールは手数料変更、隠れた追加発行、LP の引き出しからユーザーを守りますが、
市場リスクからは守りません。本書のいかなる内容も投資助言ではありません。

## ライセンス

[MIT](../LICENSE)
