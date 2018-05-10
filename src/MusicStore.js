const BASE_URL = "http://music.josh.earth/api"
// const BASE_URL = "http://localhost:19872/api"

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
        this.selection = []
    }
    getArtists() {
        return GET_JSON(BASE_URL+'/artists').then((artists)=>{
            artists.forEach((artist)=>{
                this.artists_map[artist._id] = artist
            })
            return artists
        })
    }
    getAllAlbums() {
        return GET_JSON(BASE_URL+'/albums').then((albums)=>{
            albums.forEach(album => this.albums_map[album._id] = album)
            return albums
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
    getSongsForAlbum = (album) => GET_JSON(BASE_URL+'/albums/'+album._id+'/songs')
    getAllSongs = () => GET_JSON(BASE_URL+'/songs/')

    getArtistById(id) {
        return this.artists_map[id]
    }

    getAlbumById = (id) => {
        if(!this.albums_map[id]) return { name:'unknown'}
        return this.albums_map[id]
    }

    getSongURL(song) {
        return `${BASE_URL}/songs/getfile/${song._id}`
    }
    getArtworkURL(item) {
        if(item) {
            const id = item.id
            return `${BASE_URL}/artwork/${id}/${item.format.replace('/','-')}`
        } else {
            return '#'
        }
    }

    setSelection(songs) {
        this.selection = songs
    }

    getFirstSelectedSong() {
        return this.selection[0]
    }

    isSelected(song) {
        return this.selection.includes(song)
    }

    addToSelection(song) {
        this.selection.push(song)
    }
    replaceSelection(arr) {
        this.selection = arr
    }
    removeFromSelection(song) {
        this.selection = this.selection.filter((s)=>s._id!==song._id)
    }
    getSelection() {
        return this.selection
    }


    updateSongFields(song, fields) {
        return POST_JSON(`${BASE_URL}/songs/update/${song._id}`,fields)
    }
    updateAlbumFields(album,fields) {
        return POST_JSON(`${BASE_URL}/albums/${album._id}/update`,fields)
    }

    deleteSelectedSongs() {
        const ids = this.selection.map(s=>s._id)
        return POST_JSON(`${BASE_URL}/songs/delete/`,ids)
    }


}
