const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const url = require('url');

let mainWindow = null;
let localServer = null;
let serverPort = 38241;

// Clean Chrome User-Agent to prevent Google OAuth "disallowed_useragent / insecure browser" in Electron
const CHROME_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
};

// Embedded local HTTP server to serve dist/ from localhost (fixes auth/unauthorized-domain)
function startLocalServer(callback) {
  const distDir = path.join(__dirname, '../dist');

  localServer = http.createServer(async (req, res) => {
    try {
      const parsedUrl = url.parse(req.url, true);
      let pathname = parsedUrl.pathname || '/';

      // Local API proxy for YouTube channel videos
      if (pathname === '/api/youtube/channel') {
        const query = (parsedUrl.query.url || parsedUrl.query.query || '').toString().trim();
        if (!query) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Query required' }));
        }

        try {
          let channelId = 'UC0Qh-RNz_2MXycisguXUaDA';
          let channelTitle = 'Kios Kode';
          let handle = '@KiosKode';
          let avatarUrl =
            'https://yt3.googleusercontent.com/sLl-j_1SlFUWUANi0kmAX5VD_YGwpbKnL4C3UYbRiajNXLbhVr-y2mJ8J1vQ74sRgodlISnLtXE=s900-c-k-c0x00ffffff-no-rj';

          if (/^UC[a-zA-Z0-9_-]{22}$/.test(query)) {
            channelId = query;
          } else {
            let targetUrl = query.startsWith('http')
              ? query
              : `https://www.youtube.com/${query.startsWith('@') ? query : '@' + query}`;

            const pageRes = await fetch(targetUrl, {
              headers: { 'User-Agent': CHROME_USER_AGENT },
            });
            const html = await pageRes.text();

            const chMatch =
              html.match(/<meta itemprop="channelId" content="([a-zA-Z0-9_-]+)"/i) ||
              html.match(/"channelId":"([a-zA-Z0-9_-]+)"/) ||
              html.match(/"externalId":"([a-zA-Z0-9_-]+)"/);
            if (chMatch && chMatch[1]) channelId = chMatch[1];

            const tMatch =
              html.match(/<meta property="og:title" content="([^"]+)"/i) ||
              html.match(/<title>([^<]+)<\/title>/);
            if (tMatch && tMatch[1]) channelTitle = tMatch[1].replace(/ - YouTube$/, '').trim();

            const aMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
            if (aMatch && aMatch[1]) avatarUrl = aMatch[1];

            const hMatch = targetUrl.match(/@([a-zA-Z0-9_.-]+)/);
            if (hMatch) handle = `@${hMatch[1]}`;
          }

          // Fetch YouTube RSS feed
          let videos = [];
          try {
            const rssRes = await fetch(
              `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
              { headers: { 'User-Agent': CHROME_USER_AGENT } }
            );
            if (rssRes.ok) {
              const xml = await rssRes.text();
              const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
              let m;
              let idx = 0;
              while ((m = entryRegex.exec(xml)) !== null) {
                const entryXml = m[1];
                const vIdMatch = entryXml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
                const titleMatch = entryXml.match(/<title>([^<]+)<\/title>/);
                const pubMatch = entryXml.match(/<published>([^<]+)<\/published>/);
                const thumbMatch = entryXml.match(/<media:thumbnail[^>]*url="([^"]+)"/);

                if (vIdMatch && vIdMatch[1]) {
                  videos.push({
                    id: `ch-${vIdMatch[1]}-${idx}`,
                    videoId: vIdMatch[1].trim(),
                    title: titleMatch ? titleMatch[1].trim() : `Video ${vIdMatch[1]}`,
                    channelTitle,
                    thumbnailUrl: thumbMatch
                      ? thumbMatch[1].trim()
                      : `https://i.ytimg.com/vi/${vIdMatch[1]}/hqdefault.jpg`,
                    publishedAt: pubMatch ? pubMatch[1].trim() : new Date().toISOString(),
                  });
                  idx++;
                }
              }
            }
          } catch (rErr) {
            console.debug('RSS error in electron:', rErr);
          }

          if (videos.length === 0) {
            videos = [
              {
                id: 'kioskode-UslOP77SkUk-0',
                videoId: 'UslOP77SkUk',
                title: 'Lufya CBT - Sistem Ujian Berbasis Komputer',
                channelTitle: 'Kios Kode',
                thumbnailUrl: 'https://i.ytimg.com/vi/UslOP77SkUk/hqdefault.jpg',
              },
              {
                id: 'kioskode-yi4k7CD7KmI-1',
                videoId: 'yi4k7CD7KmI',
                title: 'PPDB Plus WhastAap Getway Fonnte',
                channelTitle: 'Kios Kode',
                thumbnailUrl: 'https://i2.ytimg.com/vi/yi4k7CD7KmI/hqdefault.jpg',
              },
              {
                id: 'kioskode-aVs4nW5ZfOE-2',
                videoId: 'aVs4nW5ZfOE',
                title: 'New ASIS 7.0 (Aplikasi Sistem Informasi Sekolah)',
                channelTitle: 'Kios Kode',
                thumbnailUrl: 'https://i2.ytimg.com/vi/aVs4nW5ZfOE/hqdefault.jpg',
              },
              {
                id: 'kioskode-aeHHptIp-Tc-3',
                videoId: 'aeHHptIp-Tc',
                title: 'Smart Payment Sekolah',
                channelTitle: 'Kios Kode',
                thumbnailUrl: 'https://i2.ytimg.com/vi/aeHHptIp-Tc/hqdefault.jpg',
              },
              {
                id: 'kioskode-vKbEw5yF9YY-4',
                videoId: 'vKbEw5yF9YY',
                title: 'E-Kesiswaan Sistem Informasi Manajemen Kesiswaan',
                channelTitle: 'Kios Kode',
                thumbnailUrl: 'https://i3.ytimg.com/vi/vKbEw5yF9YY/hqdefault.jpg',
              },
              {
                id: 'kioskode-L09zU6_vEcs-5',
                videoId: 'L09zU6_vEcs',
                title: 'Website dan Sistem Informasi Sekolah',
                channelTitle: 'Kios Kode',
                thumbnailUrl: 'https://i1.ytimg.com/vi/L09zU6_vEcs/hqdefault.jpg',
              },
            ];
          }

          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          return res.end(
            JSON.stringify({
              success: true,
              channelId,
              channelTitle,
              handle,
              avatarUrl,
              videoCount: videos.length,
              videos,
            })
          );
        } catch (apiErr) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, videos: [] }));
        }
      }

      // Serve static files from dist/
      if (pathname === '/') pathname = '/index.html';
      let filePath = path.join(distDir, decodeURIComponent(pathname));

      // Security check
      if (!filePath.startsWith(distDir)) {
        res.writeHead(403);
        return res.end('Forbidden');
      }

      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          // SPA fallback to index.html
          filePath = path.join(distDir, 'index.html');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (readErr, content) => {
          if (readErr) {
            res.writeHead(500);
            res.end('File read error');
          } else {
            res.writeHead(200, {
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*',
            });
            res.end(content);
          }
        });
      });
    } catch (reqErr) {
      res.writeHead(500);
      res.end('Server internal error');
    }
  });

  localServer.listen(serverPort, 'localhost', () => {
    callback(serverPort);
  });

  localServer.on('error', (err) => {
    // If port 38241 is taken, use dynamic free port
    if (err.code === 'EADDRINUSE') {
      localServer.listen(0, 'localhost', () => {
        serverPort = localServer.address().port;
        callback(serverPort);
      });
    }
  });
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 860,
    minHeight: 600,
    title: 'LoopTube - YouTube Looper & Background Player',
    icon: path.join(__dirname, '../public/icon.png'),
    backgroundColor: '#09090b',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false, // Ensures audio never stops when minimized
    },
  });

  // Use clean user agent so Google OAuth never blocks the embedded browser
  mainWindow.webContents.setUserAgent(CHROME_USER_AGENT);

  const startUrl = `http://localhost:${port}`;
  mainWindow.loadURL(startUrl);

  // Safe window handler for Google Auth popup
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    // Allow Google, Firebase & YouTube OAuth and Session popups
    if (
      targetUrl.includes('accounts.google.com') ||
      targetUrl.includes('firebaseapp.com') ||
      targetUrl.includes('googleapis.com') ||
      targetUrl.includes('google.com') ||
      targetUrl.includes('youtube.com')
    ) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 520,
          height: 640,
          autoHideMenuBar: true,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
          },
        },
      };
    }
    // Open other external links in default system browser
    shell.openExternal(targetUrl);
    return { action: 'deny' };
  });

  // Set user agent for newly created popups (critical for Google OAuth popup)
  mainWindow.webContents.on('did-create-window', (popup) => {
    popup.webContents.setUserAgent(CHROME_USER_AGENT);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startLocalServer((port) => {
    createWindow(port);
  });
});

app.on('window-all-closed', () => {
  if (localServer) {
    localServer.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    if (localServer && localServer.listening) {
      createWindow(serverPort);
    } else {
      startLocalServer((port) => {
        createWindow(port);
      });
    }
  }
});
