import Search from '../components/Layout/Search'
import {Header} from 'semantic-ui-react'
const SearchPage=()=>{

    return <div style={{textAlign: 'left'}}>
        <Header icon='search' content='Search' size='large' />
        <Search />
    </div>
}
export default SearchPage