import React, { Component } from 'react';
import MusicStore from './MusicStore'
import {Dialog, DialogContainer, DialogManager} from "appy-comps"


export default class  MetadataEditorDialog extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }

        const song = this.props.store.getFirstSelectedSong()
        if(song) {
            Object.keys(song).forEach((key) => {
                this.state[key] = song[key]
            })
            const artist = this.props.store.findArtistById(song.artist)
            this.state.artistName = artist.name
            const album = this.props.store.findAlbumById(song.album)
            this.state.albumName = album.name
        }
    }
    render() {
        const song = this.props.store.getFirstSelectedSong()
        if(!song) {
            return <Dialog visible={true}>
                <p>No songs selected</p>
                <button onClick={this.cancel}>cancel</button>
                <button onClick={this.save}>save</button>
            </Dialog>
        }
        return <Dialog visible={true}>
            <div className="form-horizontal">
                <label>Song Title</label>    <input type="text" value={this.state.title} onChange={this.editTitle}/>
                <label>Artist</label>        <input type="text" value={this.state.artistName} onChange={this.editArtist}/>
                <label>Album</label>         <input type="text" value={this.state.albumName} onChange={this.editAlbum}/>
                <label>type</label>          <span>{song.mimeType}</span>
                <label>track number</label>          <span>{song.track}</span> of <span>foo</span>
                <label>filesize</label>          <span>{formatBytes(song.fileSizeBytes)}</span>
            </div>
            <button onClick={this.cancel}>cancel</button>
            <button onClick={this.save}>save</button>
        </Dialog>
    }


    cancel = () => DialogManager.hide()
    save = () => {
        const fields = {}
        fields.title = this.state.title
        const artist_id = this.props.store.findArtistByName(this.state.artistName)
        if(!artist_id) {
            console.log("no artist by this name")
            return
        } else {
            console.log("got the artist!",artist_id)
            fields.artist = artist_id
        }

        const album_id = this.props.store.findAlbumByName(this.state.albumName)
        if(!album_id) {
            console.log("no album by this name")
            return
        } else {
            console.log("got the album!",album_id)
            fields.album = album_id
        }
        this.props.store.updateSongFields(this.props.store.getFirstSelectedSong(),fields)
        DialogManager.hide()
    }

    editTitle = (e) => this.setState({title:e.target.value})
    editArtist = (e) => this.setState({artistName:e.target.value})
    editAlbum = (e) => this.setState({albumName:e.target.value})
}


function formatBytes(len) {
    return (len/1024/1024).toFixed(2) + ' MB'
}