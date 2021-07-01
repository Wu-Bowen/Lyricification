import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useAuth(code) {
    const [accessToken, setAccessToken] = useState();
    const [refreshToken, setRefreshToken] = useState();
    const [expiresIn, setExpiresIn] = useState();
    // const URL = process.env.NODE_ENV
    // ? 'http://localhost:3001' 
    // : 'https://lyricification.herokuapp.com'


    useEffect(() => {
        axios.post(`https://lyricification.herokuapp.com/login`, {
            code,
        })
            .then(res => {
                setAccessToken(res.data.accessToken);
                setRefreshToken(res.data.refreshToken);
                setExpiresIn(res.data.expiresIn);
                window.history.pushState({}, null, '/')
            })
            .catch(() => {
                window.location = '/'
            })
    }, [code])

    useEffect(() => {
        if (!refreshToken || !expiresIn) return;
        const interval = setInterval(() => {
            axios.post(`${URL}/refresh`, {
                refreshToken,
            })
                .then(res => {
                    setAccessToken(res.data.accessToken)
                    setExpiresIn(res.data.expiresIn)
                })
                .catch(() => {
                    window.location = '/'
                })
        }, (expiresIn - 60) * 1000)
        return () => clearInterval(interval);
    }, [refreshToken, accessToken, expiresIn])
    return accessToken
}
