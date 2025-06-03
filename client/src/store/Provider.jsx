import Context from './Context';
import CryptoJS from 'crypto-js';

import cookies from 'js-cookie';

import { useEffect, useState } from 'react';
import { requestAuth } from '../Config/request';

export function Provider({ children }) {
    const [dataUser, setDataUser] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchAuth = async () => {
        try {
            setLoading(true);
            const res = await requestAuth();
            const bytes = CryptoJS.AES.decrypt(res.metadata.auth, import.meta.env.VITE_SECRET_CRYPTO);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            const user = JSON.parse(originalText);
            setDataUser(user);
        } catch (error) {
            console.error('Authentication error:', error);
            // Clear invalid cookies if authentication fails
            cookies.remove('logged');
            cookies.remove('token');
            cookies.remove('refreshToken');
            setDataUser({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = cookies.get('logged');

        if (!token) {
            setLoading(false);
            return;
        }
        fetchAuth();
    }, []);

    return (
        <Context.Provider
            value={{
                dataUser,
                fetchAuth,
                loading
            }}
        >
            {children}
        </Context.Provider>
    );
}
