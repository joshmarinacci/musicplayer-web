import React, { Component } from 'react';
import './App.css';
import 'font-awesome/css/font-awesome.min.css'

const BASE_URL = "http://joshy.org:19872/api"

function GET_JSON(path, cb) {
    return new Promise((res,rej) => {
        console.log("fetching",path);
        const req = new XMLHttpRequest()
        req.onreadystatechange = function() {
            // console.log("got",req.readyState, req.status)
            if(req.readyState === 4) {
                if(req.status === 200) return res(JSON.parse(req.responseText));
                //if anything other than 200, reject it
                rej(req)
            }
            if(req.status === 500) rej(req);
            if(req.status === 404) rej(req);
        };
        req.open("GET",path,true);
        req.send();
    });
}

class MusicStore {
    constructor() {
        this.artists_map = {}
    }
    getArtists() {
        return GET_JSON(BASE_URL+'/artists').then((artists)=>{
            artists.forEach((artist)=>{
                this.artists_map[artist._id] = artist
            })
            return artists
        })
    }
    getAlbums(artist) {
        return GET_JSON(BASE_URL+'/artists/'+artist._id+'/albums')
    }
    getSongsForAlbumForArtist(artist,album) {
        return GET_JSON(BASE_URL+'/artists/'+artist._id+"/albums/"+album._id+'/songs')
    }
    getArtistById(id) {
        return this.artists_map[id]
    }
}

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
    }
    render() {
        return (
            <div id='grid'>
              <div className="toolbar">
                <button className="fa fa-play"/>
                <i className="spacer"/>
                <div className="info-panel">
                  <label>song title</label>
                  <label>artist</label>
                  <label>album</label>
                  <label>time</label>
                </div>
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
                                columns={{'title':'Title', 'artist':'Artist'}}
                                list={this.state.results}
                                onSelect={this.songSelected}
                                selected={this.state.selectedSong}
                                HeaderTemplate={SongTableHeaderTemplate}
                />
              <div className="status">
                playing
              </div>
            </div>
        );
    }
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
            {Object.keys(this.props.columns).map(col => {
                return <HeaderTemplate key={col} column={col} columns={this.props.columns} list={this.props.list}/>
            })}
            </thead>
            <tbody>
            {this.props.list.map((row,i)=>{
                return <tr key={i}>
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
            })}

            </tbody>
        </table></div>
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
