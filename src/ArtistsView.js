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
    remove(item) {
        const n = this.data.indexOf(item)
        if(n >= 0) {
            this.data = this.data.filter(it => it !== item)
            this.fireChange()
        }
    }
    toggle(item) {
        if(this.isSelected(item)) {
            this.remove(item)
        } else {
            this.add(item)
        }
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
    selectNext(list) {
        const found = list.find(it => this.isSelected(it))
        let index = list.indexOf(found)
        if(index >= 0 && index+1 < list.length) {
            index = index+1
            this.set(list[index])
        }
    }
    selectPrev(list) {
        const found = list.find(it => this.isSelected(it))
        let index = list.indexOf(found)
        if(index >= 1) {
            index = index-1
            this.set(list[index])
        }
    }
}

export default class ArtistsView extends Component {
    constructor(props) {
        super(props)

        this.artistSelection =  new ListSelection()
        this.artistSelection.onChange((sel)=> {
            this.setState({artists:sel})
            this.props.store.getAlbumsForArtists(sel.data)
                .then((albums)=>this.setState({query2:albums, results:[]}))
        })
        this.albumSelection = new ListSelection()

        this.state = {
            query:[],
            query2:[],
            results:[],
            selectedArtists:this.artistSelection,
            selectedAlbums:this.albumSelection,
            selectedSongs:[],
        }
        this.albumSelection.onChange((sel)=>{
            this.setState({albums:sel})
            this.props.store.getSongsForAlbums(sel.data)
                .then((songs)=>this.setState({results:songs}))
        })
        this.columns = {'title':'Title', 'artist':'Artist', 'track':'Track', 'album':'Album','picture':'Has Artwork?'}
        this.props.store.getArtists().then(artists => this.setState({query:artists}))
    }

    artistSelected = (artist, e) => {
        if(e.metaKey) {
            this.artistSelection.toggle(artist)
        } else {
            this.artistSelection.set(artist)
        }
    }
    albumSelected = (album, e) => {
        if(e.metaKey) {
            this.state.selectedAlbums.toggle(album)
        } else {
            this.state.selectedAlbums.set(album)
        }
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
        if(this.state.selectedAlbums.data.length > 1) {
            const actions = [
                {
                    title:'merge',
                    onClick: this.mergeAlbums
                }
            ]
            PopupManager.show(<PopupMenu list={actions}/>, e.target)
        } else {
            const actions = [
                {
                    title: 'edit',
                    onClick: this.editAlbum
                },
                {
                    title:'play',
                    onClick: this.playAlbum
                }
            ]
            PopupManager.show(<PopupMenu list={actions}/>, e.target)
        }
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
        DialogManager.show(<AlbumEditorDialog store={this.props.store}
                                              album={this.state.selectedAlbums.get()[0]}
                                              onComplete={this.refreshAlbums}/>)
    }
    playAlbum = () => {
        PopupManager.hide()
        const album = this.state.selectedAlbums.get()[0]
        this.props.app.playAlbum(album)
    }
    editArtist = () => {
        PopupManager.hide()
        DialogManager.show(<ArtistEditorDialog store={this.props.store}
                                               artist={this.state.selectedArtists.get()[0]}
                                               onComplete={this.refreshArtists}/>)
    }
    mergeArtists = () => {
        PopupManager.hide()
        this.props.store.mergeArtists(this.state.selectedArtists.get())
            .then((artist)=> this.refreshArtists().then(()=>{
                const one = this.state.query.find(a => a._id === artist._id)
                this.state.selectedArtists.set(one)
            }))
    }
    mergeAlbums = () => {
        PopupManager.hide()
        this.props.store.mergeAlbums(this.state.selectedAlbums.get())
            .then((album)=> this.refreshAlbums().then(()=>{
                const one = this.state.query.find(a => a._id === album._id)
                console.log("setting the one",one)
                this.state.selectedAlbums.set(one)
            }))
    }

    refreshArtists = () => this.props.store.getArtists()
            .then(artists => this.setState({query:artists}))
    refreshAlbums = () => this.props.store.getAlbumsForArtists(this.state.selectedArtists.data)
            .then(albums => this.setState({query2:albums}))

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
        const selected = this.state.selectedAlbums.isSelected(album)
        return (<li key={i}
                   className={selected?"selected":""}
                   onClick={(e)=>this.albumSelected(album,e)}
                   onContextMenu={this.onAlbumContextMenu}
        >
            {album.name}
            <img src={this.props.store.getArtworkURLForAlbum(album)} width={100}/>
        </li>)
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
            currentList={this.state.results}
        />
    }
    render() {
        return <div className="three-column" style={{ gridColumn:'panel', gridRow:'header/status'}}>
            <header style={{gridColumn:'col1',gridRow:'header'}}>Artists</header>
            <SelectionListView id='query'
                               makeTemplate={this.renderArtistItem}
                               list={this.state.query}
                               selection={this.artistSelection}
                               style={{ gridColumn:'col1', gridRow:'content'}}
            />
            <header style={{gridColumn:'col2',gridRow:'header'}}>Albums</header>
            <SelectionListView id='query2'
                               makeTemplate={this.renderAlbumItem}
                               list={this.state.query2}
                               selection={this.albumSelection}
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
               onDoubleClick={()=>props.app.playNewSong(props.row, props.currentList)}
    >{val}</td>
}

const SongTableHeaderTemplate = (props) => {
    return <th>{props.columns[props.column]}</th>
}
