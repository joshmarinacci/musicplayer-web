import React, { Component } from 'react';
import SelectionListView from './SelectionListView'
import SelectionTable from './SelectionTable'

export default class ArtistsView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            query:[],
            query2:[],
            results:[],
            selectedQuery:null,
            selectedQuery2:null,
            selectedSongs:[],
        }

        this.props.store.getArtists().then((artists)=>{
            this.setState({query:artists})
        })
    }

    queryItemSelected = (item) => {
        this.setState({selectedQuery:item})
        this.props.store.getAlbums(item).then((albums)=>{
            this.setState({query2:albums})
        })
    }
    queryItemSelected2 = (item) => {
        this.setState({selectedQuery2:item})
        this.props.store.getSongsForAlbum(item).then((songs)=>{
            this.setState({results:songs})
        })
    }
    songSelected = (item,e) => {
        const STORE = this.props.store
        if (e.shiftKey) {
            if(STORE.isSelected(item)) {
                STORE.removeFromSelection(item)
            } else {
                STORE.addToSelection(item)
            }
        } else {
            STORE.replaceSelection([item])
        }
        this.setState({selectedSongs:STORE.getSelection()})
    }
    isSelected = (item) => this.props.store.isSelected(item)

    render() {
        return <div className="three-column" style={{ gridColumn:'panel', gridRow:'header/status'}}>
            <header style={{gridColumn:'col1',gridRow:'header'}}>query</header>
            <SelectionListView id='query'
                               template={QueryTemplate}
                               list={this.state.query}
                               onSelect={this.queryItemSelected}
                               selected={this.state.selectedQuery}
                               style={{ gridColumn:'col1', gridRow:'content'}}
            />
            <header style={{gridColumn:'col2',gridRow:'header'}}>query</header>
            <SelectionListView id='query2'
                               template={QueryTemplate}
                               list={this.state.query2}
                               onSelect={this.queryItemSelected2}
                               selected={this.state.selectedQuery2}
                               style={{ gridColumn:'col2', gridRow:'content'}}
            />
            <SelectionTable id="results"
                            makeItemTemplate={(key,row,col)=><SongTableItemTemplate key={key} store={this.props.store} column={col} row={row} onSelect={this.songSelected} app={this.props.app}/>}
                            columns={{'title':'Title', 'artist':'Artist', 'track':'Track', 'album':'Album','picture':'Has Artwork?'}}
                            list={this.state.results}
                            isSelected={this.isSelected}
                            HeaderTemplate={SongTableHeaderTemplate}
                            style={{gridColumn:'col3', gridRow:'header/bottom'}}
            />
        </div>
    }
}


const QueryTemplate = (props) => {
    return <li className={props.selected?"selected":""} onClick={()=>props.onSelect(props.item)}>{props.item.name}</li>
}

const SongTableItemTemplate = (props) => {
    const STORE = props.store
    let val = props.row[props.column]
    if(props.column === 'artist') {
        val = STORE.getArtistById(val).name
    }
    if(props.column === 'album') {
        val = STORE.getAlbumById(val).name
    }
    if(props.column === 'picture') {
        val = props.row.picture?'yes':'no'
    }
    return <td className={props.selected?"selected":""}
               onClick={(e)=>props.onSelect(props.row,e)}
               onDoubleClick={()=>props.app.startSong(props.row)}
    >{val}</td>
}

const SongTableHeaderTemplate = (props) => {
    return <th>{props.columns[props.column]}</th>
}
