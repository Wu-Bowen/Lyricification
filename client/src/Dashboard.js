import React, { useState, useEffect } from 'react'
import useAuth from "./useAuth";
import Player from './Player';
import TrackSearchResult from './TrackSearchResult';
import { Container, Form } from 'react-bootstrap';
import SpotifyWebApi from 'spotify-web-api-node';
import axios from 'axios';


const spotifyApi = new SpotifyWebApi({
    clientId: 'dc98d5777aaa4443b1e2218303fa630c'
})
export default function Dashboard({ code }) {
    const accessToken = useAuth(code);
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [selectedSong, setSelectedSong] = useState();
    const [lyrics, setLyrics] = useState('');

    const chooseTrack = (track) => {
        setSelectedSong(track);
        setSearch('');
        setLyrics('');
    }

    useEffect(() => {
        if (!selectedSong) return
        axios.get('http://localhost:3001/lyrics', {
            params: {
                track: selectedSong.title,
                artist: selectedSong.artist
            }
        }).then(res => {
            setLyrics(res.data.lyrics);
        })
    }, [selectedSong])

    useEffect(() => {
        if (!accessToken) return;
        spotifyApi.setAccessToken(accessToken);
    }, [accessToken])

    useEffect(() => {
        if (!search) return setSearchResult([]);
        if (!accessToken) return;

        let cancel = false;
        spotifyApi.searchTracks(search).then(res => {
            if (cancel) return
            setSearchResult(res.body.tracks.items.map(track => {
                const smallestAlbumImage = track.album.images.reduce(
                    (smallest, image) => {
                        if (image.height < smallest.height) return image
                        return smallest
                    }, track.album.images[0])

                return {
                    artist: track.artists[0].name,
                    title: track.name,
                    uri: track.uri,
                    albumUrl: smallestAlbumImage.url
                }
            }))
        })
        return () => cancel = true
    }, [search, accessToken])
    return (
        <Container className="d-flex flex-column py-2" style={{ height: '100vh' }}>
            <Form.Control
                type="serach"
                placeholder="Search Songs/Artists"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            {searchResult.length == 0 && (
                <div className="text-center my-2" style={{ whiteSpace: 'pre' }}>
                    {lyrics}
                </div>
            )}
            <div className="flex-grow-1 my-2" style={{ overflowY: 'auto' }}>
                {searchResult.map(track => (
                    <TrackSearchResult track={track} key={track.uri} chooseTrack={chooseTrack} />
                ))}
            </div>
            <div className="fixed-bottom"> <Player accessToken={accessToken} trackUri={selectedSong?.uri} /> </div>
        </Container>
    )
}