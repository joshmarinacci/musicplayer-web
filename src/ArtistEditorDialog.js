import React, { Component } from 'react';
import {Dialog, DialogManager} from "appy-comps"

export default class ArtistEditorDialog extends Component {
    constructor(props) {
        super(props)
        const artist = this.props.store.getArtistById(props.artist._id)
        this.state = {
            name:artist.name,
        }
    }

    render() {
        const store = this.props.store
        const artist = store.getArtistById(this.props.artist._id)
        return <Dialog visible={true}>
            <h3>editing artist <input type="text" value={this.state.name} onChange={this.editedName}/></h3>
            <div>
            </div>
            <button onClick={this.cancel}>cancel</button>
            <button onClick={this.okay} disabled={this.nothingChanged()}>save changes</button>
        </Dialog>
    }


    editedName = (e) => this.setState({name:e.target.value})
    cancel = () => DialogManager.hide()
    okay = () => {
        DialogManager.hide()
        const store = this.props.store
        const artist = this.props.artist
        store.updateArtistFields(artist, { name:this.state.name })
            .then(()=>store.refreshArtistById(artist._id))
            .then(this.props.onComplete)
            .catch(e => {
                console.log("error saving the artist",e)
                DialogManager.show(<ErrorDialog error={e} />)
            })
    }
    changedName    = () => this.state.name !== this.props.artist.name
    nothingChanged = () => !this.changedName()

}

class ErrorDialog extends Component {
    render() {
        return <Dialog visible={true}>
            <h3>ERROR</h3>
            <p>{this.props.error.toString()}</p>
        </Dialog>
    }
}