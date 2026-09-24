/**
 * CreatorFun - verify the on-chain Meteora DBC config (and any CreatorFun token)
 *
 * Reads accounts directly from Solana and checks every public rule.
 * No private key needed. Anyone can run it:
 *
 *   npm install
 *   npm run verify                      -> verify the platform config
 *   npm run verify -- <TOKEN_MINT>      -> also verify a token launched on CreatorFun
 *
 * Optional: RPC_URL=<your mainnet RPC> npm run verify
 */
const path = require('path');
const { Connection, PublicKey } = require('@solana/web3.js');
const {
  DynamicBondingCurveClient, DYNAMIC_BONDING_CURVE_PROGRAM_ID,
} = require('@meteora-ag/dynamic-bonding-curve-sdk');

const deployment = require(path.join(__dirname, '..', 'deployments', 'mainnet-config.json'));
const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const WSOL = 'So11111111111111111111111111111111111111112';
const s = (v) => (v === undefined || v === null ? String(v) : v.toBase58 ? v.toBase58() : v.toString());

function report(title, checks) {
  console.log(`\n== ${title} ==`);
  let failed = 0;
  for (const [name, actual, expected] of checks) {
    const ok = actual === expected;
    if (!ok) failed++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  (expected ${expected}, got ${actual})`}`);
  }
  console.log(`${checks.length - failed}/${checks.length} checks passed`);
  return failed;
}

async function verifyConfig(connection, client, configKey) {
  const account = await connection.getAccountInfo(configKey);
  if (!account) throw new Error('Config account not found on-chain');
  const c = await client.state.getPoolConfig(configKey);

  return report(`Platform config ${configKey.toBase58()}`, [
    ['Owned by Meteora DBC program', s(account.owner), s(DYNAMIC_BONDING_CURVE_PROGRAM_ID)],
    ['Quote token is SOL', s(c.quoteMint), WSOL],
    ['Trading fee 1.25% (12500000 / 1e9)', s(c.poolFees.baseFee.cliffFeeNumerator), '12500000'],
    ['Fee is flat (no schedule)', `${s(c.poolFees.baseFee.firstFactor)}/${s(c.poolFees.baseFee.secondFactor)}/${s(c.poolFees.baseFee.thirdFactor)}`, '0/0/0'],
    ['No dynamic fee', s(c.poolFees.dynamicFee.initialized), '0'],
    ['Fees collected in SOL', s(c.collectFeeMode), '0'],
    ['Creator gets 80% of trading fees (after Meteora share)', s(c.creatorTradingFeePercentage), '80'],
    ['Platform fee wallet', s(c.feeClaimer), deployment.feeClaimer],
    ['Launch is free', s(c.poolCreationFee), '0'],
    ['Graduates at 85 SOL', s(c.migrationQuoteThreshold), '85000000000'],
    ['Graduates to Meteora DAMM v2', s(c.migrationOption), '1'],
    ['Post-graduation pool fee 1%', s(c.migrationFeeOption), '2'],
    ['No migration fee taken', `${s(c.migrationFeePercentage)}/${s(c.creatorMigrationFeePercentage)}`, '0/0'],
    ['Creator LP 80% permanently locked', s(c.creatorPermanentLockedLiquidityPercentage), '80'],
    ['Platform LP 20% permanently locked', s(c.partnerPermanentLockedLiquidityPercentage), '20'],
    ['No unlocked LP for anyone', `${s(c.creatorLiquidityPercentage)}/${s(c.partnerLiquidityPercentage)}`, '0/0'],
    ['No team token vesting', `${s(c.lockedVestingConfig.amountPerPeriod)}/${s(c.lockedVestingConfig.cliffUnlockAmount)}`, '0/0'],
    ['Token metadata immutable', s(c.tokenUpdateAuthority), '1'],
    ['Fixed supply (no minting)', s(c.fixedTokenSupplyFlag), '1'],
    ['Supply 1,000,000,000 (6 decimals)', `${s(c.preMigrationTokenSupply)}/${s(c.postMigrationTokenSupply)}`, '1000000000000000/1000000000000000'],
  ]);
}

async function verifyToken(connection, client, mintKey, configKey) {
  const found = await client.state.getPoolByBaseMint(mintKey);
  const pool = found && (found.account || found);
  const mintInfo = await connection.getParsedAccountInfo(mintKey);
  const mint = mintInfo.value && mintInfo.value.data && mintInfo.value.data.parsed
    ? mintInfo.value.data.parsed.info : {};

  return report(`Token ${mintKey.toBase58()}`, [
    ['Launched on a Meteora DBC pool', pool ? 'yes' : 'no', 'yes'],
    ['Pool uses the CreatorFun config', pool ? s(pool.config) : 'none', configKey.toBase58()],
    ['Mint authority revoked', String(mint.mintAuthority), 'null'],
    ['Freeze authority revoked', String(mint.freezeAuthority), 'null'],
  ]);
}

async function main() {
  const connection = new Connection(RPC_URL, 'confirmed');
  const client = new DynamicBondingCurveClient(connection, 'confirmed');
  const configKey = new PublicKey(deployment.config);
  const mintArg = process.argv[2];

  console.log('RPC:', RPC_URL);
  let failed = await verifyConfig(connection, client, configKey);
  if (mintArg) failed += await verifyToken(connection, client, new PublicKey(mintArg), configKey);

  console.log(failed ? '\nRESULT: FAILED' : '\nRESULT: ALL CHECKS PASSED');
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
