# CreatorFun - 链上发行规则

[English](../README.md) | [한국어](README.ko.md) | **中文** | [日本語](README.ja.md)

在 [creatorfun.cloud](https://creatorfun.cloud) 通过 Meteora 方式发行的所有代币，都使用 Solana 上的**同一个链上 config**。
该 config 仅创建一次，**任何人（包括 CreatorFun）都无法修改**。
本仓库包含创建该 config 的原始代码，以及任何人无需信任我们即可自行验证的脚本。

## 规则

| 项目 | 数值 |
|---|---|
| 买入 / 卖出手续费 | **1.25%**，固定，所有交易相同 |
| 创作者分成 | 交易额的 **0.80%** |
| CreatorFun 平台分成 | 交易额的 **0.20%** |
| Meteora 协议分成 | 交易额的 **0.25%** |
| 发行费用 | **免费**（平台费 0 SOL，仅需 Solana 网络租金） |
| 总供应量 | 10 亿枚，6 位小数，**固定**（不可增发） |
| 代币元数据 | **不可修改** |
| 团队 / 内部分配 | **无**（无锁仓释放，无预留份额） |
| 毕业 | 募集 **85 SOL** 后迁移至 Meteora DAMM v2 池 |
| 毕业后 | 池手续费 1%；LP **100% 永久锁定**（创作者 80%，平台 20%） |

### 1.25% 如何分配

Meteora Dynamic Bonding Curve 程序始终收取交易手续费的 20% 作为协议分成。
剩余 80% 按本 config 分配：创作者 80%，CreatorFun 20%。

~~
1.25% x 20%             = 0.25%  Meteora（协议）
1.25% x 80% x 80%       = 0.80%  创作者
1.25% x 80% x 20%       = 0.20%  CreatorFun
~~

**推荐说明：** 若交易中包含推荐账户，Meteora 会将其协议分成的 20% 给予该账户。
CreatorFun 网站可能将 CreatorFun 手续费钱包设为推荐人，此时该笔交易中
Meteora 获得 0.20%，CreatorFun 额外获得 0.05%。用户支付的手续费（1.25%）和创作者分成（0.80%）永不改变。

### 与 pump.fun 对比（截至 2026 年 9 月）

| | pump.fun | CreatorFun |
|---|---|---|
| 买入 / 卖出手续费 | 1.25% | 1.25% |
| 创作者分成 | 0.30% | **0.80%** |
| 平台分成 | 0.95% | 0.20% |
| 基础设施（Meteora） | - | 0.25% |

pump.fun 数据来源：[pump.fun/docs/fees](https://pump.fun/docs/fees)（可能随时变更）

## 链上地址

| | 地址 |
|---|---|
| CreatorFun config | [`GRFxBcjZEcjMV8qAMsdiGu43gmqr8WgyyPJh1w3inBPo`](https://solscan.io/account/GRFxBcjZEcjMV8qAMsdiGu43gmqr8WgyyPJh1w3inBPo) |
| 创建交易 | [`5RPCVMvY...V5Uq4g`](https://solscan.io/tx/5RPCVMvYmYDrxHozf2dnTRLxDCRjF1WZhGSqpizwQ5yfkFfaaadJALLEWuw9gsDeYbc1RezNDoWF5GUAW1V5Uq4g) |
| 平台手续费钱包 | [`CooB38vtmMP4oLcSsLsmUn1YfLELG7NkfPXYTv21NcBx`](https://solscan.io/account/CooB38vtmMP4oLcSsLsmUn1YfLELG7NkfPXYTv21NcBx) |

## 自行验证

需要 Node.js 18 及以上版本。无需钱包或私钥。

~~bash
git clone https://github.com/creatorfuncloud/creatorfun-config.git
cd creatorfun-config
npm install
npm run verify
~~

脚本直接从 Solana 读取 config 账户，确认其归属于 Meteora DBC 程序，并检查全部 20 条规则：

~~
PASS  Trading fee 1.25% (12500000 / 1e9)
PASS  Creator gets 80% of trading fees (after Meteora share)
PASS  Creator LP 80% permanently locked
PASS  Fixed supply (no minting)
...
20/20 checks passed
RESULT: ALL CHECKS PASSED
~~

如需确认某个代币是否使用本 config 发行，请传入其 mint 地址：

~~bash
npm run verify -- <代币_MINT_地址>
~~

如需使用自己的 RPC：`RPC_URL=<地址> npm run verify`

## 不可更改与可更改的内容

**不可更改（由链上强制执行）：**
- 上表中的所有数值，适用于使用本 config 发行的所有代币。
- 毕业后锁定的 LP，创作者和 CreatorFun 均无法提取。

**可更改（属于链下部分，因此提前公开说明）：**
- CreatorFun 网站及其功能。
- 通过可选的 **pump.fun** 方式发行的代币**不使用**本 config，遵循 pump.fun 自身的规则和费用。
- Meteora DBC 程序本身由 Meteora 运营，遵循 Meteora 的升级政策。

## 仓库内容

| 文件 | 用途 |
|---|---|
| `scripts/create-config.js` | 创建 config 的原始脚本（2026-09-24 执行一次） |
| `scripts/verify-config.js` | 公开验证脚本 |
| `deployments/mainnet-config.json` | 创建记录：地址、交易、规则及创建后立即读取的链上状态 |
| `package.json` / `package-lock.json` | 实际使用的依赖版本（含 `@meteora-ag/dynamic-bonding-curve-sdk@1.5.13`） |

`npm audit` 会显示 Solana / Meteora SDK 间接依赖中的安全提示。
本仓库仅读取公开链上数据（验证）或由运营方执行一次（创建），因此不受影响。

## 风险提示

Meme 币波动极大，大多数最终会贬值。固定的链上规则可防止手续费变更、隐藏增发和 LP 撤出，
但无法防范市场风险。本文任何内容均不构成投资建议。

## 许可证

[MIT](../LICENSE)
