import { put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
    const json = await request.json();
    await del(json.url);
    return NextResponse.json({});
}

export async function POST(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || "";

    if (!filename) {
        return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    const body = request.body;
    if (!body || !(body instanceof ReadableStream)) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    try {
        const blob = await put(filename, body as ReadableStream<Uint8Array>, {
            access: 'public',
        });

        return NextResponse.json(blob);
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
    }
}