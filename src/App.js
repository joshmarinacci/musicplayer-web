import React, { Component } from 'react';
import './App.css';
import 'font-awesome/css/font-awesome.min.css'
import MusicStore from './MusicStore'
import {Dialog, DialogContainer, DialogManager} from "appy-comps"
import MetadataEditorDialog from './MetadataEditorDialog'

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
            query:[],
            query2:[],
            results:[],
            selectedSource:null,
            selectedQuery:null,
            selectedQuery2:null,
            selectedSong:null,
            playing:false,
            currentTime:0,
            currentPlaylist:[],
            currentIndex:-1,
        }

        STORE.getArtists().then((artists)=>{
            this.setState({query:artists})
        })
    }

    sourcesItemSelected = (item) => this.setState({selectedSource:item})
    queryItemSelected = (item) => {
        this.setState({selectedQuery:item})
        STORE.getAlbums(item).then((albums)=>{
            this.setState({query2:albums})
        })
    }
    queryItemSelected2 = (item) => {
        this.setState({selectedQuery2:item})
        STORE.getSongsForAlbumForArtist(this.state.selectedQuery,item).then((songs)=>{
            this.setState({results:songs})
        })
    }
    songSelected = (item) => {
        this.setState({selectedSong:item})
        STORE.setSelection([item])
    }
    togglePlaying = () => {
        if(this.state.playing) {
            this.stopSong()
        } else {
            const currentPlaylist = this.state.results
            const currentIndex = this.state.results.indexOf(this.state.selectedSong)
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
                                   template={SourceTemplate}
                                   onSelect={this.sourcesItemSelected}
                                   selected={this.state.selectedSource}
                />
                <header>query</header>
                <SelectionListView id='query'
                                   template={QueryTemplate}
                                   list={this.state.query}
                                   onSelect={this.queryItemSelected}
                                   selected={this.state.selectedQuery}
                />
                <header>query 2</header>
                <SelectionListView id='query2'
                                   template={QueryTemplate}
                                   list={this.state.query2}
                                   onSelect={this.queryItemSelected2}
                                   selected={this.state.selectedQuery2}
                />

                <header>results</header>
                <SelectionTable id="results"
                                ItemTemplate={SongTableItemTemplate}
                                columns={{'title':'Title', 'artist':'Artist', 'track':'Track'}}
                                list={this.state.results}
                                onSelect={this.songSelected}
                                selected={this.state.selectedSong}
                                HeaderTemplate={SongTableHeaderTemplate}
                />
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
            <button onClick={this.editSelection}>edit</button>
        </div>
    }

    editSelection = () => {
        DialogManager.show(<MetadataEditorDialog store={STORE}/>)
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
const QueryTemplate = (props) => {
    return <li className={props.selected?"selected":""} onClick={()=>props.onSelect(props.item)}>{props.item.name}</li>
}

class SelectionListView extends Component {
    render() {
        const Template = this.props.template
        return <ul className="selection-list-view">
            {this.props.list.map((item,i)=>{
                return <Template key={i} item={item}
                                 onSelect={this.props.onSelect}
                                 selected={item===this.props.selected}/>
            })}
        </ul>
    }
}

class SelectionTable extends Component {
    render() {
        const {ItemTemplate, HeaderTemplate, ...rest} = this.props
        return <div {...rest}><table>
            <thead>
            <tr>{Object.keys(this.props.columns).map(col => {
                return <HeaderTemplate key={col} column={col} columns={this.props.columns} list={this.props.list}/>
            })}</tr>
            </thead>
            <tbody>
            {this.renderBody(this.props.list,'')}
            </tbody>
        </table></div>
    }

    renderBody(list,key) {
        const {ItemTemplate, HeaderTemplate, ...rest} = this.props
        return list.map((row,i)=>{
            return <tr key={i+"-"+key}>
                {
                    Object.keys(this.props.columns).map(col => {
                        return <ItemTemplate key={col} row={row}
                                             column={col}
                                             onSelect={this.props.onSelect}
                                             selected={row===this.props.selected}
                        />
                    })
                }
            </tr>
        })
    }
}

const SongTableItemTemplate = (props) => {
    let val = props.row[props.column]
    if(props.column === 'artist') {
        val = STORE.getArtistById(val).name
    }
    return <td className={props.selected?"selected":""}
               onClick={()=>props.onSelect(props.row)}>{val}</td>
}

const SongTableHeaderTemplate = (props) => {
    return <th>{props.columns[props.column]}</th>
}

export default App;
