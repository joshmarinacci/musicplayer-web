import React, { Component } from 'react';
import {Dialog, DialogManager} from "appy-comps"

export default class  MetadataEditorDialog extends Component {
    render() {
        const songs = this.props.store.getSelection()
        return <Dialog visible={true}>
            <h3>really delete {songs.length} songs?</h3>
            <button onClick={this.cancel}>cancel</button>
            <button onClick={this.okay}>yes, do it!</button>
        </Dialog>
    }

    cancel = () => DialogManager.hide()

    okay = () => {
        DialogManager.hide()
        this.props.store.deleteSelectedSongs().then(this.props.onComplete)
    }

}