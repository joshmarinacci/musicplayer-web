import React, { Component } from 'react';
import SelectionListView from './SelectionListView'
import SelectionTable from './SelectionTable'

export default class AlbumsView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            query:[],
            selectedQuery:null,
        }
    }
    queryItemSelected = (item) => {
        this.setState({selectedQuery:item})
        this.props.store.getAlbums(item).then((albums)=>{
            this.setState({query2:albums})
        })
    }
    render() {
        return <div className="two-column">
            <header>Albums</header>
            <SelectionListView id='query'
                               template={QueryTemplate}
                               list={this.state.query}
                               onSelect={this.queryItemSelected}
                               selected={this.state.selectedQuery}
            />
            <header>results</header>
            <SelectionTable id="results"
                            ItemTemplate={SongTableItemTemplate}
                            columns={{'title':'Title', 'artist':'Artist', 'track':'Track', 'album':'Album','picture':'Has Artwork?'}}
                            list={this.state.results}
                            onSelect={this.songSelected}
                            isSelected={this.isSelected}
                            HeaderTemplate={SongTableHeaderTemplate}
                            app={this}
            />
        </div>
    }
}

const QueryTemplate = (props) => {
    return <li className={props.selected?"selected":""} onClick={()=>props.onSelect(props.item)}>{props.item.name}</li>
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
