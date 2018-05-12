import React, { Component } from 'react';
import SelectionListView from './SelectionListView'
import SelectionTable from './SelectionTable'

export default class AlbumsView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            query:[],
            results:[],
            selectedQuery:null,
        }
        this.props.store.getAllAlbums().then(albums => this.setState({query:albums}))
    }
    queryItemSelected = (item) => {
        this.setState({selectedQuery:item})
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
        return <div className="two-column" style={{ gridColumn:'panel', gridRow:'header/status'}}>
            <header style={{gridColumn:'col1',gridRow:'header'}}>query</header>
            <SelectionListView id='query'
                               makeTemplate={(item,i) => <QueryTemplate
                                   key={i}
                                   selected={item === this.state.selectedQuery}
                                   item={item}
                                   onSelect={this.queryItemSelected}
                               />}
                               list={this.state.query}
                               style={{ gridColumn:'col1', gridRow:'content'}}
            />
            <SelectionTable id="results"
                            makeItemTemplate={(key,row,col)=><SongTableItemTemplate
                                key={key}
                                store={this.props.store}
                                column={col}
                                row={row}
                                onSelect={this.songSelected}
                                app={this.props.app}
                                selected={this.isSelected(row)}
                            />}
                            columns={{'title':'Title', 'artist':'Artist', 'track':'Track', 'album':'Album','picture':'Has Artwork?'}}
                            list={this.state.results}
                            // onSelect={this.songSelected}
                            // isSelected={this.isSelected}
                            HeaderTemplate={SongTableHeaderTemplate}
                            // app={this}
                            style={{gridColumn:'col2', gridRow:'header/bottom'}}
            />
        </div>
    }
}

const QueryTemplate = (props) => {
    return <li className={props.selected?"selected":""}
               onClick={()=>props.onSelect(props.item)}
               onContextMenu={(e)=>props.onContextMenu(e)}
    >{props.item.name}</li>
}
const SongTableItemTemplate = (props) => {
    const STORE = props.store
    let val = props.row[props.column]
    if(props.column === 'artist') {
        const artist = STORE.getArtistById(val)
        if(artist) val = artist.name
        // val = STORE.getArtistById(val).name
    }
    if(props.column === 'album') {
        const album = STORE.getAlbumById(val)
        if(album) val = album.name
        // val = STORE.getAlbumById(val).name
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
