import React, { Component } from 'react';
import {PopupManager, DialogManager} from "appy-comps"
import SelectionListView from './SelectionListView'
import SelectionTable from './SelectionTable'
import AlbumEditorDialog from './AlbumEditorDialog'

export default class AlbumsView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            albums:[],
            songs:[],
            selectedAlbum:null,
        }
        this.props.store.getAllAlbums().then(albums => this.setState({albums:albums}))
    }
    albumSelected = (album) => {
        this.setState({selectedAlbum:album})
        this.props.store.getSongsForAlbum(album).then((songs)=>{
            this.setState({songs:songs})
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
    isSelected = (song) => this.props.store.isSelected(song)
    onAlbumContextMenu = (e) => {
        e.preventDefault()
        PopupManager.show(<ul><li><button onClick={this.editAlbum}>edit</button></li></ul>,e.target)
    }
    editAlbum = () => {
        PopupManager.hide()
        DialogManager.show(<AlbumEditorDialog store={this.props.store} album={this.state.selectedAlbum} onComplete={this.refreshAlbums}/>)
    }
    renderAlbumItem = (album,i) => <QueryTemplate
        key={i}
        selected={album === this.state.selectedAlbum}
        item={album}
        onSelect={this.albumSelected}
        onContextMenu={this.onAlbumContextMenu}
    />

    renderSongItem = (key, row, col) => <SongTableItemTemplate
        key={key}
        store={this.props.store}
        column={col}
        row={row}
        onSelect={this.songSelected}
        app={this.props.app}
        selected={this.isSelected(row)}
    />

    render() {
        const columns = {'title':'Title', 'artist':'Artist', 'track':'Track', 'album':'Album','picture':'Has Artwork?'}
        return <div className="two-column" style={{ gridColumn:'panel', gridRow:'header/status'}}>
            <header style={{gridColumn:'col1',gridRow:'header'}}>query</header>
            <SelectionListView id='query'
                               makeTemplate={this.renderAlbumItem}
                               list={this.state.albums}
                               style={{ gridColumn:'col1', gridRow:'content'}}
            />
            <SelectionTable id="results"
                            makeItemTemplate={this.renderSongItem}
                            columns={columns}
                            list={this.state.songs}
                            HeaderTemplate={SongTableHeaderTemplate}
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
