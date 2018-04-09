import React, { Component } from 'react';
import './App.css';
import 'font-awesome/css/font-awesome.min.css'

class App extends Component {
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
                <ul className="sources">
                    <li>Artists</li>
                    <li>Albums</li>
                    <li>Genres</li>
                </ul>

                <header>query</header>
                <ul className="query">
                    <li>Adele</li>
                    <li>Depeche Mode</li>
                    <li>Erasure</li>
                </ul>

                <header>results</header>
                <div className="results">
                <table className="results-content">
                    <thead>
                    <th>&nbsp;</th>
                    <th>Title</th>
                    <th>Artist</th>
                    <th>Album</th>
                    </thead>
                    <tr>
                        <td>Hello</td>
                        <td>Adele</td>
                        <td>25</td>
                    </tr>
                    <tr>
                        <td>Here I Go AGain</td>
                        <td>Erasure</td>
                        <td>Nightbird</td>
                    </tr>
                    <tr>
                        <td>Not Tonight</td>
                        <td>Depeche Mode</td>
                        <td>Black Celebration</td>
                    </tr>
                </table>
                </div>

              <div className="status">
                playing
              </div>
            </div>
        );
    }
}

export default App;
