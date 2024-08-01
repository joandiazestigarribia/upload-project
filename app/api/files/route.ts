import { list } from "@vercel/blob";
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { blobs } = await list();
    return NextResponse.json({ blobs });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ error: 'Error listing files' }, { status: 500 });
  }
}