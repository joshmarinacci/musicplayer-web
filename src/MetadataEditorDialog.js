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
        }
    }
    render() {
        const song = this.props.store.getFirstSelectedSong()
        console.log("editing song",song)
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
                <label>Artist</label>        <span>artist</span>
                <label>Album</label>         <span>album</span>
                <label>type</label>          <span>{song.mimeType}</span>
                <label>track number</label>          <span>{song.track}</span> of <span>foo</span>
                <label>filesize</label>          <span>{formatBytes(song.fileSizeBytes)}</span>
            </div>
            <button onClick={this.cancel}>cancel</button>
            <button onClick={this.save}>save</button>
        </Dialog>
    }


    cancel = () => {
        DialogManager.hide()
    }
    save = () => {
        const fields = {}
        fields.title = this.state.title
        this.props.store.updateSongFields(this.props.store.getFirstSelectedSong(),fields)
        DialogManager.hide()
    }

    editTitle = (e) => {
        this.setState({title:e.target.value})
    }

}


function formatBytes(len) {
    return (len/1024/1024).toFixed(2) + ' MB'
}