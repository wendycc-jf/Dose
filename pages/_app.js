import '../styles/global.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Router from 'next/router';
import App from 'next/app';
import Cookies from 'cookies'

export default function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />
}

MyApp.getInitialProps = async (appContext) => {
    const cookies = new Cookies(appContext.ctx.req, appContext.ctx.res)
   // calls page's `getInitialProps` and fills `appProps.pageProps`
   const appProps = await App.getInitialProps(appContext);

   // Allowed pages without auth
   const noAuthPages = ['/login', '/_error'];
   
   for (const noAuthPage of noAuthPages) {
       if (appContext.ctx.pathname == noAuthPage) {
           return { ...appProps }
       }
   }

   // Only runs server side
   if (appContext.ctx.res) {
       let mainToken = appContext.ctx.req.cookies.token;
       let refreshToken = appContext.ctx.req.cookies.refreshToken;
       
       // Check if accessToken to mainServer is valid
       const res = await fetch(`http://localhost:${process.env.SERVER_PORT}${process.env.SERVER_SUB_FOLDER}/api/auth/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: mainToken
            })
        });
        const result = await res.json();

        // If it's valid, render page
        if (result.valid) {
           return { ...appProps }
        } else {
            // If it's not valid, try to get a new with the refreshToken
            const refreshTokenRes = await fetch(`http://localhost:${process.env.SERVER_PORT}${process.env.SERVER_SUB_FOLDER}/api/auth/refreshToken`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: mainToken,
                    refreshToken: refreshToken
                })
            });
            const refreshTokenResult = await refreshTokenRes.json();
            // If we managed to get a new accessToken, save it and the new refreshToken
            if (refreshTokenResult.status === 'success') {
                cookies.set('token', refreshTokenResult.token);
                cookies.set('refreshToken', refreshTokenResult.refreshToken);
                console.log("OK");
                return { ...appProps }
            } else {
                // If we couldn't get a new token, clear the cookies and send to login page
                cookies.set('token', null);
                cookies.set('refreshToken', null)
                appContext.ctx.res.writeHead(302, { Location: `${process.env.SERVER_SUB_FOLDER}/login` });
                appContext.ctx.res.end();
                return {};

            }

        }
   } else {
       // Todo: Same check if client side
       console.log("klient");
        return { ...appProps }
   }
}