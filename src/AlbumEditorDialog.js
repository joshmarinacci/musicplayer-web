import React, { Component } from 'react';
import {Dialog, DialogManager} from "appy-comps"

export default class AlbumEditorDialog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            picture:null
        }

        if(this.props.album.picture) {
            this.state.picture = this.props.album.picture
        }
    }
    render() {
        const album = this.props.album
        return <Dialog visible={true}>
            <h3>editing album {album.name}</h3>
            <div>
                <img style={{
                    maxWidth: '300px',
                    maxHeight: '300px'
                }} src={this.props.store.getArtworkURL(this.state.picture)}/>
                <div>
                    <button onClick={this.fetchSongsArtwork}>load artwork from songs</button>
                </div>
            </div>
            <button onClick={this.cancel}>cancel</button>
            <button onClick={this.okay} disabled={!this.changedArtwork()}>save changes</button>
        </Dialog>
    }

    changedArtwork = ()=> {
        return this.state.picture !== this.props.album.picture
    }

    cancel = () => DialogManager.hide()

    okay = () => {
        DialogManager.hide()
        this.props.store.updateAlbumFields(this.props.album,{picture:this.state.picture}).then(this.props.onComplete)
    }

    fetchSongsArtwork = () => {
        this.props.store.getSongsForAlbum(this.props.album).then((songs)=>{
            const song = songs.find(s=>s.picture !== undefined)
            if(song) this.setState({picture:song.picture})
        })
    }

}