import React, { useState, useEffect } from "react";
import "./timer.css";
import axios from "axios";

const Timer = () => {
    const defaultWorkTime = 25 * 60; // Default work time in seconds (25 minutes)
    const defaultBreakTime = 5 * 60; // Default break time in seconds (5 minutes)

    const [workTime, setWorkTime] = useState(parseInt(localStorage.getItem('workTime')) || defaultWorkTime);
    const [breakTime, setBreakTime] = useState(parseInt(localStorage.getItem('breakTime')) || defaultBreakTime);
    const [timeRemaining, setTimeRemaining] = useState(workTime);
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);

    const spotifyClientId = ""; // Replace with Spotify Client ID
    const spotifyRedirectUri = "http://localhost:3000"; // Spotify OAuth redirect URI
    const [accessToken, setAccessToken] = useState("");

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    // Redirect to Spotify authentication page
    const authenticateSpotify = () => {
        const scopes = [
            "user-modify-playback-state",
            "user-read-playback-state",
            "playlist-read-private",
        ].join(" ");
        const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${spotifyClientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(spotifyRedirectUri)}`;
        window.location.href = authUrl;
    };

    // Retrieve token from URL after authentication
    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const params = new URLSearchParams(hash.replace("#", ""));
            const token = params.get("access_token");
            if (token) {
                setAccessToken(token);
                window.location.hash = ""; // Remove token from URL
            }
        }
    }, []);

    // Get active Spotify device
    const getActiveDevice = async () => {
        try {
            const response = await axios.get("https://api.spotify.com/v1/me/player/devices", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const devices = response.data.devices;
            if (devices.length > 0) {
                return devices[0].id; // Retrieve first active device
            } else {
                alert("No active device found. Please open Spotify on one of your devices.");
                return null;
            }
        } catch (error) {
            console.error("Error fetching active device:", error);
        }
    };

    // Start Spotify music playback
    const playSpotifyMusic = async () => {
        try {
            const deviceId = await getActiveDevice();
            if (deviceId) {
                await axios.put(
                    `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
                    {
                        uris: ["spotify:track:1dNIEtp7AY3oDAKCGg2XkH"], // Replace with Spotify track URI
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
            }
        } catch (error) {
            console.error("Error starting playback:", error);
        }
    };

    // Pause Spotify music
    const pauseSpotifyMusic = async () => {
        try {
            await axios.put(
                "https://api.spotify.com/v1/me/player/pause",
                null,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
        } catch (error) {
            console.error("Error pausing playback:", error);
        }
    };

    // Reset timer
    const resetTimer = () => {
        setIsRunning(false);
        setTimeRemaining(isBreak ? breakTime : workTime);
        pauseSpotifyMusic();
    };

    // Countdown timer
    useEffect(() => {
        if (isRunning) {
            const interval = setInterval(() => {
                setTimeRemaining((prevTime) => {
                    if (prevTime <= 0) {
                        clearInterval(interval);
                        setIsBreak(!isBreak);
                        setTimeRemaining(isBreak ? workTime : breakTime);
                        alert(isBreak ? "Break time is over! Back to work!" : "Time for a break!");
                        return isBreak ? workTime : breakTime;
                    }
                    return prevTime - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isRunning, isBreak, workTime, breakTime]);

    // Start/Stop timer
    const toggleTimer = () => {
        setIsRunning(!isRunning);
        if (!isRunning) {
            playSpotifyMusic();
        } else {
            pauseSpotifyMusic();
        }
    };

    // Handle time changes
    const handleWorkTimeChange = (e) => {
        const newWorkTime = parseInt(e.target.value) * 60;
        setWorkTime(newWorkTime);
        localStorage.setItem('workTime', newWorkTime.toString());
        if (!isRunning && !isBreak) {
            setTimeRemaining(newWorkTime);
        }
    };

    const handleBreakTimeChange = (e) => {
        const newBreakTime = parseInt(e.target.value) * 60;
        setBreakTime(newBreakTime);
        localStorage.setItem('breakTime', newBreakTime.toString());
        if (!isRunning && isBreak) {
            setTimeRemaining(newBreakTime);
        }
    };

    return (
        <div className="container mt-10">
            <div className="glassmorphic-card p-4 text-center">
                <div className="icon-card">
                    <i className="fas fa-rocket"></i>
                </div>
                <h1>{isBreak ? "Break Time" : "Work Time"}</h1>
                <div className="timer-display">{formatTime(timeRemaining)}</div>
                <div className="timer-controls">
                    <button className="glassmorphic-button" onClick={toggleTimer}>
                        {isRunning ? "Pause" : "Start"}
                    </button>
                    <button className="glassmorphic-button" onClick={resetTimer}>Reset</button>
                    <button className="glassmorphic-button" onClick={authenticateSpotify}>Login to Spotify</button>
                </div>
                <div className="time-settings">
                    <label>
                        Work Time (minutes):
                        <input
                            type="number"
                            value={workTime / 60}
                            onChange={handleWorkTimeChange}
                            min="1"
                        />
                    </label>
                    <label>
                        Break Time (minutes):
                        <input
                            type="number"
                            value={breakTime / 60}
                            onChange={handleBreakTimeChange}
                            min="1"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default Timer;
