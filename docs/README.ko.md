# CreatorFun - 온체인 런칭 규칙

[English](../README.md) | **한국어** | [中文](README.zh.md) | [日本語](README.ja.md)

[creatorfun.cloud](https://creatorfun.cloud)에서 Meteora 방식으로 런칭되는 모든 토큰은 솔라나 위의 **단 하나의 온체인 config**를 사용합니다.
이 config는 한 번 생성되었으며 **CreatorFun을 포함한 누구도 변경할 수 없습니다.**
이 저장소에는 config를 생성한 실제 코드와, 저희를 믿지 않아도 누구나 직접 검증할 수 있는 스크립트가 들어 있습니다.

## 규칙

| 항목 | 값 |
|---|---|
| 매수·매도 수수료 | **1.25%**, 고정, 모든 거래 동일 |
| 크리에이터 몫 | 거래금액의 **0.80%** |
| CreatorFun 플랫폼 몫 | 거래금액의 **0.20%** |
| Meteora 프로토콜 몫 | 거래금액의 **0.25%** |
| 런칭 비용 | **무료** (플랫폼 수수료 0 SOL, 솔라나 네트워크 기본 비용만 발생) |
| 발행량 | 10억 개, 소수점 6자리, **고정** (추가 발행 불가) |
| 토큰 메타데이터 | **변경 불가** |
| 팀·내부자 물량 | **없음** (베스팅 없음, 예약 물량 없음) |
| 졸업 | **85 SOL** 모이면 Meteora DAMM v2 풀로 이전 |
| 졸업 후 | 풀 수수료 1%, LP **100% 영구 잠금** (크리에이터 80%, 플랫폼 20%) |

### 1.25%는 이렇게 나뉩니다

Meteora Dynamic Bonding Curve 프로그램은 거래 수수료의 20%를 프로토콜 몫으로 항상 가져갑니다.
나머지 80%를 이 config에 따라 크리에이터 80%, CreatorFun 20%로 나눕니다.

~~
1.25% x 20%             = 0.25%  Meteora (프로토콜)
1.25% x 80% x 80%       = 0.80%  크리에이터
1.25% x 80% x 20%       = 0.20%  CreatorFun
~~

**레퍼럴 안내:** 거래에 레퍼럴 계정이 포함되면 Meteora는 자신의 프로토콜 몫 중 20%를 그 계정에 줍니다.
CreatorFun 웹사이트는 CreatorFun 수수료 지갑을 레퍼럴로 설정할 수 있으며, 이 경우 해당 거래에서
Meteora는 0.20%, CreatorFun은 추가로 0.05%를 받습니다. 사용자가 내는 수수료(1.25%)와 크리에이터 몫(0.80%)은 절대 바뀌지 않습니다.

### 펌프펀과 비교 (2026년 9월 기준)

| | 펌프펀 | CreatorFun |
|---|---|---|
| 매수·매도 수수료 | 1.25% | 1.25% |
| 크리에이터 몫 | 0.30% | **0.80%** |
| 플랫폼 몫 | 0.95% | 0.20% |
| 인프라 (Meteora) | - | 0.25% |

펌프펀 수치 출처: [pump.fun/docs/fees](https://pump.fun/docs/fees) (언제든 변경될 수 있음)

## 온체인 주소

| | 주소 |
|---|---|
| CreatorFun config | [`GRFxBcjZEcjMV8qAMsdiGu43gmqr8WgyyPJh1w3inBPo`](https://solscan.io/account/GRFxBcjZEcjMV8qAMsdiGu43gmqr8WgyyPJh1w3inBPo) |
| 생성 트랜잭션 | [`5RPCVMvY...V5Uq4g`](https://solscan.io/tx/5RPCVMvYmYDrxHozf2dnTRLxDCRjF1WZhGSqpizwQ5yfkFfaaadJALLEWuw9gsDeYbc1RezNDoWF5GUAW1V5Uq4g) |
| 플랫폼 수수료 지갑 | [`CooB38vtmMP4oLcSsLsmUn1YfLELG7NkfPXYTv21NcBx`](https://solscan.io/account/CooB38vtmMP4oLcSsLsmUn1YfLELG7NkfPXYTv21NcBx) |

## 직접 검증하기

Node.js 18 이상이 필요합니다. 지갑이나 개인키는 필요 없습니다.

~~bash
git clone https://github.com/creatorfuncloud/creatorfun-config.git
cd creatorfun-config
npm install
npm run verify
~~

스크립트는 솔라나에서 config 계정을 직접 읽어, Meteora DBC 프로그램 소유인지 확인하고 20개 규칙을 전부 검사합니다:

~~
PASS  Trading fee 1.25% (12500000 / 1e9)
PASS  Creator gets 80% of trading fees (after Meteora share)
PASS  Creator LP 80% permanently locked
PASS  Fixed supply (no minting)
...
20/20 checks passed
RESULT: ALL CHECKS PASSED
~~

특정 토큰이 이 config로 런칭되었는지 확인하려면 토큰 주소를 넣으세요:

~~bash
npm run verify -- <토큰_민트_주소>
~~

직접 운영하는 RPC를 쓰려면 `RPC_URL=<주소> npm run verify`로 실행하세요.

## 바뀔 수 없는 것과 바뀔 수 있는 것

**바뀔 수 없는 것 (온체인에서 강제됨):**
- 위 표의 모든 값. 이 config로 런칭된 모든 토큰에 적용됩니다.
- 졸업 후 잠긴 LP는 크리에이터도 CreatorFun도 인출할 수 없습니다.

**바뀔 수 있는 것 (온체인 밖의 영역이므로 미리 밝힙니다):**
- CreatorFun 웹사이트와 기능.
- 선택 옵션인 **펌프펀 런칭**으로 만든 토큰은 이 config를 **사용하지 않습니다.** 펌프펀 자체 규칙과 수수료를 따릅니다.
- Meteora DBC 프로그램 자체는 Meteora가 운영하며 Meteora의 업그레이드 정책을 따릅니다.

## 저장소 구성

| 파일 | 용도 |
|---|---|
| `scripts/create-config.js` | config를 생성한 실제 스크립트 (2026-09-24 1회 실행) |
| `scripts/verify-config.js` | 공개 검증 스크립트 |
| `deployments/mainnet-config.json` | 생성 기록: 주소, 트랜잭션, 규칙, 생성 직후 읽어온 온체인 상태 |
| `package.json` / `package-lock.json` | 실제 사용한 패키지 버전 (`@meteora-ag/dynamic-bonding-curve-sdk@1.5.13` 포함) |

`npm audit`는 Solana / Meteora SDK 내부 의존성의 권고 사항을 표시합니다.
이 저장소는 공개된 체인 데이터를 읽기만 하거나(검증) 운영자가 1회 실행한 것(생성)이므로 영향을 받지 않습니다.

## 위험 고지

밈코인은 변동성이 매우 크며 대부분 가치를 잃습니다. 고정된 온체인 규칙은 수수료 변경, 숨겨진 추가 발행, LP 인출로부터 사용자를 보호하지만
시장 위험까지 막아주지는 않습니다. 이 문서의 어떤 내용도 투자 조언이 아닙니다.

## 라이선스

[MIT](../LICENSE)
