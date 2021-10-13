import React, { createRef } from "react";
import HeadTags from "./HeadTags";
import Navbar from "./Navbar";
import { Container,Grid,Sticky,Ref,Visibility,Segment } from "semantic-ui-react";
import nProgress from "nprogress";
import Router, {useRouter} from "next/router";
import SideMenu from "./SideMenu";
import Search from "./Search";
import classes from './Layout.module.css'
import MobileHeader from "./MobileHeader";
import {createMedia} from '@artsy/fresnel'

const appMedia = createMedia({breakpoints: {zero: 0, mobile: 549, tablet: 850, computer: 1080}})
const mediaStyles = appMedia.createMediaStyle() 
const {MediaContextProvider, Media} = appMedia
function Layout({ children, user }) {
  const router = useRouter()
  const messagesRoute= router.pathname==='/messages'
  const contextRef = createRef();
  Router.onRouteChangeStart = () => nProgress.start();
  Router.onRouteChangeComplete = () => nProgress.done();
  Router.onRouteChangeError = () => nProgress.done();
  return (
    <>
      <HeadTags />
      {user ? (
        <>
        <style>{mediaStyles}</style>

        <MediaContextProvider>
        <div style={{marginRight: "1rem", marginLeft: "1rem"}}>
          <Media greaterThanOrEqual='computer'>
        <Ref innerRef={contextRef}>
          <Grid>
          {!messagesRoute? <>
            <Grid.Column className={classes.mobile} width={2}>
            <Sticky context={contextRef}>
              <SideMenu user={user} pc />
            </Sticky>
          </Grid.Column>

          <Grid.Column width={10}>
            <Visibility context={contextRef}>
              {children}
            </Visibility>
          </Grid.Column>

          <Grid.Column width={2} floated='left'>
            <Sticky context={contextRef}>
              <Segment basic>
                <Search />
              </Segment>
            </Sticky>
          </Grid.Column>
          </>: <>
          <Grid.Column floated='left' width={1}/>
          <Grid.Column width={15}>{children}</Grid.Column>
          </>}
          </Grid>
        </Ref>
        </Media>

        <Media between={['tablet', 'computer']}>
        <Ref innerRef={contextRef}>
          <Grid>
          {!messagesRoute? <>
            <Grid.Column className={classes.mobile} width={1}>
            <Sticky context={contextRef}>
              <SideMenu user={user} pc={false} />
            </Sticky>
          </Grid.Column>

          <Grid.Column width={15}>
            <Visibility context={contextRef}>
              {children}
            </Visibility>
          </Grid.Column>
          </>: <>
          <Grid.Column floated='left' width={1}/>
          <Grid.Column width={15}>{children}</Grid.Column>
          </>}
          </Grid>
        </Ref>
        </Media>

        <Media between={['mobile','tablet']}>
        <Ref innerRef={contextRef}>
          <Grid>
          {!messagesRoute? <>
            <Grid.Column className={classes.mobile} width={2}>
            <Sticky context={contextRef}>
              <SideMenu user={user} pc={false} />
            </Sticky>
          </Grid.Column>

          <Grid.Column width={14}>
            <Visibility context={contextRef}>
              {children}
            </Visibility>
          </Grid.Column>
          </>: <>
          <Grid.Column floated='left' width={1}/>
          <Grid.Column width={15}>{children}</Grid.Column>
          </>}
          </Grid>
        </Ref>
        </Media>
        <Media between={['zero', 'mobile']}>
            <MobileHeader user={user} />
            <Grid style={{marginTop: '2rem'}}>
              <Grid.Column>{children}</Grid.Column>
            </Grid>
        </Media>
        </div>
        </MediaContextProvider>
        </>
      ) : (
        <>
          <Navbar />
          <Container style={{ paddingTop: "1rem" }} text>
            {children}
          </Container>
        </>
      )}
    </>
  );
}

export default Layout;
