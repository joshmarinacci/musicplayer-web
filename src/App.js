import React, { Component } from 'react';
import './App.css';
import 'font-awesome/css/font-awesome.min.css'
import MusicStore from './MusicStore'
import {Dialog, DialogContainer, DialogManager} from "appy-comps"
import MetadataEditorDialog from './MetadataEditorDialog'
import SelectionTable from './SelectionTable'
import DeleteDialog from './DeleteDialog'
import AlbumEditorDialog from './AlbumEditorDialog'
import SelectionListView from './SelectionListView'
import ArtistsView from './ArtistsView'
import AlbumsView from './AlbumsView'

const STORE = new MusicStore()

class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            sources: [
                'artists',
                'albums',
                'songs'
            ],
            selectedSource:null,
            playing:false,
            currentTime:0,
            currentPlaylist:[],
            currentIndex:-1,
        }
    }

    sourcesItemSelected = (item) => {
        this.setState({selectedSource:item})
        if(item === 'artists') {
            return STORE.getArtists().then( artists => this.setState({query:artists}))
        }
        if(item === 'albums') {
            return STORE.getAllAlbums().then( albums => this.setState({query2:albums}))
        }
        if(item === 'songs') {
            return STORE.getAllSongs().then( songs => this.setState({results:songs}))
        }
    }
    refreshSongs = () => {
        STORE.getSongsForAlbumForArtist(this.state.selectedQuery,this.state.selectedQuery2)
            .then(songs => this.setState({results:songs}) )
    }
    togglePlaying = () => {
        if(this.state.playing) {
            this.stopSong()
        } else {
            const currentPlaylist = this.state.results
            const currentIndex = this.state.results.indexOf(STORE.getFirstSelectedSong())
            const song = currentPlaylist[currentIndex]
            console.log(currentPlaylist, currentIndex, song)
            this.setState({currentPlaylist: currentPlaylist, currentIndex: currentIndex})
            this.startSong(song)
        }
    }
    navPrevSong = () => {
        const prev = this.state.currentIndex-1
        if(prev >= 0 && prev < this.state.currentPlaylist.length) {
            this.setState({currentIndex: prev})
            this.audio.pause()
            this.startSong(this.state.currentPlaylist[prev])
        } else {
            console.log("invalid index",prev)
            this.stopSong()
        }
    }
    navNextSong = () => {
        const next = this.state.currentIndex+1
        if(next >= 0 && next < this.state.currentPlaylist.length) {
            this.setState({currentIndex: next})
            this.audio.pause()
            this.startSong(this.state.currentPlaylist[next])
        } else {
            console.log("invalid index",next)
            this.stopSong()
        }
    }
    startSong = (song) => {
        this.audio.src = STORE.getSongURL(song)
        this.audio.play().then(() => this.setState({playing: true, currentTime:0}))
    }
    stopSong = () => {
        this.audio.pause()
        this.setState({playing:false})
    }
    render() {
        return (
            <div id='grid'>
                <audio ref={(ref)=>this.audio = ref}
                       onPlaying={(e)=>console.log("playing",e.target)}
                       onPause={(e)=>console.log("paused")}
                       onEnded={(e)=>this.navNextSong()}
                       onTimeUpdate={e =>this.setState({currentTime:e.target.currentTime})}
                />
              <div className="toolbar">
                  <button className="fa fa-fast-backward" onClick={this.navPrevSong}/>
                  {this.renderPlayPauseButton(this.state.playing)}
                  <button className="fa fa-fast-forward" onClick={this.navNextSong}/>
                <i className="spacer"/>
                  {this.renderInfoPanel()}
                  <i className="spacer"/>
                <input type="search"/>
              </div>

                <header>sources</header>
                <SelectionListView id='sources'
                                   list={this.state.sources}
                                   onSelect={this.sourcesItemSelected}
                                   template={SourceTemplate}
                                   selected={this.state.selectedSource}
                />
                {this.renderSelectedView(this.state.selectedSource)}
                {this.renderStatusBar()}
                <DialogContainer/>
            </div>
        );
    }

    renderPlayPauseButton(playing) {
        if(playing) {
            return <button className="fa fa-pause" onClick={this.togglePlaying}/>
        } else {
            return <button className="fa fa-play" onClick={this.togglePlaying}/>
        }
    }

    renderInfoPanel() {
        if(!this.state.currentPlaylist) return <div className="info-panel"></div>
        const song = this.state.currentPlaylist[this.state.currentIndex]
        if(!song)  return <div className="info-panel"></div>
        return <div className="info-panel">
            <label>{song.title}</label>
            <label>{STORE.getArtistById(song.artist).name}</label>
            <label>{STORE.getAlbumById(song.album).name}</label>
            <label>{toTime(this.audio.duration)} {toTime(this.state.currentTime)}</label>
        </div>
    }

    renderStatusBar() {
        return <div className="status">
            {this.state.playing?'playing':'paused'}
            <button onClick={this.editSelection}>Edit</button>
            <button onClick={this.deleteSelection}>Delete</button>
            <button onClick={this.editSelectedAlbum}>edit album</button>
            <button onClick={this.deleteSelectedAlbum}>Delete Album</button>
            <button onClick={this.deleteSelectedArtist}>Delete Artist</button>
        </div>
    }

    editSelection = () =>  DialogManager.show(<MetadataEditorDialog store={STORE}/>)
    deleteSelection = () => DialogManager.show(<DeleteDialog store={STORE} onComplete={this.refreshSongs}/>)
    editSelectedAlbum = () =>  DialogManager.show(<AlbumEditorDialog store={STORE} album={this.state.selectedQuery2} onComplete={this.refreshAlbums}/>)
    deleteSelectedArtist = () => {
        const artistId = this.state.selectedQuery
        STORE.getAlbums(artistId).then(albums=>{
            if(albums.length === 0) STORE.deleteArtistById(artistId)
        })
    }
    deleteSelectedAlbum = () => {
        const albumId = this.state.selectedQuery2
        STORE.getSongsForAlbum(albumId).then(songs=>{
            if(songs.length === 0) STORE.deleteAlbumById(albumId)
        })
    }

    renderSelectedView(source) {
        if(source === 'artists') return <ArtistsView store={STORE} app={this}/>
        if(source === 'albums') return <AlbumsView store={STORE}/>
        // if(source === 'songs') return <SongsView/>
        // if(source === 'maint') return <MaintView/>
        return <div style={{
            gridColumn:'panel',
            gridRow:'content'
        }}>nothing is selected</div>
    }
}

function toTime(dur){
    if(isNaN(dur)) return '0'
    const min = Math.floor(dur/60)+''
    let sec = Math.floor(dur-min*60)+''
    if(sec.length < 2) sec = '0'+sec
    return `${min}:${sec}`
}

const SourceTemplate = (props) => {
    return <li className={props.selected?"selected":""} onClick={()=>props.onSelect(props.item)}>{props.item}</li>
}

export default App;
