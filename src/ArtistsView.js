import React, { Component } from 'react';
import SelectionListView from './SelectionListView'
import SelectionTable from './SelectionTable'
import {DialogManager, PopupManager} from 'appy-comps'
import AlbumEditorDialog from './AlbumEditorDialog'
import ArtistEditorDialog from './ArtistEditorDialog'
import PopupMenu from './components/PopupMenu'

class ListSelection {
    constructor() {
        this.data = []
        this.listeners = []
    }
    onChange(cb) {
        this.listeners.push(cb)
    }
    fireChange() {
        this.listeners.forEach(cb => cb(this))
    }
    add(item) {
        this.data.push(item)
        this.fireChange()
    }
    get() {
        return this.data.slice()
    }
    set(item) {
        this.data = [item]
        this.fireChange()
    }
    isSelected(item) {
        return this.data.indexOf(item) >= 0
    }
}

export default class ArtistsView extends Component {
    constructor(props) {
        super(props)

        this.artistSelection =  new ListSelection()
        this.artistSelection.onChange((sel)=> {
            this.setState({artists:sel})
            this.props.store.getAlbumsForArtists(this.state.selectedArtists.data)
                .then((albums)=>this.setState({query2:albums}))
        })

        this.state = {
            query:[],
            query2:[],
            results:[],
            selectedArtists:this.artistSelection,
            selectedAlbum:null,
            selectedSongs:[],
        }
        this.columns = {'title':'Title', 'artist':'Artist', 'track':'Track', 'album':'Album','picture':'Has Artwork?'}
        this.props.store.getArtists().then(artists => this.setState({query:artists}))
    }

    artistSelected = (artist, e) => {
        if(e.shiftKey) {
            this.artistSelection.add(artist)
        } else {
            this.artistSelection.set(artist)
        }
    }
    albumSelected = (album) => {
        this.setState({selectedAlbum:album})
        this.props.store.getSongsForAlbum(album).then((songs)=>this.setState({results:songs}))
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

    onAlbumContextMenu = (e) => {
        e.preventDefault()
        const actions = [
            {
                title:'edit',
                onClick: this.editAlbum
            }
        ]
        PopupManager.show(<PopupMenu list={actions}/>,e.target)
    }
    onArtistContextMenu = (e) => {
        e.preventDefault()
        if(this.state.selectedArtists.data.length > 1) {
            const actions = [
                {
                    title: 'merge',
                    onClick: this.mergeArtists
                }
            ]
            PopupManager.show(<PopupMenu list={actions}/>, e.target)
        } else {
            const actions = [
                {
                    title: 'edit',
                    onClick: this.editArtist
                }
            ]
            PopupManager.show(<PopupMenu list={actions}/>, e.target)
        }
    }
    editAlbum = () => {
        PopupManager.hide()
        DialogManager.show(<AlbumEditorDialog store={this.props.store} album={this.state.selectedAlbum} onComplete={this.refreshAlbums}/>)
    }
    editArtist = () => {
        PopupManager.hide()
        DialogManager.show(<ArtistEditorDialog store={this.props.store} artist={this.state.selectedArtist} onComplete={this.refreshArtists}/>)
    }
    mergeArtists = () => {
        PopupManager.hide()
        this.props.store.mergeArtists(this.state.selectedArtists.get()).then((artist)=>{
            this.refreshArtists().then(()=>{
                const one = this.state.query.find(a => a._id === artist._id)
                this.state.selectedArtists.set(one)
            })
        })
    }

    refreshArtists = () => {
        return this.props.store.getArtists().then(artists => this.setState({query:artists}))
    }

    renderArtistItem = (artist,i) => {
        return <QueryTemplate
            key={i}
            selected={this.artistSelection.isSelected(artist)}
            item={artist}
            onSelect={this.artistSelected}
            onContextMenu={this.onArtistContextMenu}
            />
    }
    renderAlbumItem = (album,i) => {
        return <QueryTemplate
            key={i}
            selected={album === this.state.selectedAlbum}
            item={album}
            onSelect={this.albumSelected}
            onContextMenu={this.onAlbumContextMenu}
        />
    }
    renderSongItem = (key,row,col) => {
        return <SongTableItemTemplate
            key={key}
            store={this.props.store}
            column={col}
            row={row}
            onSelect={this.songSelected}
            app={this.props.app}
            selected={this.isSelected(row)}
        />
    }
    render() {
        return <div className="three-column" style={{ gridColumn:'panel', gridRow:'header/status'}}>
            <header style={{gridColumn:'col1',gridRow:'header'}}>Artists</header>
            <SelectionListView id='query'
                               makeTemplate={this.renderArtistItem}
                               list={this.state.query}
                               style={{ gridColumn:'col1', gridRow:'content'}}
            />
            <header style={{gridColumn:'col2',gridRow:'header'}}>Albums</header>
            <SelectionListView id='query2'
                               makeTemplate={this.renderAlbumItem}
                               list={this.state.query2}
                               style={{ gridColumn:'col2', gridRow:'content'}}
            />
            <SelectionTable id="results"
                            makeItemTemplate={this.renderSongItem}
                            columns={this.columns}
                            list={this.state.results}
                            HeaderTemplate={SongTableHeaderTemplate}
                            style={{gridColumn:'col3', gridRow:'header/bottom'}}
            />
        </div>
    }
}


const QueryTemplate = (props) => {
    return <li className={props.selected?"selected":""}
               onClick={(e)=>props.onSelect(props.item,e)}
               onContextMenu={(e)=>props.onContextMenu(e)}
    >{props.item.name}</li>
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
