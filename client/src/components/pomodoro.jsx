import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import Footer from './partials/footer';
import Header from './partials/header';
import 'bootstrap/dist/css/bootstrap.min.css';

function PomodoroTimer() {
    axios.defaults.withCredentials = true;
    const [timer, setTimer] = useState(null); // Timer in seconds
    const [session, setSession] = useState(null); // Current session

    const [pomodoroTime, setPomodoroTime] = useState(25); // Default pomodoro time 
    const [restTime, setRestTime] = useState(5);  // Default rest time
    const [repetitions, setRepetitions] = useState(4);    // Default repetitions

    const [isRunning, setIsRunning] = useState(false);    // Is the timer running?
    const [isPomodoro, setIsPomodoro] = useState(true);   // Is it pomodoro time?
    const [pomodoroTimePassed, setPomodoroTimePassed] = useState(0);    // Time passed in the current pomodoro
    const [currentRepetition, setCurrentRepetition] = useState(1);  // Current repetition number

    const [sessionDetails, setSessionDetails] = useState(null);
    const [cookies, setCookie, removeCookie] = useCookies(['session']);

    useEffect(() => {   // Check if there is a session in the cookies and resume it
        if (cookies.session && !session) {
            setSession(cookies.session);
            setIsRunning(true);
            if (cookies.session.timer) {
                setTimer(cookies.session.timer);
            }
            if (cookies.session.pomodoroDuration) {
                setPomodoroTime(cookies.session.pomodoroDuration);
            }
            if (cookies.session.restDuration) {
                setRestTime(cookies.session.restDuration);
            }
            if (cookies.session.repetitions) {
                setRepetitions(cookies.session.repetitions);
            }
            if (cookies.session.isPomodoro !== undefined) {
                setIsPomodoro(cookies.session.isPomodoro);
            }
            if (cookies.session.pomodoroTimePassed !== undefined) {
                setPomodoroTimePassed(cookies.session.pomodoroTimePassed);
            }
            if (cookies.session.currentRepetition !== undefined) {
                setCurrentRepetition(cookies.session.currentRepetition);
            }
        }
    }, [cookies, session]);

    useEffect(() => {   // Update the session cookie with the new data
        if (session) {
            const totalTime = (pomodoroTime + restTime) * repetitions; // in seconds
            const sessionData = { 
                ...session, 
                timer: timer, 
                pomodoroDuration: pomodoroTime,
                restDuration: restTime, 
                repetitions: repetitions,
                currentRepetition: currentRepetition,
                isPomodoro: isPomodoro,
                pomodoroTimePassed: pomodoroTimePassed,
                totalDuration: totalTime
            };
            setCookie('session', sessionData, { path: '/' });   // Update the session cookie
        }
    }, [timer, pomodoroTime, restTime, repetitions, isPomodoro, session, setCookie, pomodoroTimePassed, currentRepetition]);


    const startSession = async (e) => {
        e.preventDefault(); // Avoid page refresh
        try {
            const startTime = Date.now();   // Get the start time

            // Create a new session with the initial data
            const res = await axios.post('http://localhost:5000/api/pomodoro/start-session', {
                pomodoroDuration: pomodoroTime,
                restDuration: restTime,
                repetitions: repetitions,
                currentRepetition: 1,
                completed: false,
                totalDuration: 0,
                workDuration: 0,
                workPercentage: 0,
                startTime: startTime,
            });
            // Set the timer to its initial value and start the session
            const initialTimer = pomodoroTime * 3;
            setTimer(initialTimer);
            setIsRunning(true);
    
            const sessionData = {   // Create the session object with the initial data
                ...res.data, 
                timer: initialTimer, 
                pomodoroDuration: pomodoroTime, 
                restDuration: restTime, 
                repetitions: repetitions,
                currentRepetition: 1,
                pomodoroTimePassed: 0,
                startTime: startTime,
            };
            setSession(sessionData);
            setCookie('session', sessionData, { path: '/' }); // Store session data in cookie
        } catch (error) {
            console.error(error);
        }
    };

    const updateSession = useCallback(async () => {
        try {
            // Calculate the session details
            const totalTime = Math.floor((Date.now() - session.startTime) / 1000); // in seconds
            const workTime = session.pomodoroDuration * (session.repetitions - repetitions) + pomodoroTimePassed;   // add the time passed in the current pomodoro
            const workPercentage = ((workTime / totalTime) * 100).toFixed(2);

            const res = await axios.patch(`http://localhost:5000/api/pomodoro/update-session/${session._id}`, {
                completed: repetitions <= 0,
                currentRepetition: currentRepetition,
                totalDuration: totalTime,
                workDuration: workTime,
                workPercentage: workPercentage,
                startTime: session.startTime,
            });
            

            setSession(res.data);
            setIsRunning(false);
            removeCookie('session', { path: '/' });

            // Set the session details
            setSessionDetails({
                pomodoroDuration: session.pomodoroDuration,
                restDuration: session.restDuration,
                repetitions: session.repetitions,
                currentRepetition: currentRepetition,
                totalTime: totalTime,
                workTime: workTime,
                workPercentage : workPercentage,
                completed: currentRepetition >= session.repetitions,
            });
            
            setSession(null);   // Clear the session variable
        } catch (error) {
            console.error(error);
        }
    }, [repetitions, session, currentRepetition, pomodoroTimePassed, removeCookie]);


    useEffect(() => {
        if (session && isRunning) {
            const interval = setInterval(() => {
                setTimer(timer - 1);
                if (isPomodoro) {   // Increment the time passed in the current pomodoro
                    setPomodoroTimePassed(pomodoroTimePassed + 1);
                }
                if (timer <= 1) {   // If the timer reaches 0
                    setIsPomodoro(prevIsPomodoro => {
                        const nextIsPomodoro = !prevIsPomodoro;
                        setTimer(nextIsPomodoro ? pomodoroTime * 3 : restTime * 3);
                        return nextIsPomodoro;
                    });
                    
                    if(!isPomodoro) {
                        setCurrentRepetition(prevRep => {
                            const nextRep = prevRep + 1;
                            if (nextRep > repetitions) {    // If we reached the last repetition, stop
                                setIsRunning(false);
                                updateSession();    // Terminate the session
                                return prevRep;
                            }
                            return nextRep;
                        });
                    }
                }

            }, 1000);   // Update the timer every second
            return () => clearInterval(interval);
        }
    }, [timer, isRunning, isPomodoro, pomodoroTime, restTime, repetitions, session, updateSession, pomodoroTimePassed, currentRepetition]);


    const togglePause = () => {
        setIsRunning(!isRunning);
    };

    // Utility function to convert seconds into 'XX minutes and XX seconds' format
    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.round(timeInSeconds % 60);
        // We use padStart to add a leading 0 if the number is less than 10
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };


    return (
        <>
        <Header />
        <div className="container text-center">
        {sessionDetails ? (
            <div className="card mt-5">
                <div className="card-header">
                    <h1>Session Details</h1>
                </div>
                <div className="card-body">
                    <p>Pomodoro Duration: {sessionDetails.pomodoroDuration}m</p>
                    <p>Rest Duration: {sessionDetails.restDuration}m</p>
                    <p>Repetitions: {sessionDetails.currentRepetition} out of {sessionDetails.repetitions}</p>
                    <p>Total Time: {formatTime(sessionDetails.totalTime)}</p>
                    <p>Work Time: {formatTime(sessionDetails.workTime)}</p>
                    <p>Work Percentage: {sessionDetails.workPercentage}%</p>
                    <p>Session Completed: {sessionDetails.completed ? 'Yes :)' : 'No :('}</p>
                </div>
            </div>
        ) : session ? (
            <div>
                <h1 className="mt-5 display-4">{isPomodoro ? 'Pomodoro Time' : 'Resting'}</h1>
                <p className="display-1">{formatTime(timer)}</p>
                <p className="display-6">Current repetition: {currentRepetition} out of {repetitions}</p>
                <button className="btn btn-primary mt-3" onClick={togglePause}>{isRunning ? 'Pause' : 'Unpause'}</button>
                <button className="btn btn-danger mt-3" onClick={updateSession}>Terminate Session</button>
            </div>
        ) : (
            <form onSubmit={startSession} className="mt-5">
                <div className="form-group">
                    <label>Pomodoro Time</label>
                    <input type="number" min="1" value={pomodoroTime} onChange={(e) => setPomodoroTime(e.target.value)} className="form-control" />
                </div>
                <div className="form-group">
                    <label>Rest Time</label>
                    <input type="number" min="0" value={restTime} onChange={(e) => setRestTime(e.target.value)} className="form-control" />
                </div>
                <div className="form-group">
                    <label>Repetitions</label>
                    <input type="number" min="1" value={repetitions} onChange={(e) => setRepetitions(e.target.value)} className="form-control" />
                </div>
                <button type="submit" className="btn btn-primary">Start Pomodoro</button>
            </form>
        )}
        </div>
        <Footer />
        </>
    );
}

export default PomodoroTimer;