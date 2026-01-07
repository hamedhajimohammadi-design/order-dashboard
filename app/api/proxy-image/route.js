
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  // Security: Only allow images from your specific domain
  if (!imageUrl.startsWith('https://pgemshop.com/')) {
    return new NextResponse('Forbidden Domain', { status: 403 });
  }

  const fetchImage = async (url) => {
      return await fetch(url, {
          headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Referer': ''
          }
      });
  };

  try {
    let response = await fetchImage(imageUrl);

    // 🔄 Fallback Logic for Old Users
    // If the new path (mnsfpt_documents) fails with 403/404, try the old path (mnsfpt_uploads)
    if (!response.ok && (response.status === 403 || response.status === 404)) {
        if (imageUrl.includes('/mnsfpt_documents/')) {
            // Extract filename: .../mnsfpt_documents/12345/filename.jpg -> filename.jpg
            const parts = imageUrl.split('/');
            const filename = parts[parts.length - 1];
            
            // Construct legacy URL
            const legacyUrl = `https://pgemshop.com/wp-content/uploads/mnsfpt_uploads/${filename}`;
            console.log(`[Proxy] Primary path failed (${response.status}). Trying legacy path: ${legacyUrl}`);
            
            const fallbackResponse = await fetchImage(legacyUrl);
            if (fallbackResponse.ok) {
                response = fallbackResponse;
            }
        }
    }

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
