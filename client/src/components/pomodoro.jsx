import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import Footer from './partials/footer';
import Header from './partials/header';
import { formatTime } from './utilities/utilityFunctions';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { Toast } from 'bootstrap';
// The pomodoro timer does not need the time machine, it counts the time passed normally

function PomodoroTimer() {
    axios.defaults.withCredentials = true;
    const [session, setSession] = useState(null); // Current session
    const [sessionDetails, setSessionDetails] = useState(null); // Session details to show after termination

    const [pomodoroTime, setPomodoroTime] = useState(30); // Default pomodoro time (aka work time) in minutes
    const [restTime, setRestTime] = useState(5);  // Default rest time in minutes
    const [repetitions, setRepetitions] = useState(5);    // Default repetition (aka cycle) number

    const [availableHours, setAvailableHours] = useState(0);
    const [availableMinutes, setAvailableMinutes] = useState(0);
    const [proposals, setProposals] = useState([]);

    const [timer, setTimer] = useState(null); // Timer in seconds
    const [isRunning, setIsRunning] = useState(false);    // Is the timer running?
    const [isPomodoro, setIsPomodoro] = useState(true);   // Is it pomodoro time?
    const [workTime, setWorkTime] = useState(0);    // Total time spent working
    const [currentRepetition, setCurrentRepetition] = useState(1);  // Current repetition number
    const [pauseTime, setPauseTime] = useState(null);  // Time when the session was paused

    const [toastMessage, setToastMessage] = useState('');
    const [cookies, setCookie, removeCookie] = useCookies(['session']);


    // Start a new session
    const startSession = async (e) => {
        e.preventDefault(); // Avoid page refresh

        const startTime = Date.now();   // Get the start time
        const initialTimer = pomodoroTime * 60;  // Initial timer value

        // Create a new session in the database with the initial data
        const res = await axios.post('http://localhost:8000/api/pomodoro/start-session', {
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
        // It will hold more fields than mongoDB
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
        showNotification('Timer has started!');
    };

    // Terminate the session (update the session in the database and clear the session cookie)
    const updateSession = useCallback(async () => {
        try {
            setIsRunning(false);    // Stop the timer

            // Calculate the session details
            const totalTime = Math.floor((Date.now() - session.startTime) / 1000); // in seconds
            setWorkTime(workTime)   // Update the total work time
            const workPercentage = ((workTime / totalTime) * 100).toFixed(2);

            // Save the session details in the database
            const res = await axios.patch(`http://localhost:8000/api/pomodoro/update-session/${session._id}`, {
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
            // setPomodoroTime(30); // Let's keep the form input values!
            // setRestTime(5);
            // setRepetitions(5);
            // setAvailableHours(0);
            // setAvailableMinutes(0);
            setTimer(null);
            setIsPomodoro(true);
            setWorkTime(0);
            setCurrentRepetition(1);
            setPauseTime(null);
            
            showNotification('Timer has ended!');

        } catch (error) {
            console.error(error);
        }
    }, [session, currentRepetition, removeCookie, pomodoroTime, restTime, repetitions, workTime]);


    /* COOKIES HANDLING */

    useEffect(() => {   // Check if there is a session in the cookies and resume it
        if (cookies.session && !session) {
            setSession(cookies.session);
        
            setPomodoroTime(cookies.session.setPomodoroDuration);
            setRestTime(cookies.session.setRestDuration);
            setRepetitions(cookies.session.setRepetitions);

            setTimer(cookies.session.timer);
            setCurrentRepetition(cookies.session.maxRepetition);
            setWorkTime(cookies.session.workTime);

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
                workTime: workTime,
                pauseTime: pauseTime,
                isRunning: isRunning,
            };
            setCookie('session', sessionData, { path: '/' });   // Update the session cookie
        }
    }, [timer, session, pomodoroTime, restTime, repetitions, isPomodoro, workTime, currentRepetition, pauseTime, isRunning, setCookie]);


    /* TIMER HANDLING */

    useEffect(() => {   // Main timer logic
        if (session && isRunning) {

            const interval = setInterval(() => {
                setTimer(timer - 1);    // TICK

                if (isPomodoro) {   // Increment the time passed in the current pomodoro cycle
                    setWorkTime(workTime + 1);  // Increment the total work time
                }

                if (timer <= 1) {   // If the timer reaches 0

                    const phase = isPomodoro ? 'Rest Phase' : 'Work Phase'; // Switches for the next phase
                    showNotification(`Switching to ${phase}`);

                    setIsPomodoro(prevIsPomodoro => {   // Switch between pomodoroTime and restTime
                        const nextIsPomodoro = !prevIsPomodoro;
                        setTimer(nextIsPomodoro ? pomodoroTime * 60 : restTime * 60);
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
                            return nextRep;
                        });
                    }
                }

            }, 1000);   // Update the timer every second

            return () => clearInterval(interval);
        }
    }, [timer, isRunning, isPomodoro, pomodoroTime, restTime, repetitions, session, updateSession, currentRepetition, workTime]);


    /* TIME PROPOSAL HANDLING */

    const calculateProposals = useCallback(() => {
        const availableTime = availableHours * 60 + availableMinutes;
        let proposals = [];
    
        if (availableTime >= 20) {
            for (let pomodoroDuration = 45; pomodoroDuration >= 5; pomodoroDuration -= 5) {
                for (let restDuration = Math.min(15, pomodoroDuration - 5); restDuration >= 5; restDuration -= 5) {
                    const cycleTime = pomodoroDuration + restDuration;
                    const repetitions = Math.floor(availableTime / cycleTime);
                    const totalTime = cycleTime * repetitions; // Total session time
                    const difference = Math.abs(availableTime - totalTime);
                    if (repetitions > 0 && difference < 10) {
                        proposals.push({ pomodoroDuration, restDuration, repetitions, difference, totalTime });
                    }
                }
            }
        } else {    // Handle cases where available time is less than 20 minutes
            if (availableTime >= 15) {
                proposals.push({ pomodoroDuration: 15, restDuration: 0, repetitions: 1, totalTime: 15 });
                proposals.push({ pomodoroDuration: 10, restDuration: 5, repetitions: 1, totalTime: 15 });
            } else if (availableTime >= 10) {
                proposals.push({ pomodoroDuration: 10, restDuration: 0, repetitions: 1, totalTime: 10 });
                proposals.push({ pomodoroDuration: 5, restDuration: 5, repetitions: 1, totalTime: 10 });
            } else if (availableTime >= 5) {
                proposals.push({ pomodoroDuration: 5, restDuration: 0, repetitions: 1, totalTime: 5 });
            }
        }
    
        // Sort proposals by the smallest time difference and then by the number of cycles (less cycles preferred)
        proposals.sort((a, b) => a.difference - b.difference || a.repetitions - b.repetitions);
        proposals = proposals.slice(0, 3);  // Show only 3 max
        setProposals(proposals);
    }, [availableHours, availableMinutes]);

    // Function to apply a selected proposal on the form fields
    const applyProposal = (proposal) => {
        setPomodoroTime(proposal.pomodoroDuration);
        setRestTime(proposal.restDuration);
        setRepetitions(proposal.repetitions);
    };

    // Update proposals when available time changes
    useEffect(() => {
        calculateProposals();
    }, [calculateProposals]);


    /* BUTTON HANDLERS */

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

    // Function to terminate a single phase (pomodoro/rest)
    const skipPhase = () => {
        if (isPomodoro) {
            // If it's Pomodoro time, switch to rest time immediately
            setIsPomodoro(false);
            setTimer(restTime * 60);
            showNotification('Switching to Rest Phase');
        } else {
            // If it's rest time, check for repetitions left
            if (currentRepetition < repetitions) {
                setIsPomodoro(true);
                setTimer(pomodoroTime * 60);
                setCurrentRepetition(currentRepetition + 1);
                setIsRunning(true);
                showNotification('Switching to Work Phase');
            } else {
                session.completed = true;   // maybe not?
                updateSession();
            }
        }
    };

    // Function to restart the current cycle
    const restartCycle = () => {
        setIsPomodoro(true); // Switch back to current work phase
        setTimer(pomodoroTime * 60);
        setIsRunning(true);
        //showNotification('Restarting current cycle');
    };

    // Function to end the current cycle
    const endCycle = () => {
        if (currentRepetition < repetitions) {
            setCurrentRepetition(currentRepetition + 1);
            setIsPomodoro(true); // Start with the next pomodoro phase
            setTimer(pomodoroTime * 60);
            setIsRunning(true);
        } else {
            session.completed = true;   // maybe not?
            updateSession();
        }
    };

    /* NOTIFICATIONS */

    // // Request permission for notifications.
    // // Not implemented: BROWSER NOTIFS DO NOT WORK, NEEDS HTTPS
    // useEffect(() => {
    //     Notification.requestPermission();
    // }, []);

    const showNotification = (message) => {
        setToastMessage(message); // Assuming there's a useState hook for toastMessage
        const toastEl = document.getElementById('pomodoroToast');
        const toast = new Toast(toastEl);
        toast.show();
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
            //console.log('paused!')    // DEBUG
            const now = Date.now();
            
            const elapsedMinutes = (now - pauseTime) / 1000 / 60;   // Minutes since having been paused
        
            if (elapsedMinutes >= 30) {  // Terminate the session if it has already been 30 minutes  DEBUG: fare 30 minuti
                updateSession();
                return;
            }
        
            terminationTimeout = setTimeout(() => {  // Terminate the session after 30 minutes of inactivity
                updateSession();
            }, (30 - elapsedMinutes) * 60 * 1000); // Remaining time     DEBUG: fare 30 minuti
        }
        return () => clearTimeout(terminationTimeout);
    }, [session, isRunning, pauseTime, updateSession]);



    return (
        <>
        <Header />
        {/* Notification Toast */}
        <div aria-live="polite" aria-atomic="true" className="position-relative">
            <div className="toast-container position-absolute top-0 end-0 p-3">
                <div id="pomodoroToast" className="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="toast-header">
                        <strong className="me-auto">Pomodoro Timer</strong>
                        <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div className="toast-body">
                        {toastMessage}
                    </div>
                </div>
            </div>
        </div>

        <div className="container text-center">
        {sessionDetails ? (
            <div className="card my-5 mx-auto w-100 w-md-75">
                <div className="card-header">
                    <h1>Session Details</h1>
                </div>
                <div className="card-body">
                    <p>Set Working Time & Pause Time: {sessionDetails.setPomodoroDuration}m & {sessionDetails.setRestDuration}m</p>
                    <p>Time spent in session: {formatTime(sessionDetails.sessionDuration)}</p>
                    <p>Time spent working: {formatTime(sessionDetails.workDuration)}, equal to {sessionDetails.workPercentage}% of the session</p>
                    <p>Cycle reached: {sessionDetails.maxRepetition} out of {sessionDetails.setRepetitions}</p>
                    <p>Session Completed: {sessionDetails.completed ? 'Yes :)' : 'No :('}</p>
                    <button className="btn btn-primary mt-3" onClick={() => setSessionDetails(null)}>Back to the form</button>
                </div>
            </div>
        ) : session ? (
            <div>
                <h1 className="mt-2 display-4">{isPomodoro ? 'Working' : 'Resting'}</h1>

                <div className="timer-div">
                    <p className="display-1">{formatTime(timer)}</p>

                    {/* Animation */}
                    <div style={{height:'80px', display:'flex', justifyContent:'center', alignItems:'center' }}>
                    {!isRunning ? (
                            <i id="pauseanim_pomodoro" className="fa fa-pause" aria-hidden="true" onClick={togglePause}></i>
                    ) : isPomodoro ? (
                        <div className="lds-dual-ring text-danger" onClick={togglePause}></div>
                    ) : (
                        <div className="lds-heart text-info" onClick={togglePause}><div></div></div>
                    )}
                    </div>
                </div>


                <p className="display-6">Current cycle: {currentRepetition} out of {repetitions}</p>
                <ProgressBar now={isPomodoro ? pomodoroTime * 60 - timer : restTime * 60 - timer} 
                max={isPomodoro ? pomodoroTime * 60 : restTime * 60}
                variant={isPomodoro ? 'danger' : 'info'} />

                <div className="button-container" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <button className="btn btn-primary my-4" onClick={togglePause}>{isRunning ? 'Pause' : 'Unpause'}</button>
                
                <div className="btn-group">    {/* Button group for the cycle controls */}
                    <button className="btn btn-secondary" onClick={restartCycle}><i className="fa fa-undo" aria-hidden="true"></i> Restart Cycle</button>
                    <button className="btn btn-secondary mx-1" onClick={skipPhase}><i className="fa fa-step-forward" aria-hidden="true"></i> Skip Phase</button>
                    <button className="btn btn-secondary" onClick={endCycle}><i className="fa fa-fast-forward" aria-hidden="true"></i> Next Cycle</button>
                </div>

                <button className="btn btn-danger my-4" onClick={updateSession}>Terminate Session</button>
                </div>
            </div>
        ) : (
            <form onSubmit={startSession} className="mt-5">
                <div className="container">
                    <div className="row mb-4">
                        <div className="col-md-4">
                            <div className="form-group">
                                <label>Work Time</label>
                                <input type="number" min="1" value={pomodoroTime} onChange={(e) => setPomodoroTime(e.target.value)} className="form-control w-auto mx-auto" />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label>Rest Time</label>
                                <input type="number" min="0" value={restTime} onChange={(e) => setRestTime(e.target.value)} className="form-control w-auto mx-auto" />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label>Cycles</label>
                                <input type="number" min="1" value={repetitions} onChange={(e) => setRepetitions(e.target.value)} className="form-control w-auto mx-auto" />
                            </div>
                        </div>
                    </div>

                    <hr className="d-block d-md-none my-3" style={{ borderColor: 'gray' }}/> {/* break on small screens */}

                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>Available Hours</label>
                                <input type="number" min="0" value={availableHours} onChange={(e) => setAvailableHours(parseInt(e.target.value) || 0)} className="form-control w-auto mx-auto" />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>Available Minutes</label>
                                <input type="number" min="0" value={availableMinutes} onChange={(e) => setAvailableMinutes(parseInt(e.target.value) || 0)} className="form-control w-auto mx-auto" />
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    {proposals.length > 0 && <h4>Proposals</h4>}
                    {proposals.map((proposal, index) => (
                        <div key={index} className="mb-2"> {/* Wrap each button in a div with a bottom margin */}
                            <button type="button" className="btn btn-outline-primary w-20" onClick={() => applyProposal(proposal)}>
                                Work/Rest: {proposal.pomodoroDuration}m/{proposal.restDuration}m, {proposal.repetitions} cycles - Total Session Time: {proposal.totalTime}m
                            </button>
                        </div>
                    ))}
                </div>

                <div className="d-flex justify-content-center my-4">
                    <button type="submit" className="btn btn-primary btn-lg text-center">Start Pomodoro</button>
                </div>
            </form>
        )}
        </div>
        <Footer />
        </>
    );
}

export default PomodoroTimer;