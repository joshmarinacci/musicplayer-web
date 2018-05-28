import React, { Component } from 'react';
import {Dialog, DialogManager} from "appy-comps"

export default class AlbumEditorDialog extends Component {
    constructor(props) {
        super(props)
        const album = this.props.store.getAlbumById(props.album._id)
        this.state = {
            picture:null,
            name:album.name,
            selectedFiles:null,
        }

        if(this.props.album.picture) {
            this.state.picture = this.props.album.picture
        }
    }
    editedName = (e) => this.setState({name:e.target.value})
    artworkSelected = (e) => this.setState({selectedFiles:e.target.files})

    render() {
        const store = this.props.store
        const album = store.getAlbumById(this.props.album._id)
        return <Dialog visible={true}>
            <h3>editing album <input type="text" value={this.state.name} onChange={this.editedName}/></h3>
            <div>
                <img style={{
                    maxWidth: '300px',
                    maxHeight: '300px'
                }} src={store.getArtworkURLForAlbum(album)}/>
                <div>
                    <button onClick={this.fetchSongsArtwork}>load artwork from songs</button>
                    <input type='file' onChange={this.artworkSelected}/>
                </div>
            </div>
            <button onClick={this.cancel}>cancel</button>
            <button onClick={this.okay} disabled={this.nothingChanged()}>save changes</button>
        </Dialog>
    }

    changedArtwork = () => this.state.picture !== this.props.album.picture
    changedFile    = () => this.state.selectedFiles !== null
    changedName    = () => this.state.name !== this.props.album.name
    nothingChanged = () => !this.changedArtwork() && !this.changedName() && !this.changedFile()

    cancel = () => DialogManager.hide()

    okay = () => {
        DialogManager.hide()
        const store = this.props.store
        const files = this.state.selectedFiles
        const album = this.props.album
        if(files !== null && files.length > 0) {
            store.uploadArtwork(files[0])
                .then(resp => store.updateAlbumFields(album, { artwork:resp.artwork._id, name:this.state.name}))
                .then(()=>store.refreshAlbumById(album._id))
        } else {
            store.updateAlbumFields(album, {
                picture: this.state.picture,
                name: this.state.name,
                selectedFiles: this.state.selectedFiles
            })
                .then(()=>store.refreshAlbumById(album._id))
                .then(this.props.onComplete)
        }
    }

    fetchSongsArtwork = () => {
        this.props.store.getSongsForAlbum(this.props.album).then((songs)=>{
            const song = songs.find(s=>s.picture !== undefined)
            if(song) this.setState({picture:song.picture})
        })
    }

}