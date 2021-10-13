import App from "next/app";
import axios from "axios";
import { parseCookies, destroyCookie } from "nookies";
import baseUrl from "../utils/baseUrl";
import { redirectUser } from "../utils/authUser";
import Layout from "../components/Layout/Layout";
import "react-toastify/dist/ReactToastify.css";
import "semantic-ui-css/semantic.min.css";

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    const { token } = parseCookies(ctx);

    const protectedRoutes =
      ctx.pathname === "/" ||
      ctx.pathname === "/[username]" ||
      ctx.pathname === "/notifications" || ctx.pathname === '/post/[postId]' || ctx.pathname === '/messages' || ctx.pathname === '/search'

    if (!token) {
      protectedRoutes && redirectUser(ctx, "/login");
    } else {
      if (Component.getInitialProps) {
        pageProps = await Component.getInitialProps(ctx);
      }

      try {
        const res = await axios.get(`${baseUrl}/api/auth`, {
          headers: { Authorization: token },
        });
        const { user, userFollowStats } = res.data;

        if (user) {
          !protectedRoutes && redirectUser(ctx, "/");
        }
        pageProps.user = user;
        pageProps.userFollowStats = userFollowStats;
      } catch (error) {
        destroyCookie(ctx, "token");
        redirectUser(ctx, "/login");
      }
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <Layout {...pageProps}>
        <Component {...pageProps} />
      </Layout>
    );
  }
}
export default MyApp;

// function MyApp({ Component, pageProps }) {
//     return <Layout {...pageProps}>
//     <Component {...pageProps} />
// </Layout>
//   }

//   // Only uncomment this method if you have blocking data requirements for
//   // every single page in your application. This disables the ability to
//   // perform automatic static optimization, causing every page in your app to
//   // be server-side rendered.
//   //
//   MyApp.getInitialProps = async ({Component,ctx}) => {
//       let appProps = {}
//     // calls page's `getInitialProps` and fills `appProps.pageProps`
//     const {token} = parseCookies(ctx)

//         const protectedRoutes = ctx.pathname === '/'

//         if(!token) {
//             protectedRoutes && redirectUser(ctx,'/login')

//         } else {
//             if(App.getInitialProps) {
//                 appProps = await App.getInitialProps(ctx)
//             }
//         }
//         try {
//             const res = await axios.get(`${baseUrl}/api/auth`, {headers: {Authorization: token}})
//             const {user, userFollowStats} = res.data

//             if(user) {!protectedRoutes && redirectUser(ctx,'/')}
//             appProps.pageProps.user = user
//             appProps.pageProps.userFollowStats = userFollowStats
//         } catch (error) {
//             destroyCookie(ctx,'token')
//             redirectUser(ctx,'/login')
//         }

//     return { ...appProps }
//   }
//   export default MyApp
