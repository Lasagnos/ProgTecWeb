import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import Footer from './partials/footer';
import Header from './partials/header';
import 'bootstrap/dist/css/bootstrap.min.css';

function PomodoroTimer() {
    axios.defaults.withCredentials = true;
    const [session, setSession] = useState(null); // Current session
    const [sessionDetails, setSessionDetails] = useState(null); // Session details to show after termination

    const [pomodoroTime, setPomodoroTime] = useState(25); // Default pomodoro time 
    const [restTime, setRestTime] = useState(5);  // Default rest time
    const [repetitions, setRepetitions] = useState(4);    // Default repetitions

    const [timer, setTimer] = useState(null); // Timer in seconds
    const [isRunning, setIsRunning] = useState(false);    // Is the timer running?
    const [isPomodoro, setIsPomodoro] = useState(true);   // Is it pomodoro time?
    const [pomodoroTimePassed, setPomodoroTimePassed] = useState(0);    // Time passed in the current pomodoro
    const [currentRepetition, setCurrentRepetition] = useState(1);  // Current repetition number
    const [pauseTime, setPauseTime] = useState(null);  // Time when the session was paused

    const [cookies, setCookie, removeCookie] = useCookies(['session']);


    // Start a new session
    const startSession = async (e) => {
        e.preventDefault(); // Avoid page refresh

        const startTime = Date.now();   // Get the start time
        const initialTimer = pomodoroTime * 3;  // Initial timer value

        // Create a new session in the database with the initial data
        const res = await axios.post('http://localhost:5000/api/pomodoro/start-session', {
            setPomodoroDuration: pomodoroTime,
            setRestDuration: restTime,
            setRepetitions: repetitions,
            maxRepetition: 1,
            completed: false,
            sessionDuration: 0,
            workDuration: 0,
            workPercentage: 0,
        });

        // Create the session object with the initial data
        // It will hold more information than mongoDB
        const sessionData = {   
            ...res.data, 
            timer: initialTimer,
            startTime: startTime,
        };
        setSession(sessionData);    // Set up the session with the initial data

        setCookie('session', sessionData, { path: '/' }); // Store the session data in the cookie

        // Set the timer to its initial value and start it
        setTimer(initialTimer);
        setIsRunning(true);
    };

    // Terminate the session (update the session in the database and clear the session cookie)
    const updateSession = useCallback(async () => {
        try {
            setIsRunning(false);    // Stop the timer

            // Calculate the session details
            const totalTime = Math.floor((Date.now() - session.startTime) / 1000); // in seconds
            const workTime = session.setPomodoroDuration * /*60*/3 * (currentRepetition-1) + pomodoroTimePassed; // in seconds
            const workPercentage = ((workTime / totalTime) * 100).toFixed(2);

            // Save the session details in the database
            const res = await axios.patch(`http://localhost:5000/api/pomodoro/update-session/${session._id}`, {
                setPomodoroDuration: pomodoroTime,
                setRestDuration: restTime,
                setRepetitions: repetitions,
                maxRepetition: currentRepetition,
                completed: session.completed,
                sessionDuration: totalTime,
                workDuration: workTime,
                workPercentage: workPercentage,
            });
            
            // Set the session details to show
            setSessionDetails({
                ...res.data,
            });

            
            removeCookie('session', { path: '/' });   // Clear the session cookie
            
            // Reset all the current states to default
            setSession(null);
            // setPomodoroTime(25); // Let's keep the form values!
            // setRestTime(5);
            // setRepetitions(4);
            setTimer(null);
            setIsPomodoro(true);
            setPomodoroTimePassed(0);
            setCurrentRepetition(1);
            setPauseTime(null);
            

        } catch (error) {
            console.error(error);
        }
    }, [session, currentRepetition, removeCookie, pomodoroTime, restTime, repetitions, pomodoroTimePassed]);


    /* COOKIES HANDLING */

    useEffect(() => {   // Check if there is a session in the cookies and resume it
        if (cookies.session && !session) {
            setSession(cookies.session);
        
            setPomodoroTime(cookies.session.setPomodoroDuration);
            setRestTime(cookies.session.setRestDuration);
            setRepetitions(cookies.session.setRepetitions);

            setTimer(cookies.session.timer);
            setCurrentRepetition(cookies.session.maxRepetition);
            setPomodoroTimePassed(cookies.session.pomodoroTimePassed);

            setIsPomodoro(cookies.session.isPomodoro);
            setPauseTime(cookies.session.pauseTime);
            setIsRunning(cookies.session.isRunning);
        }
    }, [cookies, session]);


    useEffect(() => {   // Constantly update the session cookie with the new data
        if (session) {
            const sessionData = {
                ...session,
                maxRepetition: currentRepetition,

                timer: timer, 
                isPomodoro: isPomodoro,
                pomodoroTimePassed: pomodoroTimePassed,
                pauseTime: pauseTime,
                isRunning: isRunning,
            };
            setCookie('session', sessionData, { path: '/' });   // Update the session cookie
        }
    }, [timer, session, pomodoroTime, restTime, repetitions, isPomodoro, pomodoroTimePassed, currentRepetition, pauseTime, isRunning, setCookie]);


    /* TIMER HANDLING */

    useEffect(() => {   // Main timer logic
        if (session && isRunning) {

            const interval = setInterval(() => {
                setTimer(timer - 1);    // TICK

                if (isPomodoro) {   // Increment the time passed in the current pomodoro cycle
                    setPomodoroTimePassed(pomodoroTimePassed + 1);
                }

                if (timer <= 1) {   // If the timer reaches 0

                    setIsPomodoro(prevIsPomodoro => {   // Switch between pomodoroTime and restTime
                        const nextIsPomodoro = !prevIsPomodoro;
                        setTimer(nextIsPomodoro ? pomodoroTime * 3 : restTime * 3);
                        return nextIsPomodoro;
                    });
                    
                    if(!isPomodoro) {   // If we just finished a pomodoro cycle (pomodoro+rest)
                        setCurrentRepetition(prevRep => {   // Increment the current repetition
                            const nextRep = prevRep + 1;
                            if (nextRep > repetitions) {    // If we reached the last repetition, complete the session
                                session.completed = true;
                                updateSession();
                                return prevRep;
                            }
                            setPomodoroTimePassed(0);   // Reset the time passed in the current pomodoro cycle
                            return nextRep;
                        });
                    }
                }

            }, 1000);   // Update the timer every second

            return () => clearInterval(interval);
        }
    }, [timer, isRunning, isPomodoro, pomodoroTime, restTime, repetitions, session, updateSession, pomodoroTimePassed, currentRepetition]);


    // Utility function to convert seconds into 'XX minutes and XX seconds' format
    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.round(timeInSeconds % 60);
        // We use padStart to add a 0 if the seconds are less than 10
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };


    // Function to toggle pause
    const togglePause = () => {
        if (isRunning) {
            setIsRunning(false);
            setPauseTime(Date.now());
        } else {
            setIsRunning(true);
            setPauseTime(null);
        }
    };


    /* AUTOMATIC SESSION TERMINATION */

    useEffect(() => {   // Pause the session when the user leaves the page
        const handleBeforeUnload = () => {
            if (isRunning) {
                setIsRunning(false);
                setPauseTime(Date.now());
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [session, isRunning]);

    
    useEffect(() => {
        let terminationTimeout;
        if (session && !isRunning && pauseTime) {
            //console.log('paused!')
            const now = Date.now();
            
            const elapsedMinutes = (now - pauseTime) / 1000 / 60;   // Minutes since having been paused
        
            if (elapsedMinutes >= 1) {  // Terminate the session if it has already been 30 minutes  DEBUG: 30 minutes
                updateSession();
                return;
            }
        
            terminationTimeout = setTimeout(() => {  // Terminate the session after 30 minutes of inactivity
                updateSession();
            }, (1 - elapsedMinutes) * 60 * 1000); // Remaining time     DEBUG: 30 minutes
        }
        return () => clearTimeout(terminationTimeout);
    }, [session, isRunning, pauseTime, updateSession]);


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
                    <p>Pomodoro Duration: {sessionDetails.setPomodoroDuration}m</p>
                    <p>Rest Duration: {sessionDetails.setRestDuration}m</p>
                    <p>Repetitions: {sessionDetails.maxRepetition} out of {sessionDetails.setRepetitions}</p>
                    <p>Total Time: {formatTime(sessionDetails.sessionDuration)}</p>
                    <p>Work Time: {formatTime(sessionDetails.workDuration)}</p>
                    <p>Work Percentage: {sessionDetails.workPercentage}%</p>
                    <p>Session Completed: {sessionDetails.completed ? 'Yes :)' : 'No :('}</p>
                    <button className="btn btn-primary mt-3" onClick={() => setSessionDetails(null)}>Back to the form</button>
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