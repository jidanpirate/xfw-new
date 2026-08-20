//  4. 密码验证（SHA256）
        // ================================================================

        const PASSWORD_HASH = '38f7d85290e925c0119589448651a7134a0361d12190247f440ba05044f83aa5';

        async function verifyPassword(input) {
            try {
                const msgBuffer = new TextEncoder().encode(input.trim());
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                return hashHex === PASSWORD_HASH;
            } catch (_) { return false; }
        }

        // ================================================================
