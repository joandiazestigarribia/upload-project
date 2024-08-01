import { put, del, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { oldUrl, newFilename } = await request.json();

  try {
    const { blobs } = await list();
    const oldBlob = blobs.find(blob => blob.url === oldUrl);

    if (!oldBlob) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    const response = await fetch(oldUrl);
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await response.arrayBuffer();

    const newBlob = await put(newFilename, arrayBuffer, {
      access: 'public',
      contentType: contentType,
    });

    await del(oldUrl);

    return NextResponse.json(newBlob);
  } catch (error) {
    console.error('Error renaming file:', error);
    return NextResponse.json({ error: 'Error renaming file' }, { status: 500 });
  }
}