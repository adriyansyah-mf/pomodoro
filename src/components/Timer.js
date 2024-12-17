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

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    // Spotify API credentials
    const spotifyClientId = "Doler Ismet";
    const spotifyClientSecret = "Hesoyam";

    // Get Spotify access token
    const getSpotifyAccessToken = async () => {
        const auth = Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString("base64");

        try {
            const response = await axios.post("https://accounts.spotify.com/api/token", "grant_type=client_credentials", {
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            return response.data.access_token;
        } catch (error) {
            console.error("Error getting Spotify access token:", error);
            throw error;
        }
    };

    // Pause Spotify playback
    const pauseSpotifyPlayback = async () => {
        try {
            const accessToken = await getSpotifyAccessToken();

            await axios.put("https://api.spotify.com/v1/me/player/pause", null, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            });
        } catch (error) {
            console.error("Error pausing playback:", error);
        }
    };

    // Resume Spotify playback
    const resumeSpotifyPlayback = async () => {
        try {
            const accessToken = await getSpotifyAccessToken();

            await axios.put("https://api.spotify.com/v1/me/player/play", null, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            });
        } catch (error) {
            console.error("Error resuming playback:", error);
        }
    };

    // Reset the timer
    const resetTimer = () => {
        setIsRunning(false);
        setTimeRemaining(isBreak ? breakTime : workTime);
        pauseSpotifyPlayback();
    };

    // Timer countdown
    useEffect(() => {
        if (isRunning) {
            const interval = setInterval(() => {
                setTimeRemaining((prevTime) => {
                    if (prevTime <= 0) {
                        clearInterval(interval);
                        setIsBreak(!isBreak);
                        setTimeRemaining(isBreak ? workTime : breakTime); // Toggle work/break times
                        alert(isBreak ? "Break time is over! Back to work!" : "Time for a break!");
                        return prevTime;
                    }
                    return prevTime - 1;
                });
            }, 1000);
            return () => clearInterval(interval); // Cleanup interval on component unmount
        }
    }, [isRunning, isBreak, breakTime, workTime]);

    // Handle changes in work and break times
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

    // Start/Stop the timer
    const toggleTimer = () => {
        setIsRunning(!isRunning);
        if (isRunning) {
            pauseSpotifyPlayback();
        } else {
            resumeSpotifyPlayback();
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
                    <button onClick={toggleTimer}>{isRunning ? "Pause" : "Start"}</button>
                    <button onClick={resetTimer}>Reset</button>
                </div>
                <div className="time-settings">
                    <label>
                        Work Time (minutes):
                        <input type="number" value={workTime / 60} onChange={handleWorkTimeChange} min="1" />
                    </label>
                    <label>
                        Break Time (minutes):
                        <input type="number" value={breakTime / 60} onChange={handleBreakTimeChange} min="1" />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default Timer;
