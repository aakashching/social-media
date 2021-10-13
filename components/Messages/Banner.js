import {Segment,Grid,Image, Icon} from 'semantic-ui-react'
const Banner=({bannerData, connectedUsers})=>{
    const {name,profilePicUrl, userId} = bannerData
    const isOnline= connectedUsers.length> 0 && connectedUsers.filter(user=> user.userId === userId.toString()).length>0
   
    return <>
        <Segment color='teal' attached='top'>
            <Grid>
                <Grid.Column floated='left' width={14}>
                    <h4>
                        <Image avatar src={profilePicUrl} />
                        {name}
                        {isOnline && <span style={{color: '#555', fontWeight: 'lighter', position: 'absolute', top: '32px', left: '40px', fontSize: '0.8rem'}}><Icon name='circle' size='small' color='green' />active now</span>}
                    </h4>
                    
                </Grid.Column>
            </Grid>
        </Segment>
    </>
}

export default Banner