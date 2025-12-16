// Risk scoring system for data exposure assessment

export interface Exposure {
    site: string;
    siteName: string;
    url: string;
    dataFound: string[];
    severity: 'critical' | 'high' | 'medium' | 'low';
    removalDifficulty: 'easy' | 'medium' | 'hard';
    removalUrl?: string;
    removalInstructions?: string;
    snippet?: string;
}

export interface RiskAssessment {
    score: number; // 0-100 (100 = highest risk)
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    summary: string;
    exposures: Exposure[];
    recommendations: string[];
    stats: {
        totalExposures: number;
        criticalCount: number;
        highCount: number;
        mediumCount: number;
        lowCount: number;
    };
}

// Data broker site configurations
export const DATA_BROKER_SITES = {
    'spokeo.com': {
        name: 'Spokeo',
        category: 'people-search',
        severity: 'high' as const,
        removalDifficulty: 'easy' as const,
        removalUrl: 'https://www.spokeo.com/optout',
        dataTypes: ['name', 'address', 'phone', 'email', 'relatives', 'age'],
        weight: 15
    },
    'whitepages.com': {
        name: 'Whitepages',
        category: 'people-search',
        severity: 'high' as const,
        removalDifficulty: 'medium' as const,
        removalUrl: 'https://www.whitepages.com/suppression-requests',
        dataTypes: ['name', 'address', 'phone', 'relatives'],
        weight: 15
    },
    'beenverified.com': {
        name: 'BeenVerified',
        category: 'background-check',
        severity: 'critical' as const,
        removalDifficulty: 'medium' as const,
        removalUrl: 'https://www.beenverified.com/f/optout/search',
        dataTypes: ['name', 'address', 'phone', 'criminal', 'assets'],
        weight: 20
    },
    'radaris.com': {
        name: 'Radaris',
        category: 'people-search',
        severity: 'high' as const,
        removalDifficulty: 'hard' as const,
        removalUrl: 'https://radaris.com/control/privacy',
        dataTypes: ['name', 'address', 'phone', 'social', 'photos'],
        weight: 18
    },
    'fastpeoplesearch.com': {
        name: 'Fast People Search',
        category: 'people-search',
        severity: 'high' as const,
        removalDifficulty: 'easy' as const,
        removalUrl: 'https://www.fastpeoplesearch.com/removal',
        dataTypes: ['name', 'address', 'phone', 'relatives'],
        weight: 12
    },
    'truepeoplesearch.com': {
        name: 'True People Search',
        category: 'people-search',
        severity: 'high' as const,
        removalDifficulty: 'easy' as const,
        removalUrl: 'https://www.truepeoplesearch.com/removal',
        dataTypes: ['name', 'address', 'phone', 'relatives'],
        weight: 12
    },
    'linkedin.com': {
        name: 'LinkedIn',
        category: 'social-professional',
        severity: 'medium' as const,
        removalDifficulty: 'easy' as const,
        removalUrl: 'https://www.linkedin.com/help/linkedin/answer/a1342443',
        dataTypes: ['name', 'employment', 'education', 'skills'],
        weight: 8
    },
    'facebook.com': {
        name: 'Facebook',
        category: 'social',
        severity: 'medium' as const,
        removalDifficulty: 'easy' as const,
        removalUrl: 'https://www.facebook.com/help/delete_account',
        dataTypes: ['name', 'photos', 'friends', 'posts'],
        weight: 10
    },
    'intelius.com': {
        name: 'Intelius',
        category: 'background-check',
        severity: 'critical' as const,
        removalDifficulty: 'hard' as const,
        removalUrl: 'https://www.intelius.com/opt-out',
        dataTypes: ['name', 'address', 'phone', 'criminal', 'assets', 'relatives'],
        weight: 20
    },
    'mylife.com': {
        name: 'MyLife',
        category: 'reputation',
        severity: 'critical' as const,
        removalDifficulty: 'hard' as const,
        removalUrl: 'https://www.mylife.com/ccpa/index.pubview',
        dataTypes: ['name', 'address', 'reputation-score', 'background'],
        weight: 22
    },
    'instantcheckmate.com': {
        name: 'Instant Checkmate',
        category: 'background-check',
        severity: 'critical' as const,
        removalDifficulty: 'medium' as const,
        removalUrl: 'https://www.instantcheckmate.com/opt-out/',
        dataTypes: ['name', 'address', 'phone', 'criminal', 'assets'],
        weight: 18
    },
    'peoplefinder.com': {
        name: 'PeopleFinder',
        category: 'people-search',
        severity: 'high' as const,
        removalDifficulty: 'medium' as const,
        removalUrl: 'https://www.peoplefinder.com/optout.php',
        dataTypes: ['name', 'address', 'phone', 'relatives'],
        weight: 12
    }
};

// Get site info from URL
export function getSiteInfo(url: string): typeof DATA_BROKER_SITES[keyof typeof DATA_BROKER_SITES] | null {
    try {
        const hostname = new URL(url).hostname.replace('www.', '');
        for (const [domain, info] of Object.entries(DATA_BROKER_SITES)) {
            if (hostname.includes(domain.replace('www.', ''))) {
                return info;
            }
        }
    } catch {
        // Invalid URL
    }
    return null;
}

// Calculate risk score from exposures
export function calculateRiskScore(exposures: Exposure[]): RiskAssessment {
    if (exposures.length === 0) {
        return {
            score: 0,
            grade: 'A',
            summary: 'Excellent! No significant data exposure found on major data broker sites.',
            exposures: [],
            recommendations: [
                'Continue monitoring your digital footprint regularly',
                'Set up Google Alerts for your name',
                'Review privacy settings on social media accounts'
            ],
            stats: {
                totalExposures: 0,
                criticalCount: 0,
                highCount: 0,
                mediumCount: 0,
                lowCount: 0
            }
        };
    }

    // Count by severity
    const stats = {
        totalExposures: exposures.length,
        criticalCount: exposures.filter(e => e.severity === 'critical').length,
        highCount: exposures.filter(e => e.severity === 'high').length,
        mediumCount: exposures.filter(e => e.severity === 'medium').length,
        lowCount: exposures.filter(e => e.severity === 'low').length
    };

    // Calculate weighted score
    let rawScore = 0;
    exposures.forEach(exposure => {
        const siteInfo = getSiteInfo(exposure.url);
        const weight = siteInfo?.weight || 10;
        rawScore += weight;
    });

    // Normalize to 0-100 scale (cap at 100)
    const score = Math.min(100, rawScore);

    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score <= 10) grade = 'A';
    else if (score <= 25) grade = 'B';
    else if (score <= 50) grade = 'C';
    else if (score <= 75) grade = 'D';
    else grade = 'F';

    // Generate summary
    let summary = '';
    if (score >= 75) {
        summary = `Critical exposure level. Your personal information is widely available on ${stats.totalExposures} data broker sites, including ${stats.criticalCount} critical-risk sources.`;
    } else if (score >= 50) {
        summary = `High exposure level. Your data appears on ${stats.totalExposures} sites. Immediate action recommended to reduce your digital footprint.`;
    } else if (score >= 25) {
        summary = `Moderate exposure level. Found ${stats.totalExposures} instances of your data online. Consider removing from high-risk sources.`;
    } else {
        summary = `Low exposure level. Limited data found on ${stats.totalExposures} sites. Good digital hygiene practices detected.`;
    }

    // Generate recommendations based on exposures
    const recommendations: string[] = [];

    if (stats.criticalCount > 0) {
        recommendations.push('🚨 Priority: Remove your data from critical-risk sites like BeenVerified, MyLife, and Intelius first');
    }

    if (exposures.some(e => e.removalDifficulty === 'easy')) {
        recommendations.push('✅ Start with easy removals: Some sites like Spokeo and TruePeopleSearch have simple opt-out processes');
    }

    if (exposures.some(e => e.site.includes('linkedin') || e.site.includes('facebook'))) {
        recommendations.push('🔒 Review privacy settings on your social media profiles to limit public visibility');
    }

    recommendations.push('📧 Consider using email aliases for online signups to prevent future data broker listings');
    recommendations.push('📍 Use a PO Box or virtual mailbox instead of your home address when possible');

    if (stats.totalExposures >= 5) {
        recommendations.push('🔄 Set up recurring monthly scans to monitor for new exposures');
    }

    return {
        score,
        grade,
        summary,
        exposures: exposures.sort((a, b) => {
            const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        }),
        recommendations,
        stats
    };
}

// Generate removal instructions for a site
export function getRemovalInstructions(site: string): string {
    const siteInfo = Object.entries(DATA_BROKER_SITES).find(([domain]) =>
        site.includes(domain.replace('www.', ''))
    )?.[1];

    if (!siteInfo) {
        return 'Visit the site and look for a privacy policy or opt-out page. Most sites are required to honor removal requests under CCPA and GDPR.';
    }

    const difficulty = {
        easy: 'This site has a simple opt-out process that typically takes 5-10 minutes.',
        medium: 'This site requires verification steps. Expect the process to take 15-30 minutes.',
        hard: 'This site has a complex removal process. You may need to submit multiple requests or verify your identity.'
    };

    return `${difficulty[siteInfo.removalDifficulty]} Visit ${siteInfo.removalUrl} to begin the removal process.`;
}
