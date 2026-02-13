const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const net = require('net');
const fs = require('fs');

let mainWindow = null;
let serverProcess = null;
let SERVER_PORT = 5050;
const isDev = process.argv.includes('--dev');

// Find a free port
function findFreePort(startPort) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(startPort, () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
        server.on('error', () => resolve(findFreePort(startPort + 1)));
    });
}

// ============================================================
// SERVER MANAGEMENT
// ============================================================
function startServer() {
    return new Promise(async (resolve, reject) => {
        SERVER_PORT = await findFreePort(5050);
        console.log('Using port:', SERVER_PORT);

        // In packaged app, files are at resources/app/
        // With asar:false, they're real files on disk
        const appRoot = app.isPackaged
            ? path.join(process.resourcesPath, 'app')
            : path.join(__dirname, '..');

        const serverPath = path.join(appRoot, 'server', 'index.js');
        const env = { ...process.env, PORT: String(SERVER_PORT) };

        // In packaged app, .env is in extraResources
        if (app.isPackaged) {
            env.DOTENV_CONFIG_PATH = path.join(process.resourcesPath, '.env');
        }

        console.log('Server path:', serverPath);
        console.log('Exists:', fs.existsSync(serverPath));

        let serverOutput = [];

        try {
            serverProcess = fork(serverPath, [], {
                env,
                stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
                cwd: appRoot
            });
        } catch (err) {
            reject(new Error('Cannot start server: ' + err.message));
            return;
        }

        serverProcess.stdout.on('data', (d) => {
            const msg = d.toString().trim();
            console.log('[SERVER]', msg);
            serverOutput.push(msg);
        });

        serverProcess.stderr.on('data', (d) => {
            const msg = d.toString().trim();
            console.error('[SERVER-ERR]', msg);
            serverOutput.push('[ERR] ' + msg);
        });

        serverProcess.on('error', (err) => reject(err));

        let crashed = false;
        serverProcess.on('exit', (code) => {
            if (code !== 0 && code !== null && !crashed) {
                crashed = true;
                const logs = serverOutput.join('\n');
                // Save log to desktop for debugging
                try {
                    const logPath = path.join(app.getPath('desktop'), 'SoftLearn_error.log');
                    fs.writeFileSync(logPath, 'SoftLearn Error Log\nTime: ' + new Date().toISOString() +
                        '\nExit code: ' + code + '\n\nServer output:\n' + logs);
                } catch (e) { }
                reject(new Error('Server crashed (code ' + code + ')\n' + logs.slice(-500)));
            }
        });

        // Poll until server responds
        let retries = 0;
        const check = () => {
            if (crashed) return;
            retries++;
            const http = require('http');
            const req = http.get('http://localhost:' + SERVER_PORT + '/api/health', (res) => resolve());
            req.on('error', () => {
                if (retries >= 180) {
                    reject(new Error('Server did not respond after 90 seconds'));
                } else {
                    setTimeout(check, 500);
                }
            });
            req.setTimeout(1000, () => { req.destroy(); });
        };
        setTimeout(check, 1000);
    });
}

function stopServer() {
    if (serverProcess) {
        serverProcess.kill('SIGTERM');
        serverProcess = null;
    }
}

// ============================================================
// WINDOW
// ============================================================
function getIconPath() {
    if (app.isPackaged) {
        return path.join(process.resourcesPath, 'app', 'public', 'icon.ico');
    }
    return path.join(__dirname, '..', 'public', 'icon.ico');
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        title: 'SoftLearn LMS',
        icon: getIconPath(),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        autoHideMenuBar: true,
        show: false,
        backgroundColor: '#0a0a0f',
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:3001');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadURL('http://localhost:' + SERVER_PORT);
    }

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => { mainWindow = null; });
}

// ============================================================
// LIFECYCLE
// ============================================================
app.whenReady().then(async () => {
    try {
        await startServer();
        createWindow();
        mainWindow.once('ready-to-show', () => {
            mainWindow.show();
            mainWindow.focus();
        });
    } catch (error) {
        console.error('STARTUP ERROR:', error.message);
        dialog.showErrorBox(
            'SoftLearn LMS - Startup Error',
            error.message + '\n\nCheck SoftLearn_error.log on your Desktop for details.'
        );
        app.quit();
    }
});

app.on('window-all-closed', () => { stopServer(); app.quit(); });
app.on('before-quit', () => stopServer());
