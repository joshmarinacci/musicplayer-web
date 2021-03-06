const BASE_URL = "https://music.josh.earth/api"
// const BASE_URL = "http://localhost:19872/api"
let PASSWORD = null

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

function POST_JSON_FILE(path, file) {
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
        req.setRequestHeader('jauth-password',PASSWORD)
        req.send(file);
    });
}
function POST_JSON(path, payload) {
    return fetch(path,{
        method:'POST',
        headers: {
            'Content-Type':"application/json;charset=UTF-8",
            'jauth-password':PASSWORD
        },
        body:JSON.stringify(payload)
    }).then((res)=>res.json())
}

const flatten = (arrs) => arrs.reduce((a,b) => a.concat(b))


export default class MusicStore {
    constructor() {
        this.artists_map = {}
        this.albums_map = {}
        this.selection = []
        this.listeners = {}
    }
    isLoggedIn = () => PASSWORD !== null
    login = (password) => {
        PASSWORD = password
        this.fire('login')
    }
    getListeners(type) {
        if(!this.listeners[type]) this.listeners[type] = []
        return this.listeners[type]
    }
    on(type,cb) {
        this.getListeners(type).push(cb)
    }
    off(type,ocb) {
        this.listeners[type] = this.getListeners(type).filter(cb => cb !== ocb)
    }
    fire = (type) => {
        this.getListeners(type).forEach(cb=>cb())
    }
    getArtists = () => GET_JSON(BASE_URL+'/artists').then((artists)=>{
            this.artists_map = {}
            artists.forEach(artist => this.artists_map[artist._id] = artist)
            return artists
        })

    getAllAlbums = () => GET_JSON(BASE_URL+'/albums')
        .then((albums)=>{
            albums.forEach(album => this.albums_map[album._id] = album)
            return albums
        })

    getAlbums = (artist) =>
        GET_JSON(BASE_URL+'/artists/'+artist._id+'/albums').then(albums => {
            albums.forEach(album => this.albums_map[album._id] = album)
            return albums
        })
    getAlbumsForArtists = (artists) => {
        return Promise.all(artists.map(art =>  this.getAlbums(art))).then(als => flatten(als))
    }
    getSongsForAlbums = (albums) => {
        return Promise.all(albums.map(al => this.getSongsForAlbum(al))).then(songs => flatten(songs))
    }

    deleteArtistById = (artist) => POST_JSON(`${BASE_URL}/artists/${artist._id}/delete`)
    getSongsForAlbumForArtist = (artist,album) => GET_JSON(BASE_URL+'/artists/'+artist._id+"/albums/"+album._id+'/songs')
    getSongsForAlbum = (album) => GET_JSON(BASE_URL+'/albums/'+album._id+'/songs')
    deleteAlbumById = (album) => POST_JSON(`${BASE_URL}/albums/${album._id}/delete`)
    getAllSongs = () => GET_JSON(BASE_URL+'/songs/')

    getArtistById = (id) => this.artists_map[id]

    getAlbumById = (id) => {
        if(!this.albums_map[id]) return { name:'unknown'}
        return this.albums_map[id]
    }

    getSongURL = (song) => `${BASE_URL}/songs/getfile/${song._id}`

    getArtworkURLForAlbum = (album) => {
        if(album && album.artwork) return `${BASE_URL}/artwork/${album.artwork}`
        return '#'
    }

    setSelection = (songs) => this.selection = songs

    getFirstSelectedSong = () => this.selection[0]


    isSelected = (song) => this.selection.includes(song)

    addToSelection(song) {
        this.selection.push(song)
    }
    replaceSelection(arr) {
        this.selection = arr
    }
    removeFromSelection(song) {
        this.selection = this.selection.filter((s)=>s._id!==song._id)
    }
    getSelection = ()  => this.selection

    updateSongFields = (song, fields) => POST_JSON(`${BASE_URL}/songs/update/${song._id}`,fields)

    updateAlbumFields  = (album,fields)  => POST_JSON(`${BASE_URL}/albums/${album._id}/update`,fields)
    updateArtistFields = (artist,fields) => POST_JSON(`${BASE_URL}/artists/${artist._id}/update`,fields)

    uploadArtwork = file => POST_JSON_FILE(`${BASE_URL}/artwork/upload/${file.name}`,file)

    refreshAlbumById = (id) => {
        return GET_JSON(`${BASE_URL}/albums/${id}/info`).then((msg)=>{
            const album = msg[0]
            this.albums_map[album._id] = album
            return this.albums_map[album._id]
        })
    }

    refreshArtistById = (id) => {
        return GET_JSON(`${BASE_URL}/artists/${id}/info`).then((msg)=>{
            const artist = msg[0]
            this.artists_map[artist._id] = artist
            return this.artists_map[artist._id]
        })
    }

    findArtistById = (id) => this.artists_map[id]

    findArtistByName = (name) => Object.keys(this.artists_map)
            .find(id => this.artists_map[id].name === name )

    findAlbumById = (id) => this.albums_map[id]

    findAlbumByName = (name) => Object.keys(this.albums_map)
        .find(id => this.albums_map[id].name === name)

    deleteSelectedSongs() {
        const ids = this.selection.map(s=>s._id)
        return POST_JSON(`${BASE_URL}/songs/delete/`,ids)
    }

    mergeArtists= (artists) =>
        POST_JSON(`${BASE_URL}/artists/merge`,artists.map(art=>art._id))
            .then(res => res.artist)

    mergeAlbums= (albums) =>
        POST_JSON(`${BASE_URL}/albums/merge`,albums.map(al=>al._id))
            .then(res => res.album)

}
