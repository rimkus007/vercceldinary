import { NextResponse } from 'next/server';
import { mockSecurityData } from '@/lib/mock-security-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const period = searchParams.get('period') || '24h';

  try {
    let data;

    switch (type) {
      case 'logs':
        data = mockSecurityData.logs;
        break;
      case 'reports':
        data = mockSecurityData.reports;
        break;
      case 'blacklist':
        data = mockSecurityData.blacklist;
        break;
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    // Filtrer par période si nécessaire
    if (period !== 'all') {
      const now = Date.now();
      const timeAgo = period === '7d' ? 7 * 24 * 3600000 :
                     period === '30d' ? 30 * 24 * 3600000 :
                     24 * 3600000;

      data = data.filter((item: any) => {
        const timestamp = new Date(item.timestamp || item.createdAt || item.addedAt).getTime();
        return timestamp > now - timeAgo;
      });
    }

    return NextResponse.json({ data });

  } catch (error) {
    /* log removed */
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'createReport':
        // Ajouter un nouveau rapport avec un ID unique
        const newReport = {
          ...data,
          id: String(mockSecurityData.reports.length + 1),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        mockSecurityData.reports.push(newReport);
        return NextResponse.json({ data: newReport });

      case 'resolveReport':
        const reportIndex = mockSecurityData.reports.findIndex(r => r.id === data.reportId);
        if (reportIndex === -1) {
          return NextResponse.json(
            { error: 'Report not found' },
            { status: 404 }
          );
        }
        mockSecurityData.reports[reportIndex] = {
          ...mockSecurityData.reports[reportIndex],
          status: 'resolved',
          resolution: data.resolution,
          updatedAt: new Date().toISOString()
        };
        return NextResponse.json({ data: mockSecurityData.reports[reportIndex] });

      case 'addToBlacklist':
        const newEntry = {
          ...data,
          id: String(mockSecurityData.blacklist.length + 1)
        };
        mockSecurityData.blacklist.push(newEntry);
        return NextResponse.json({ data: newEntry });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    /* log removed */
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  if (!type || !id) {
    return NextResponse.json(
      { error: 'Missing type or id parameter' },
      { status: 400 }
    );
  }

  try {
    switch (type) {
      case 'blacklist':
        const entryIndex = mockSecurityData.blacklist.findIndex(e => e.id === id);
        if (entryIndex === -1) {
          return NextResponse.json(
            { error: 'Entry not found' },
            { status: 404 }
          );
        }
        mockSecurityData.blacklist.splice(entryIndex, 1);
        break;

      case 'report':
        const reportIndex = mockSecurityData.reports.findIndex(r => r.id === id);
        if (reportIndex === -1) {
          return NextResponse.json(
            { error: 'Report not found' },
            { status: 404 }
          );
        }
        mockSecurityData.reports.splice(reportIndex, 1);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    /* log removed */
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
