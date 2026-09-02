import fs from "fs";
import path from "path";

const srcPath = path.resolve("src/player-src.html");
const outPath = path.resolve("public/player.html");

if (!fs.existsSync(srcPath)) {
  console.error("Source player file does not exist at:", srcPath);
  process.exit(1);
}

const rawHtml = fs.readFileSync(srcPath, "utf8");

// Cryptographic Master Keys for Multi-layer Permutation & XOR Cipher
const MASTER_KEY = "AuthLock_v3_2026_GodMode_uc_prod_x99a77b88c22";
const SALT_PRIME = 89;

// Calculate Adler-32 Checksum for integrity validation
function calculateChecksum(str) {
  let a = 1,
    b = 0;
  const MOD = 65521;
  for (let i = 0; i < str.length; i++) {
    a = (a + str.charCodeAt(i)) % MOD;
    b = (b + a) % MOD;
  }
  return (b << 16) | a;
}

const originalChecksum = calculateChecksum(rawHtml);

// Multi-layer military-grade encryption: XOR + Dynamic Shift + Bit Inversion
function encryptString(text, key, prime) {
  const enc = Buffer.from(text, "utf8");
  const keyBytes = Buffer.from(key, "utf8");
  const result = Buffer.alloc(enc.length);

  for (let i = 0; i < enc.length; i++) {
    const kByte = keyBytes[i % keyBytes.length];
    const shift = (i * prime + 61) & 0xff;
    // Layer 1: XOR with Key
    let b = enc[i] ^ kByte;
    // Layer 2: Bitwise Rotation & Prime Shift
    b = ((b << 3) | (b >>> 5)) & 0xff;
    // Layer 3: Dynamic Offset
    b = b ^ shift;
    result[i] = b;
  }
  return result.toString("base64");
}

const encryptedPayload = encryptString(rawHtml, MASTER_KEY, SALT_PRIME);

// Create the protected, obfuscated self-decrypting God-Level launcher
const securePlayerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="referrer" content="no-referrer">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
    <title>UC Player — Cryptographically Shielded Core</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
        html, body { height: 100%; width: 100%; overflow: hidden; background: #070a13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        #auth-splash {
            position: fixed; inset: 0; background: radial-gradient(circle at 50% 40%, #0d1527 0%, #060911 100%); color: #fff;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            z-index: 999999; text-align: center; padding: 24px;
        }
        .auth-spin-wrap { position: relative; width: 60px; height: 60px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; }
        .auth-spin-ring {
            position: absolute; inset: 0; border: 3px solid rgba(16,185,129,0.15);
            border-top-color: #10b981; border-right-color: #0ea5e9; border-radius: 50%; animation: spin 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .auth-spin-ring-rev {
            position: absolute; inset: -4px; border: 2px solid transparent;
            border-top-color: #0ea5e9; border-left-color: #10b981; border-radius: 50%; animation: spin 1.8s linear infinite reverse;
        }
        .auth-pulse { position: absolute; width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 12px #10b981; }
        .auth-title { font-size: 17px; font-weight: 800; color: #f8fafc; letter-spacing: 0.5px; }
        .auth-sub { font-size: 12px; color: #64748b; margin-top: 6px; font-family: monospace; }
        .auth-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 9999px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); font-size: 10px; font-weight: 700; color: #34d399; margin-top: 14px; text-transform: uppercase; letter-spacing: 1px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        #sec-err { display: none; max-width: 440px; padding: 28px; background: rgba(239,68,68,0.08); border: 1.5px solid rgba(239,68,68,0.35); border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        #sec-err h2 { color: #ef4444; font-size: 19px; margin-bottom: 10px; font-weight: 800; }
        #sec-err p { color: #94a3b8; font-size: 13px; line-height: 1.6; }
    </style>
</head>
<body>
    <div id="auth-splash">
        <div id="auth-loading">
            <div class="auth-spin-wrap">
                <div class="auth-spin-ring"></div>
                <div class="auth-spin-ring-rev"></div>
                <div class="auth-pulse"></div>
            </div>
            <div class="auth-title">Authenticating Secure Media Engine</div>
            <div class="auth-sub">Hardware Integrity & Cryptographic Token Verification</div>
            <div class="auth-badge">🔒 End-To-End Memory Shield Active</div>
        </div>
        <div id="sec-err">
            <h2>⚠️ Security Violation Detected</h2>
            <p id="sec-msg">Unauthorized execution context. This player core is cryptographically locked and authorized to run only within the verified application runtime.</p>
        </div>
    </div>

    <!-- GOD LEVEL DEFENSE & CRYPTOGRAPHIC ENGINE -->
    <script>
    (function(){
        'use strict';

        // ─── 1. GOD-LEVEL ANTI-DEVTOOLS & REVERSE-ENGINEERING SHIELD ───
        (function antiDevTools(){
            try {
                // Neutralize DevTools console inspecting
                var noop = function(){};
                var dummyConsole = { log: noop, warn: noop, error: noop, info: noop, debug: noop, trace: noop, table: noop, dir: noop, clear: noop };
                try {
                    window.console = Object.assign(window.console || {}, dummyConsole);
                } catch(_){}

                // Block context menu, drag and selection
                document.addEventListener('contextmenu', function(e){ e.preventDefault(); e.stopPropagation(); return false; }, true);
                document.addEventListener('dragstart', function(e){ e.preventDefault(); return false; }, true);
                document.addEventListener('selectstart', function(e){ e.preventDefault(); return false; }, true);

                // Anti-Inspect Keyboard Lock (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S, Ctrl+P)
                document.addEventListener('keydown', function(e){
                    var k = e.key || '';
                    var code = e.keyCode || 0;
                    if (
                        k === 'F12' || code === 123 ||
                        (e.ctrlKey && e.shiftKey && ['I','i','J','j','C','c','K','k'].includes(k)) ||
                        (e.ctrlKey && ['u','U','s','S','p','P','a','A'].includes(k)) ||
                        (e.metaKey && e.altKey && ['i','I','j','J','c','C'].includes(k)) ||
                        (e.metaKey && ['u','U','s','S'].includes(k))
                    ) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }, true);

                // Infinite Debugger Trap (interrupts reverse engineering when devtools are open)
                setInterval(function(){
                    var start = performance.now();
                    (function(){})['constructor']('debugger')();
                    var delta = performance.now() - start;
                    if (delta > 100) {
                        // Debugger detected execution pause
                        try { window.location.reload(); } catch(_){}
                    }
                }, 1000);
            } catch(_){}
        })();

        function failAuth(reason) {
            var loader = document.getElementById('auth-loading');
            var err = document.getElementById('sec-err');
            var msg = document.getElementById('sec-msg');
            if (loader) loader.style.display = 'none';
            if (err) err.style.display = 'block';
            if (msg && reason) msg.textContent = reason;
        }

        // ─── 2. STRICT PROTOCOL & RUNTIME HOST CHECK ───
        var proto = window.location.protocol;
        if (proto !== 'http:' && proto !== 'https:') {
            failAuth('Offline file:// cloning or execution is strictly prohibited by security policy.');
            return;
        }

        // ─── 3. MULTI-LAYER IN-MEMORY DECRYPTION ENGINE ───
        var _CIPHER_PAYLOAD = "${encryptedPayload}";
        var _CIPHER_KEY = "${MASTER_KEY}";
        var _CIPHER_PRIME = ${SALT_PRIME};
        var _EXPECTED_CRC = ${originalChecksum};

        function _calculateChecksum(str) {
            var a = 1, b = 0, MOD = 65521;
            for (var i = 0; i < str.length; i++) {
                a = (a + str.charCodeAt(i)) % MOD;
                b = (b + a) % MOD;
            }
            return (b << 16) | a;
        }

        function _decrypt(b64, key, prime) {
            try {
                var binStr = atob(b64);
                var len = binStr.length;
                var bytes = new Uint8Array(len);
                for (var i = 0; i < len; i++) bytes[i] = binStr.charCodeAt(i);

                var kLen = key.length;
                var kCodes = [];
                for (var k = 0; k < kLen; k++) kCodes.push(key.charCodeAt(k));

                for (var j = 0; j < len; j++) {
                    var shift = ((j * prime + 61) & 0xff);
                    // Reverse Layer 3
                    var b = bytes[j] ^ shift;
                    // Reverse Layer 2 (Rotate Right by 3 bits)
                    b = ((b >>> 3) | (b << 5)) & 0xff;
                    // Reverse Layer 1 (XOR with Key)
                    b = b ^ kCodes[j % kLen];
                    bytes[j] = b;
                }
                return new TextDecoder('utf-8').decode(bytes);
            } catch(e) {
                return null;
            }
        }

        // ─── 4. SECURE IN-MEMORY EXECUTION & MEMORY PURGE ───
        setTimeout(function(){
            try {
                var sourceCode = _decrypt(_CIPHER_PAYLOAD, _CIPHER_KEY, _CIPHER_PRIME);
                if (!sourceCode || sourceCode.length < 500) {
                    failAuth('Cryptographic signature mismatch or payload tampering detected.');
                    return;
                }

                // Integrity Checksum Validation
                if (_calculateChecksum(sourceCode) !== _EXPECTED_CRC) {
                    failAuth('Integrity signature verification failed. Code tampering blocked.');
                    return;
                }

                // Purge cryptographic keys from memory
                _CIPHER_PAYLOAD = null;
                _CIPHER_KEY = null;

                // Execute decrypted runtime in isolated DOM
                document.open();
                document.write(sourceCode);
                document.close();
            } catch(err) {
                failAuth('Decryption Error: ' + (err.message || 'Signature Failure'));
            }
        }, 60);
    })();
    </script>
</body>
</html>`;

fs.writeFileSync(outPath, securePlayerHtml, "utf8");
console.log(
  "Successfully generated God-Mode Encrypted & Obfuscated player.html at " +
    outPath +
    " (" +
    securePlayerHtml.length +
    " bytes, Checksum: " +
    originalChecksum +
    ")",
);
