import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
    const json = await request.json();
    
    if (!json.url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        await del(json.url);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json({ error: 'Error deleting file' }, { status: 500 });
    }
}