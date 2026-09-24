# CreatorFun - On-chain Launch Rules

**English** | [한국어](docs/README.ko.md) | [中文](docs/README.zh.md) | [日本語](docs/README.ja.md)

Every token launched on [creatorfun.cloud](https://creatorfun.cloud) through the Meteora path uses **one on-chain config** on Solana.
That config was created once and **cannot be changed by anyone, including CreatorFun**.
This repository contains the exact code that created it and a script that lets anyone verify it without trusting us.

## The rules

| Rule | Value |
|---|---|
| Buy / sell fee | **1.25%**, flat, same for every trade |
| Creator share | **0.80%** of volume |
| CreatorFun platform share | **0.20%** of volume |
| Meteora protocol share | **0.25%** of volume |
| Launch cost | **Free** (platform fee 0 SOL; only Solana network rent) |
| Supply | 1,000,000,000 tokens, 6 decimals, **fixed** (no minting) |
| Token metadata | **Immutable** |
| Team / insider allocation | **None** (no vesting, no reserved supply) |
| Graduation | at **85 SOL** raised, to a Meteora DAMM v2 pool |
| After graduation | 1% pool fee; LP **100% permanently locked** (creator 80%, platform 20%) |

### How the 1.25% is split

Meteora's Dynamic Bonding Curve program always takes 20% of the trading fee as its protocol share.
The remaining 80% is split by this config: 80% to the creator, 20% to CreatorFun.

~~
1.25% x 20%             = 0.25%  Meteora (protocol)
1.25% x 80% x 80%       = 0.80%  Creator
1.25% x 80% x 20%       = 0.20%  CreatorFun
~~

**Referral note:** Meteora gives 20% of its own protocol share to a referral account if a trade includes one.
The CreatorFun website may set CreatorFun's fee wallet as the referrer, so on those trades
Meteora receives 0.20% and CreatorFun receives an extra 0.05%. The price you pay (1.25%) and the creator share (0.80%) never change.

### Compared with pump.fun (as of September 2026)

| | pump.fun | CreatorFun |
|---|---|---|
| Buy / sell fee | 1.25% | 1.25% |
| Creator share | 0.30% | **0.80%** |
| Platform share | 0.95% | 0.20% |
| Infrastructure (Meteora) | - | 0.25% |

pump.fun figures from [pump.fun/docs/fees](https://pump.fun/docs/fees); they may change at any time.

## On-chain addresses

| | Address |
|---|---|
| CreatorFun config | [`GRFxBcjZEcjMV8qAMsdiGu43gmqr8WgyyPJh1w3inBPo`](https://solscan.io/account/GRFxBcjZEcjMV8qAMsdiGu43gmqr8WgyyPJh1w3inBPo) |
| Creation transaction | [`5RPCVMvY...V5Uq4g`](https://solscan.io/tx/5RPCVMvYmYDrxHozf2dnTRLxDCRjF1WZhGSqpizwQ5yfkFfaaadJALLEWuw9gsDeYbc1RezNDoWF5GUAW1V5Uq4g) |
| Platform fee wallet | [`CooB38vtmMP4oLcSsLsmUn1YfLELG7NkfPXYTv21NcBx`](https://solscan.io/account/CooB38vtmMP4oLcSsLsmUn1YfLELG7NkfPXYTv21NcBx) |

## Verify it yourself

Requires Node.js 18+. No wallet or private key needed.

~~bash
git clone https://github.com/creatorfuncloud/creatorfun-config.git
cd creatorfun-config
npm install
npm run verify
~~

The script reads the config account directly from Solana, confirms it is owned by the Meteora DBC program, and checks all 20 rules:

~~
PASS  Trading fee 1.25% (12500000 / 1e9)
PASS  Creator gets 80% of trading fees (after Meteora share)
PASS  Creator LP 80% permanently locked
PASS  Fixed supply (no minting)
...
20/20 checks passed
RESULT: ALL CHECKS PASSED
~~

To check that a specific token was launched with this config, pass its mint address:

~~bash
npm run verify -- <TOKEN_MINT_ADDRESS>
~~

You can use your own RPC with `RPC_URL=<url> npm run verify`.

## What cannot change, and what can

**Cannot change (enforced on-chain):**
- Every value in the table above, for every token launched with this config.
- Locked LP after graduation cannot be withdrawn by the creator or by CreatorFun.

**Can change (off-chain, so we state it openly):**
- The CreatorFun website and its features.
- Tokens launched with the optional **pump.fun** path do **not** use this config. They follow pump.fun's own rules and fees.
- The Meteora DBC program itself is operated by Meteora and follows Meteora's own upgrade policy.

## Repository contents

| File | Purpose |
|---|---|
| `scripts/create-config.js` | The exact script that created the config (run once, on 2026-09-24) |
| `scripts/verify-config.js` | Public verification script |
| `deployments/mainnet-config.json` | Creation record: address, transaction, rules, and the on-chain state read back right after creation |
| `package.json` / `package-lock.json` | Exact dependency versions used, including `@meteora-ag/dynamic-bonding-curve-sdk@1.5.13` |

`npm audit` reports advisories in transitive dependencies of the Solana / Meteora SDKs.
They do not affect this repository, which only reads public chain data (verify) or was run once by the operator (create).

## Risk notice

Memecoins are highly volatile and most lose value. Fixed on-chain rules protect you from fee changes, hidden minting and LP removal,
but they do not protect you from market risk. Nothing here is investment advice.

## License

[MIT](LICENSE)
