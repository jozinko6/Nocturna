import { AUCTION_CONFIG } from '../src/lib/config/auction'

console.log('=== Auction Economy Audit ===\n')

const config = AUCTION_CONFIG

console.log('Fees:')
console.log(`  Listing fee: min=${config.fees.listingFee.min}, rate=${config.fees.listingFee.rate}`)
console.log(`  Sale fee: rate=${config.fees.saleFee}`)

console.log('\nLimits:')
console.log(`  Max active listings: ${config.limits.maxActiveListings}`)
console.log(`  Max new/day: ${config.limits.maxNewListingsPerDay}`)
console.log(`  Max duration: ${config.limits.maxDurationHours}h`)
console.log(`  Min price: ${config.limits.minPrice}`)

console.log('\nTrust levels:')
for (const tl of config.trustLevels) {
  console.log(`  Level ${tl.level}: maxListings=${tl.maxActiveListings}, accountAge=${tl.requirements.accountAgeDays}d`)
}

console.log('\nFraud detection:')
console.log(`  Max tx/hour: ${config.fraudDetection.maxTransactionsPerHour}`)
console.log(`  Max same pair/day: ${config.fraudDetection.maxSameBuyerSellerPerDay}`)

console.log('\n=== AUDIT COMPLETE ===')
