import { NextResponse } from 'next/server';
import { comprehensiveSearch } from '@/lib/google-search';
import { calculateRiskScore, RiskAssessment } from '@/lib/risk-scoring';

export interface SearchResponse {
    success: boolean;
    assessment: RiskAssessment;
    searchedFor: {
        name: string;
        cityState?: string;
        email?: string;
        phone?: string;
    };
    timestamp: string;
}

export async function POST(request: Request) {
    try {
        const { query, cityState, email, phone } = await request.json();

        if (!query) {
            return NextResponse.json({
                success: false,
                error: 'Full name is required'
            }, { status: 400 });
        }

        console.log(`API: Comprehensive search for "${query}" (City: ${cityState || 'N/A'}, Email: ${email || 'N/A'}, Phone: ${phone || 'N/A'})`);

        // Perform comprehensive search across data broker sites
        const searchResult = await comprehensiveSearch(query, cityState, email, phone);

        console.log(`Found ${searchResult.exposures.length} exposures across data broker sites`);

        // Calculate risk assessment
        const assessment = calculateRiskScore(searchResult.exposures);

        const response: SearchResponse = {
            success: true,
            assessment,
            searchedFor: {
                name: query,
                cityState: cityState || undefined,
                email: email || undefined,
                phone: phone || undefined
            },
            timestamp: searchResult.timestamp
        };

        // Also return legacy format for backward compatibility
        return NextResponse.json({
            ...response,
            items: searchResult.rawResults // Legacy format
        });

    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Search failed. Please try again.'
        }, { status: 500 });
    }
}
