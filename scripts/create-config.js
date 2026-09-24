/**
 * CreatorFun - Meteora Dynamic Bonding Curve (DBC) platform config
 *
 * Creates the single on-chain DBC config used by every CreatorFun launch.
 * A DBC config is immutable once created: nobody, including CreatorFun,
 * can change the fees, fee split, graduation threshold or LP lock below.
 *
 * Usage:
 *   node scripts/create-config.js          -> simulate only (no SOL spent)
 *   node scripts/create-config.js --send   -> create on Solana mainnet (one time)
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bs58lib = require('bs58');
const bs58 = bs58lib.default || bs58lib;
const {
  Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, sendAndConfirmTransaction,
} = require('@solana/web3.js');
const {
  DynamicBondingCurveClient, buildCurve,
  TokenType, TokenDecimal, TokenAuthorityOption,
  BaseFeeMode, CollectFeeMode,
  MigrationOption, MigrationFeeOption, ActivationType,
} = require('@meteora-ag/dynamic-bonding-curve-sdk');

// ---------------------------------------------------------------------------
// PUBLIC RULES - fixed forever once the config is created on-chain
// ---------------------------------------------------------------------------
const RULES = Object.freeze({
  totalTokenSupply: 1_000_000_000,      // every token: 1B supply, 6 decimals
  tradingFeeBps: 125,                   // 1.25% per buy and sell (flat, no hidden tiers)
  // Meteora protocol takes 20% of the fee. Of the remaining 80%:
  creatorFeePercent: 80,                // creator 80%  -> 0.80% of volume
                                        // platform 20% -> 0.20% of volume
  migrationThresholdSol: 85,            // graduates to Meteora DAMM v2 at 85 SOL
  percentageSupplyOnMigration: 20,      // 20% of supply paired with SOL at graduation
  postMigrationPoolFee: MigrationFeeOption.FixedBps100, // 1% pool fee after graduation
  lp: {                                 // graduated LP: 100% permanently locked
    creatorPermanentLockedPercent: 80,
    platformPermanentLockedPercent: 20,
  },
  tokenAuthority: TokenAuthorityOption.Immutable, // no mint, no metadata changes
  poolCreationFeeSol: 0,                // launching is free
});

const WSOL = new PublicKey('So11111111111111111111111111111111111111112');
const DEPLOY_FILE = path.join(__dirname, '..', 'deployments', 'mainnet-config.json');
const SEND = process.argv.includes('--send');

function loadOperator() {
  const raw = (process.env.OPERATOR_PRIVATE_KEY || '').trim();
  if (!raw) throw new Error('OPERATOR_PRIVATE_KEY missing in .env');
  const secret = raw.startsWith('[') ? Uint8Array.from(JSON.parse(raw)) : bs58.decode(raw);
  return Keypair.fromSecretKey(secret);
}

// Convert BN / PublicKey values so on-chain state prints readably
function plain(v) {
  if (v === null || v === undefined) return v;
  if (v instanceof PublicKey) return v.toBase58();
  if (typeof v === 'object' && typeof v.toBase58 === 'function') return v.toBase58();
  if (typeof v === 'object' && v.constructor && v.constructor.name === 'BN') return v.toString();
  if (Array.isArray(v)) return v.map(plain);
  if (typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v)) if (!k.startsWith('padding')) o[k] = plain(v[k]);
    return o;
  }
  return v;
}

async function main() {
  if (SEND && fs.existsSync(DEPLOY_FILE)) {
    throw new Error('Config already created. See deployments/mainnet-config.json');
  }

  const connection = new Connection(process.env.RPC_URL, 'confirmed');
  const client = new DynamicBondingCurveClient(connection, 'confirmed');
  const payer = loadOperator();
  const feeWallet = new PublicKey(process.env.FEE_WALLET);
  const configKp = Keypair.generate();

  const balance = await connection.getBalance(payer.publicKey);
  console.log('Operator :', payer.publicKey.toBase58(), `(${balance / LAMPORTS_PER_SOL} SOL)`);
  console.log('Fee wallet:', feeWallet.toBase58());
  console.log('Config    :', configKp.publicKey.toBase58());
  if (balance < 0.03 * LAMPORTS_PER_SOL) throw new Error('Operator needs at least 0.03 SOL');

  const curve = buildCurve({
    token: {
      tokenType: TokenType.SPLToken,
      tokenBaseDecimal: TokenDecimal.SIX,
      tokenQuoteDecimal: 9,
      tokenAuthorityOption: RULES.tokenAuthority,
      totalTokenSupply: RULES.totalTokenSupply,
      leftover: 0,
    },
    fee: {
      baseFeeParams: {
        baseFeeMode: BaseFeeMode.FeeSchedulerLinear,
        feeSchedulerParam: {
          startingFeeBps: RULES.tradingFeeBps,
          endingFeeBps: RULES.tradingFeeBps,
          numberOfPeriod: 0,
          totalDuration: 0,
        },
      },
      dynamicFeeEnabled: false,
      collectFeeMode: CollectFeeMode.QuoteToken,   // fees collected in SOL
      creatorTradingFeePercentage: RULES.creatorFeePercent,
      poolCreationFee: RULES.poolCreationFeeSol,
      enableFirstSwapWithMinFee: false,
    },
    migration: {
      migrationOption: MigrationOption.MET_DAMM_V2,
      migrationFeeOption: RULES.postMigrationPoolFee,
      migrationFee: { feePercentage: 0, creatorFeePercentage: 0 },
    },
    liquidityDistribution: {
      partnerPermanentLockedLiquidityPercentage: RULES.lp.platformPermanentLockedPercent,
      partnerLiquidityPercentage: 0,
      creatorPermanentLockedLiquidityPercentage: RULES.lp.creatorPermanentLockedPercent,
      creatorLiquidityPercentage: 0,
    },
    lockedVesting: {
      totalLockedVestingAmount: 0,
      numberOfVestingPeriod: 0,
      cliffUnlockAmount: 0,
      totalVestingDuration: 0,
      cliffDurationFromMigrationTime: 0,
    },
    activationType: ActivationType.Timestamp,
    percentageSupplyOnMigration: RULES.percentageSupplyOnMigration,
    migrationQuoteThreshold: RULES.migrationThresholdSol,
  });

  const tx = await client.partner.createConfig({
    config: configKp.publicKey,
    feeClaimer: feeWallet,
    leftoverReceiver: feeWallet,
    quoteMint: WSOL,
    payer: payer.publicKey,
    ...curve,
  });

  if (!SEND) {
    const sim = await connection.simulateTransaction(tx, [payer, configKp]);
    if (sim.value.err) {
      console.log((sim.value.logs || []).join('\n'));
      throw new Error('Simulation failed: ' + JSON.stringify(sim.value.err));
    }
    console.log('\nSIMULATION OK - nothing was sent. Run with --send to create.');
    return;
  }

  const signature = await sendAndConfirmTransaction(connection, tx, [payer, configKp], {
    commitment: 'confirmed',
  });
  const onchain = await client.state.getPoolConfig(configKp.publicKey);

  const record = {
    network: 'mainnet-beta',
    config: configKp.publicKey.toBase58(),
    feeClaimer: feeWallet.toBase58(),
    createdBy: payer.publicKey.toBase58(),
    signature,
    createdAt: new Date().toISOString(),
    rules: plain(RULES),
    onchain: plain(onchain),
  };
  fs.writeFileSync(DEPLOY_FILE, JSON.stringify(record, null, 2));
  console.log('\nCONFIG CREATED');
  console.log('Config   :', record.config);
  console.log('Tx       :', `https://solscan.io/tx/${signature}`);
  console.log('Saved to : deployments/mainnet-config.json');
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
