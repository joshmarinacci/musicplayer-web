// const BASE_URL = "http://music.josh.earth/api"
const BASE_URL = "http://localhost:19872/api"

function GET_JSON(path) {
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
function POST_JSON(path, payload) {
    return new Promise((res,rej) => {
        console.log("posting",path);
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
        req.open("POST",path,true);
        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        req.send(JSON.stringify(payload));
    });
}

export default class MusicStore {
    constructor() {
        this.artists_map = {}
        this.albums_map = {}
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
        return GET_JSON(BASE_URL+'/artists/'+artist._id+'/albums').then(albums => {
            albums.forEach(album => this.albums_map[album._id] = album)
            return albums
        })
    }
    getSongsForAlbumForArtist(artist,album) {
        return GET_JSON(BASE_URL+'/artists/'+artist._id+"/albums/"+album._id+'/songs')
    }
    getArtistById(id) {
        return this.artists_map[id]
    }

    getAlbumById(id) {
        return this.albums_map[id]
    }

    getSongURL(song) {
        return `${BASE_URL}/songs/getfile/${song._id}`
    }

    setSelection(songs) {
        this.selection = songs
    }

    getFirstSelectedSong() {
        if(this.selection && this.selection.length > 0) return this.selection[0]
        return null
    }

    updateSongFields(song, fields) {
        console.log('updating',song,'with fields',fields)
        return POST_JSON(`${BASE_URL}/songs/update/${song._id}`,fields).then(res => {
            console.log("got back the result",res)
        })
    }


}
