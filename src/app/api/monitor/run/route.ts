import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        console.log(`API: Running manual scan for user ${userId}`);

        // 1. Fetch user's monitored profile
        const profileRef = doc(db, 'users', userId, 'monitoredProfile', 'info');
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
            return NextResponse.json({
                error: 'No monitoring profile found. Please set up your profile in Settings first.'
            }, { status: 400 });
        }

        const profile = profileSnap.data();
        const { fullName, email, phone, city, state } = profile;

        if (!fullName) {
            return NextResponse.json({
                error: 'Full name is required in your monitoring profile.'
            }, { status: 400 });
        }

        // 2. Construct search query
        const cityState = city && state ? `${city}, ${state}` : '';

        // 3. Call search API
        const searchRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: fullName,
                cityState,
                email,
                phone
            }),
        });

        if (!searchRes.ok) {
            throw new Error('Search API failed');
        }

        const searchData = await searchRes.json();
        const results = searchData.items || [];

        // 4. Save results to scans collection
        if (results.length > 0) {
            const scansPromises = results.map((item: any) =>
                addDoc(collection(db, 'users', userId, 'scans'), {
                    title: item.title,
                    link: item.link,
                    source: item.source,
                    snippet: item.snippet,
                    status: 'new',
                    query: fullName,
                    cityState: cityState || null,
                    email: email || null,
                    phone: phone || null,
                    timestamp: serverTimestamp(),
                    scanType: 'manual'
                })
            );
            await Promise.all(scansPromises);
        }

        console.log(`Manual scan complete: ${results.length} results found`);

        return NextResponse.json({
            success: true,
            resultCount: results.length,
            message: `Found ${results.length} potential exposures`
        });
    } catch (error) {
        console.error('Monitor API Error:', error);
        return NextResponse.json({
            error: 'Failed to run scan. Please try again.'
        }, { status: 500 });
    }
}
