// Shared tiered pricing logic.
// A team can have up to three price tiers that step up over time:
//   1. Super early bird  (superEarlyBirdPriceCents until superEarlyBirdEnds)
//   2. Early bird         (earlyBirdPriceCents until earlyBirdEnds)
//   3. Regular            (priceCents — always the final, full price)
// Any tier whose price/date is null is simply skipped.

type PricingFields = {
    priceCents: number;
    earlyBirdPriceCents?: number | null;
    earlyBirdEnds?: Date | string | null;
    superEarlyBirdPriceCents?: number | null;
    superEarlyBirdEnds?: Date | string | null;
};

export type PriceTier = 'super' | 'early' | 'regular';

export type PricingInfo = {
    currentPriceCents: number;
    tier: PriceTier;
    // The next (higher) price and when it kicks in, or null if already at regular price.
    nextPriceCents: number | null;
    nextPriceStarts: Date | null;
};

function toDate(d: Date | string | null | undefined): Date | null {
    if (d == null) return null;
    return d instanceof Date ? d : new Date(d);
}

export function pricingInfo(team: PricingFields, now: Date = new Date()): PricingInfo {
    const superEnds = toDate(team.superEarlyBirdEnds);
    const earlyEnds = toDate(team.earlyBirdEnds);
    const hasSuper = team.superEarlyBirdPriceCents != null && superEnds != null;
    const hasEarly = team.earlyBirdPriceCents != null && earlyEnds != null;

    if (hasSuper && now < (superEnds as Date)) {
        return {
            currentPriceCents: team.superEarlyBirdPriceCents as number,
            tier: 'super',
            nextPriceCents: hasEarly ? (team.earlyBirdPriceCents as number) : team.priceCents,
            nextPriceStarts: superEnds,
        };
    }

    if (hasEarly && now < (earlyEnds as Date)) {
        return {
            currentPriceCents: team.earlyBirdPriceCents as number,
            tier: 'early',
            nextPriceCents: team.priceCents,
            nextPriceStarts: earlyEnds,
        };
    }

    return {
        currentPriceCents: team.priceCents,
        tier: 'regular',
        nextPriceCents: null,
        nextPriceStarts: null,
    };
}

// The price a registration should actually be charged right now.
export function effectivePriceCents(team: PricingFields, now: Date = new Date()): number {
    return pricingInfo(team, now).currentPriceCents;
}
