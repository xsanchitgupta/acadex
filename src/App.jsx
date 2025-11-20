import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInAnonymously, 
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    collection, 
    query, 
    getDocs, 
    getDoc,
    addDoc,
    updateDoc, 
    setDoc,
    onSnapshot,
    serverTimestamp,
    deleteDoc
} from 'firebase/firestore';

// --- Icons (Lucide Styled) ---
const Icon = ({ children, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{children}</svg>
);
const TeamIcon = (props) => <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>;
const ProgressIcon = (props) => <Icon {...props}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></Icon>;
const ReportIcon = (props) => <Icon {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></Icon>;
const DatabaseIcon = (props) => <Icon {...props}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12A9 3 0 0 0 21 12"/><path d="M3 19A9 3 0 0 0 21 19"/></Icon>;
const EvaluateIcon = (props) => <Icon {...props}><path d="M12 20h.01"/><path d="M8.2 11.2a2 2 0 1 0 2.8 2.8"/><path d="M14.8 11.2a2 2 0 1 0 2.8 2.8"/><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/></Icon>;
const PlusIcon = (props) => <Icon {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Icon>;
const TrashIcon = (props) => <Icon {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M15 6V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2"/></Icon>;
const CheckCircleIcon = (props) => <Icon {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Icon>;
const LogOutIcon = (props) => <Icon {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Icon>;
const UserIcon = (props) => <Icon {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>;
const SunIcon = (props) => <Icon {...props}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></Icon>;
const MoonIcon = (props) => <Icon {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></Icon>;
const ShieldIcon = (props) => <Icon {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>;
const LinkIcon = (props) => <Icon {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Icon>;
const FileIcon = (props) => <Icon {...props}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></Icon>;
const SaveIcon = (props) => <Icon {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></Icon>;
const SendIcon = (props) => <Icon {...props}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Icon>;
const MailIcon = (props) => <Icon {...props}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Icon>;
const ClockIcon = (props) => <Icon {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;
const CameraIcon = (props) => <Icon {...props}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></Icon>;
const DownloadIcon = (props) => <Icon {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Icon>;
const EyeIcon = (props) => <Icon {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Icon>;
const GoogleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>;

// --- Configuration ---
const VIEWS = { DASHBOARD: 'Dashboard', REGISTRATION: 'Registration', TRACKING: 'Progress', REPORTS: 'Reports', DATABASE: 'Projects', EVALUATION: 'Evaluation', ADMIN: 'Admin', PROFILE: 'Profile' };
const AUTH_VIEWS = { INIT: 'Initial', LOGIN: 'Login', SIGNUP: 'SignUp' };
const INITIAL_EVALUATION = { score: 0, feedback: "Awaiting review.", status: "Pending" };
const ADMIN_EMAIL = "admin@protrack.edu";
const ANONYMOUS_NAME_PREFIX = "Guest_";

// --- Firebase Setup ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = {
  apiKey: "AIzaSyBVFyZfJr6fiYEM9lUf4IaknxzVkuIXGRM",
  authDomain: "sapms-388b6.firebaseapp.com",
  projectId: "sapms-388b6",
  storageBucket: "sapms-388b6.firebasestorage.app",
  messagingSenderId: "666326725274",
  appId: "1:666326725274:web:780b44eeeca613c6c56523",
  measurementId: "G-NWY76GF5KN"
};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

export default function App() {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userProfile, setUserProfile] = useState({ bio: '', title: 'Student', photoURL: '' });
    const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);
    const [projects, setProjects] = useState([]);
    const [userTeam, setUserTeam] = useState(null);
    const [error, setError] = useState(null);
    const [authView, setAuthView] = useState(AUTH_VIEWS.INIT);
    const [isUserAdmin, setIsUserAdmin] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [adminSelectedProject, setAdminSelectedProject] = useState(null);

    // --- Modern Theme Engine ---
    const toggleTheme = () => setDarkMode(!darkMode);
    
    const theme = {
        appBg: darkMode ? 'bg-gray-950' : 'bg-white',
        navBg: darkMode ? 'bg-gray-900/80 backdrop-blur-xl border-b border-gray-800' : 'bg-white/90 backdrop-blur-xl border-b border-gray-200',
        textPrimary: darkMode ? 'text-white' : 'text-slate-900',
        textSecondary: darkMode ? 'text-gray-400' : 'text-slate-500',
        heading: darkMode ? 'text-white' : 'text-slate-900',
        card: darkMode 
            ? 'bg-gray-800/50 border border-gray-700 shadow-xl' 
            : 'bg-white border border-gray-200 shadow-lg shadow-slate-200/40',
        input: darkMode 
            ? 'bg-gray-900/50 border-gray-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
            : 'bg-white border-gray-300 text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600',
        accentPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20',
        accentSecondary: darkMode 
            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
            : 'bg-gray-100 hover:bg-gray-200 text-slate-700 border border-gray-200',
        navItem: darkMode 
            ? 'text-gray-400 hover:bg-gray-800 hover:text-white' 
            : 'text-slate-500 hover:bg-gray-100 hover:text-indigo-600',
        navActive: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30',
        success: 'text-emerald-500',
        warning: 'text-amber-500',
        danger: 'text-rose-500'
    };

    // --- Init & Auth ---
    useEffect(() => {
        if (Object.keys(firebaseConfig).length === 0) { setError("Config missing."); return; }
        try {
            const app = initializeApp(firebaseConfig);
            setDb(getFirestore(app));
            setAuth(getAuth(app));
        } catch (e) { setError(`Init Failed: ${e.message}`); }
    }, []);

    useEffect(() => {
        if (!auth) return;
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                const email = user.email || '';
                setUserEmail(email);
                const name = user.displayName || (user.isAnonymous ? `${ANONYMOUS_NAME_PREFIX}${user.uid.slice(0,4)}` : email.split('@')[0]);
                setUserName(name);
                setIsUserAdmin(email.toLowerCase() === ADMIN_EMAIL);
            } else {
                setUserId(null);
                setIsUserAdmin(false);
                setUserEmail('');
            }
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, [auth]);

    // --- User Profile Sync ---
    useEffect(() => {
        if (!db || !userId) return;
        const userDocRef = doc(db, 'artifacts', appId, 'users', userId);
        
        const fetchProfile = async () => {
            try {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserProfile({
                        bio: data.bio || '',
                        title: data.title || 'Student',
                        photoURL: data.photoURL || ''
                    });
                    if (data.displayName) setUserName(data.displayName);
                }
            } catch (e) {
                console.warn("Profile fetch warning:", e);
            }
        };
        fetchProfile();
    }, [db, userId, appId]);


    // --- Handlers ---
    const handleAction = async (action, ...args) => {
        try {
            if (action === 'login') await signInWithEmailAndPassword(auth, ...args);
            if (action === 'signup') await createUserWithEmailAndPassword(auth, ...args);
            if (action === 'google') await signInWithPopup(auth, new GoogleAuthProvider());
            if (action === 'anon') await signInAnonymously(auth);
            if (action === 'logout') { await signOut(auth); setCurrentView(VIEWS.DASHBOARD); setAuthView(AUTH_VIEWS.INIT); }
            alertUser('success', 'Action successful');
            if (action !== 'logout') setAuthView(AUTH_VIEWS.INIT);
        } catch (e) { alertUser('error', e.message); }
    };

    // --- Data Sync ---
    useEffect(() => {
        if (!db || !userId) return;
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'projects'));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setProjects(data);
            
            const myTeam = data.find(p => 
                p.members?.some(m => m.id === userId || (m.email && m.email === userEmail && userEmail !== ''))
            );
            setUserTeam(myTeam || null);
        });
        return () => unsub();
    }, [db, userId, appId, userEmail]);

    // --- Logic Functions ---
    const registerTeam = async (tName, pName, memberEmails) => {
        if (!userEmail) return alertUser('error', 'You must have an email to register a team.');
        if (projects.some(p => p.name.toLowerCase() === pName.toLowerCase())) return alertUser('error', 'Project name taken');
        
        const newMembers = [
            { id: userId, name: userName, email: userEmail, role: "Lead", status: "accepted" },
            ...memberEmails.map(email => ({ email: email.trim(), role: "Member", status: "pending", name: "Invited User" }))
        ];

        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'projects'), {
            teamName: tName, name: pName, members: newMembers, description: `Project ${pName}`,
            tasks: [], 
            report: "", reportStatus: "Draft", resources: [], files: [], evaluation: INITIAL_EVALUATION, createdAt: serverTimestamp()
        });
        alertUser('success', 'Team Registered! Invitations sent.');
        setCurrentView(VIEWS.DASHBOARD);
    };

    const acceptInvite = async () => {
        if (!userTeam) return;
        const updatedMembers = userTeam.members.map(m => 
            (m.email === userEmail) ? { ...m, id: userId, name: userName, status: 'accepted' } : m
        );
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'projects', userTeam.id), { members: updatedMembers });
        alertUser('success', 'Invitation Accepted!');
    };

    const declineInvite = async () => {
        if (!userTeam) return;
        const updatedMembers = userTeam.members.filter(m => m.email !== userEmail);
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'projects', userTeam.id), { members: updatedMembers });
        alertUser('info', 'Invitation Declined');
        setUserTeam(null);
    };

    const updateReport = async (report, resources, files, status = "Draft") => {
        if (status === 'Submitted' && !window.confirm("Are you sure you want to submit?")) return;
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'projects', userTeam.id), { report, resources, files, reportStatus: status });
        alertUser('success', status === 'Submitted' ? 'Submitted Successfully!' : 'Draft Saved');
    };

    const deleteProj = async (id) => {
        if (window.confirm("Delete project?")) {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'projects', id));
            alertUser('success', 'Deleted');
        }
    };

    const alertUser = (type, msg) => {
        const el = document.getElementById('toast');
        if (el) {
            el.innerHTML = `<div class="px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} text-white"><span class="font-medium">${msg}</span></div>`;
            el.classList.remove('translate-y-20', 'opacity-0');
            setTimeout(() => el.classList.add('translate-y-20', 'opacity-0'), 3000);
        }
    };

    const isTeamActive = useMemo(() => {
        return userTeam && userTeam.members.every(m => m.status === 'accepted');
    }, [userTeam]);

    // --- UI Components ---
    const Card = ({ children, className = "" }) => (
        <div className={`${theme.card} rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${className}`}>{children}</div>
    );

    const Button = ({ children, variant = "primary", onClick, className = "", ...props }) => (
        <button 
            onClick={onClick} 
            className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${variant === 'primary' ? theme.accentPrimary : theme.accentSecondary} ${className}`} 
            {...props}
        >
            {children}
        </button>
    );

    const Input = (props) => (
        <input {...props} className={`w-full px-4 py-3 rounded-xl transition-all outline-none ${theme.input}`} />
    );

    // --- Views ---
    const ProfileView = () => {
        const [formData, setFormData] = useState({
            displayName: userName,
            title: userProfile.title,
            bio: userProfile.bio,
            photoURL: userProfile.photoURL
        });
        const [loading, setLoading] = useState(false);

        const handleImageUpload = (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 1048576) { // 1MB limit
                    alertUser('error', 'Image size must be less than 1MB');
                    return;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({ ...prev, photoURL: reader.result }));
                };
                reader.readAsDataURL(file);
            }
        };

        const saveProfile = async () => {
            setLoading(true);
            try {
                if (auth.currentUser) {
                    const profileUpdates = {
                        displayName: formData.displayName
                    };
                    if (formData.photoURL && !formData.photoURL.startsWith('data:')) {
                         profileUpdates.photoURL = formData.photoURL;
                    }
                    await updateProfile(auth.currentUser, profileUpdates);
                }
                
                await setDoc(doc(db, 'artifacts', appId, 'users', userId), {
                    displayName: formData.displayName,
                    title: formData.title,
                    bio: formData.bio,
                    photoURL: formData.photoURL, 
                    email: userEmail,
                    updatedAt: serverTimestamp()
                }, { merge: true });

                setUserName(formData.displayName);
                setUserProfile({ ...userProfile, bio: formData.bio, title: formData.title, photoURL: formData.photoURL });
                alertUser('success', 'Profile updated successfully!');
            } catch (e) {
                console.error(e);
                alertUser('error', 'Failed to save profile');
            }
            setLoading(false);
        };

        return (
            <div className="max-w-4xl mx-auto">
                <Card className="overflow-hidden">
                    <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-xl mb-12">
                        <div className="absolute -bottom-10 left-8">
                            <div className="relative group">
                                <div className={`w-24 h-24 rounded-full border-4 ${darkMode ? 'border-gray-800' : 'border-white'} overflow-hidden bg-gray-200 flex items-center justify-center`}>
                                    {formData.photoURL ? (
                                        <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-gray-400">{formData.displayName?.charAt(0)}</span>
                                    )}
                                </div>
                                <label htmlFor="pic-upload" className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full text-white cursor-pointer shadow-lg hover:bg-indigo-700 transition-colors">
                                    <CameraIcon className="w-4 h-4" />
                                    <input type="file" id="pic-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div className="px-8 pb-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className={`text-sm font-medium ${theme.textSecondary}`}>Full Name</label>
                                <Input value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} />
                            </div>
                             <div className="space-y-2">
                                <label className={`text-sm font-medium ${theme.textSecondary}`}>Role / Title</label>
                                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Senior Student" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className={`text-sm font-medium ${theme.textSecondary}`}>Bio</label>
                                <textarea 
                                    value={formData.bio} 
                                    onChange={e => setFormData({...formData, bio: e.target.value})} 
                                    rows="4" 
                                    className={`w-full p-4 rounded-xl outline-none ${theme.input}`} 
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={saveProfile} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    const AuthScreen = () => {
        const [creds, setCreds] = useState({ email: '', pass: '' });
        return (
            <div className={`min-h-screen flex items-center justify-center p-4 ${theme.appBg} transition-colors duration-500`}>
                <Card className="w-full max-w-md space-y-8 !p-10">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/30">
                            <TeamIcon className="w-8 h-8 text-white" />
                        </div>
                        <h1 className={`text-3xl font-bold ${theme.heading}`}>Welcome Back</h1>
                        <p className={`mt-2 ${theme.textSecondary}`}>Academic Project Management</p>
                    </div>

                    {authView === AUTH_VIEWS.INIT ? (
                        <div className="space-y-3">
                            <Button onClick={() => setAuthView(AUTH_VIEWS.LOGIN)} className="w-full">Sign In with Email</Button>
                            <Button variant="secondary" onClick={() => handleAction('google')} className="w-full"><GoogleIcon className="w-5 h-5 mr-2" /> Google Sign In</Button>
                            <div className={`relative py-2 flex items-center`}>
                                <div className={`flex-grow border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                                <span className={`flex-shrink-0 mx-4 text-xs uppercase ${theme.textSecondary}`}>Or continue as</span>
                                <div className={`flex-grow border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                            </div>
                            <Button variant="secondary" onClick={() => handleAction('anon')} className="w-full">Guest Student</Button>
                        </div>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); handleAction(authView === AUTH_VIEWS.LOGIN ? 'login' : 'signup', creds.email, creds.pass); }} className="space-y-4">
                            <Input type="email" placeholder="Email Address" value={creds.email} onChange={e => setCreds({...creds, email: e.target.value})} required />
                            <Input type="password" placeholder="Password" value={creds.pass} onChange={e => setCreds({...creds, pass: e.target.value})} required />
                            <Button className="w-full">{authView === AUTH_VIEWS.LOGIN ? 'Login' : 'Create Account'}</Button>
                            <p className={`text-center text-sm ${theme.textSecondary} cursor-pointer hover:${theme.textPrimary}`} onClick={() => setAuthView(authView === AUTH_VIEWS.LOGIN ? AUTH_VIEWS.SIGNUP : AUTH_VIEWS.LOGIN)}>
                                {authView === AUTH_VIEWS.LOGIN ? "New here? Create account" : "Already have an account? Login"}
                            </p>
                        </form>
                    )}
                </Card>
            </div>
        );
    };

    const RegistrationView = () => {
        const [form, setForm] = useState({ team: '', project: '' });
        const [memberEmails, setMemberEmails] = useState(['']);

        if (userTeam) return <div className={`text-center p-10 ${theme.textSecondary}`}>You are already in a team: <span className={theme.heading}>{userTeam.teamName}</span></div>;
        if (!userEmail) return <div className={`text-center p-10 ${theme.textSecondary}`}>Please login with an email to create a team and invite members.</div>;
        
        const addEmailField = () => setMemberEmails([...memberEmails, '']);
        const updateEmail = (index, value) => {
            const newEmails = [...memberEmails];
            newEmails[index] = value;
            setMemberEmails(newEmails);
        };
        const removeEmail = (index) => {
            if (memberEmails.length > 1) {
                setMemberEmails(memberEmails.filter((_, i) => i !== index));
            }
        };

        return (
            <div className="max-w-2xl mx-auto">
                <Card>
                    <h2 className={`text-2xl font-bold ${theme.heading} mb-6`}>Register New Project</h2>
                    <div className="space-y-5">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${theme.textSecondary}`}>Team Name</label>
                            <Input value={form.team} onChange={e => setForm({...form, team: e.target.value})} placeholder="e.g. Alpha Squad" />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${theme.textSecondary}`}>Project Title</label>
                            <Input value={form.project} onChange={e => setForm({...form, project: e.target.value})} placeholder="e.g. AI Traffic Control" />
                        </div>
                        
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${theme.textSecondary}`}>Invite Members (Emails)</label>
                            <div className="space-y-2">
                                {memberEmails.map((email, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input 
                                            value={email} 
                                            onChange={e => updateEmail(index, e.target.value)} 
                                            placeholder={`Member ${index + 1} Email`} 
                                        />
                                        {memberEmails.length > 1 && (
                                            <button onClick={() => removeEmail(index)} className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button onClick={addEmailField} className={`mt-2 text-sm font-medium ${theme.accentText} flex items-center gap-1 hover:underline`}>
                                <PlusIcon className="w-4 h-4" /> Add another member
                            </button>
                        </div>

                        <Button onClick={() => registerTeam(form.team, form.project, memberEmails.filter(x => x.trim()))} className="w-full">Send Proposals & Create</Button>
                    </div>
                </Card>
            </div>
        );
    };

    const ProjectRequiredMessage = ({ viewName }) => {
        if (!userTeam) return <div className={`text-center ${theme.textSecondary} p-12`}>Please register a team first.</div>;
        if (!isTeamActive) return (
            <div className={`text-center p-12`}>
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4"><ClockIcon className="w-8 h-8"/></div>
                <h3 className={`text-xl font-bold ${theme.heading}`}>Team Formation In Progress</h3>
                <p className={`mt-2 ${theme.textSecondary}`}>All members must accept the project proposal before you can access {viewName}.</p>
            </div>
        );
        return null;
    };

    const ProgressTrackingView = () => {
        if (!userTeam || !isTeamActive) return <ProjectRequiredMessage viewName={VIEWS.TRACKING} />;
        
        const isLead = userTeam.members.find(m => m.id === userId)?.role === 'Lead';
        const [newTask, setNewTask] = useState({ title: '', assigneeId: userTeam.members[0]?.id, date: '' });
        
        const addTask = async () => {
            if (!newTask.title || !newTask.date) return alertUser('error', 'Please fill in all task details');
            const assignee = userTeam.members.find(m => m.id === newTask.assigneeId) || userTeam.members[0];
            const task = {
                id: crypto.randomUUID(),
                title: newTask.title,
                assigneeId: assignee.id,
                assigneeName: assignee.name,
                dueDate: newTask.date,
                completed: false
            };
            const updatedTasks = [...(userTeam.tasks || []), task];
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'projects', userTeam.id), { tasks: updatedTasks });
            setNewTask({ title: '', assigneeId: userTeam.members[0]?.id, date: '' });
            alertUser('success', 'Task assigned');
        };

        const toggleTask = async (taskId, currentStatus, assigneeId) => {
            if (!isLead && userId !== assigneeId) {
                alertUser('error', "Only the assignee or Team Lead can update this task.");
                return;
            }
            const updatedTasks = (userTeam.tasks || []).map(t => 
                t.id === taskId ? { ...t, completed: !currentStatus } : t
            );
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'projects', userTeam.id), { tasks: updatedTasks });
        };

        const deleteTask = async (taskId) => {
             if (!isLead) return;
             const updatedTasks = (userTeam.tasks || []).filter(t => t.id !== taskId);
             await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'projects', userTeam.id), { tasks: updatedTasks });
        };

        const tasks = userTeam.tasks || [];
        const completedCount = tasks.filter(t => t.completed).length;
        const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className={`text-xl font-bold ${theme.heading}`}>Project Tasks</h3>
                        <span className={`text-sm font-mono ${theme.textSecondary}`}>{completedCount}/{tasks.length} Completed</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-8">
                         <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>

                    {isLead && (
                        <div className={`p-4 rounded-xl mb-6 ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                            <h4 className={`text-sm font-bold mb-3 ${theme.heading}`}>Assign New Task</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div className="md:col-span-2">
                                    <Input placeholder="Task Description" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                                </div>
                                <select className={`w-full px-4 py-3 rounded-xl outline-none ${theme.input}`} value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}>
                                    {userTeam.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                                <Input type="date" value={newTask.date} onChange={e => setNewTask({...newTask, date: e.target.value})} />
                            </div>
                            <Button onClick={addTask} className="w-full mt-3">Assign Task</Button>
                        </div>
                    )}

                    <div className="space-y-3">
                        {tasks.length === 0 ? (
                            <p className={`text-center py-8 ${theme.textSecondary}`}>No tasks assigned yet.</p>
                        ) : (
                            tasks.map(t => (
                                <div key={t.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${t.completed ? (darkMode ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50 border-emerald-200') : (darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm')}`}>
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <button 
                                            onClick={() => toggleTask(t.id, t.completed, t.assigneeId)}
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                t.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-400 text-transparent hover:border-emerald-500'
                                            } ${(!isLead && userId !== t.assigneeId) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <CheckCircleIcon className="w-4 h-4" />
                                        </button>
                                        <div className="min-w-0">
                                            <p className={`font-medium truncate ${t.completed ? 'line-through opacity-50' : ''} ${theme.textPrimary}`}>{t.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                                                    <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] text-white font-bold">{t.assigneeName?.charAt(0)}</div>
                                                    <span className={`text-xs ${theme.textSecondary}`}>{t.assigneeName}</span>
                                                </div>
                                                <span className={`text-xs ${theme.textSecondary}`}>Due: {t.dueDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {isLead && <button onClick={() => deleteTask(t.id)} className="text-gray-400 hover:text-rose-500 p-2"><TrashIcon className="w-4 h-4" /></button>}
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        );
    };

    const ReportView = () => {
        if (!userTeam || !isTeamActive) return <ProjectRequiredMessage viewName={VIEWS.REPORTS} />;
        const [content, setContent] = useState(userTeam.report || '');
        const [linkInput, setLinkInput] = useState('');
        const [resources, setResources] = useState(userTeam.resources || []);
        const [files, setFiles] = useState(userTeam.files || []);
        const reportStatus = userTeam.reportStatus || 'Draft';
        const isSubmitted = reportStatus === 'Submitted';

        // Sync local state with team data changes to ensure all members see the same files
        useEffect(() => {
            if (userTeam) {
                setContent(userTeam.report || '');
                setResources(userTeam.resources || []);
                setFiles(userTeam.files || []);
            }
        }, [userTeam]);

        const handleFileUpload = (e) => {
            if (isSubmitted) return;
            const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, size: (f.size/1024).toFixed(2)+' KB', date: new Date().toLocaleDateString(), url: "#" })); // Simulated URL for demo
            const updatedFiles = [...files, ...newFiles];
            setFiles(updatedFiles);
            // Auto-save files to allow real-time sync
            updateReport(content, resources, updatedFiles, 'Draft');
        };

        const addResource = () => {
            if(linkInput && !isSubmitted) { 
                const newResources = [...resources, { url: linkInput, type: 'link' }];
                setResources(newResources);
                setLinkInput('');
                updateReport(content, newResources, files, 'Draft');
            }
        };

        return (
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div><h2 className={`text-3xl font-bold ${theme.heading}`}>Final Submission</h2><p className={`${theme.textSecondary}`}>Upload documents and links.</p></div>
                    <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${isSubmitted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>Status: {reportStatus}</div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 space-y-4">
                        <h3 className={`text-xl font-bold ${theme.heading}`}>Executive Summary</h3>
                        <textarea value={content} onChange={e => setContent(e.target.value)} rows="16" disabled={isSubmitted} className={`w-full p-5 rounded-xl outline-none resize-y font-mono text-sm leading-relaxed ${theme.input} ${isSubmitted ? 'opacity-70 cursor-not-allowed' : ''}`} placeholder="# Project Abstract..." />
                    </Card>
                    <div className="space-y-6">
                        <Card>
                            <h3 className={`text-lg font-bold ${theme.heading} mb-4 flex items-center`}><FileIcon className="w-5 h-5 mr-2"/> Files</h3>
                            {!isSubmitted && <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors mb-4 ${darkMode ? 'border-gray-700 hover:border-indigo-500' : 'border-gray-300 hover:border-indigo-500'}`}><input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" /><label htmlFor="file-upload" className="cursor-pointer block"><div className="mx-auto w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2"><PlusIcon className="w-5 h-5"/></div><p className={`text-xs font-medium ${theme.textPrimary}`}>Upload</p></label></div>}
                            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">{files.map((f, i) => (
                                <li key={i} className={`flex items-center justify-between p-3 rounded-lg group ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50 border border-gray-100'}`}>
                                    <div className="overflow-hidden flex-1">
                                        <div className="flex items-center">
                                            <p className={`text-sm font-medium ${theme.textPrimary} truncate flex-1`}>{f.name}</p>
                                            {/* Dedicated Download Button for Team Members */}
                                            <a href={f.url} target="_blank" rel="noopener noreferrer" className={`ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-indigo-500`} title="Download File">
                                                <DownloadIcon className="w-4 h-4" />
                                            </a>
                                        </div>
                                        <p className={`text-[10px] ${theme.textSecondary}`}>{f.size}</p>
                                    </div>
                                    {!isSubmitted && <button onClick={() => {
                                        const newFiles = files.filter((_, idx) => idx !== i);
                                        setFiles(newFiles);
                                        updateReport(content, resources, newFiles, 'Draft');
                                    }} className="text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 ml-2"><TrashIcon className="w-4 h-4"/></button>}
                                </li>
                            ))}</ul>
                        </Card>
                        <Card>
                            <h3 className={`text-lg font-bold ${theme.heading} mb-4 flex items-center`}><LinkIcon className="w-5 h-5 mr-2"/> Links</h3>
                            {!isSubmitted && <div className="flex space-x-2 mb-4"><input value={linkInput} onChange={e => setLinkInput(e.target.value)} placeholder="https://..." className={`flex-1 px-3 py-2 text-sm rounded-lg outline-none ${theme.input}`} /><button onClick={addResource} className={`p-2 rounded-lg ${theme.accentPrimary}`}><PlusIcon className="w-4 h-4"/></button></div>}
                            <ul className="space-y-2">{resources.map((r, i) => (<li key={i} className={`flex items-center justify-between p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}><a href={r.url} target="_blank" rel="noreferrer" className="text-blue-500 truncate hover:underline text-sm flex-1">{r.url}</a>{!isSubmitted && <button onClick={() => {
                                const newRes = resources.filter((_, idx) => idx !== i);
                                setResources(newRes);
                                updateReport(content, newRes, files, 'Draft');
                            }} className="text-gray-400 hover:text-rose-500 ml-2"><TrashIcon className="w-3 h-3"/></button>}</li>))}</ul>
                        </Card>
                    </div>
                </div>
                {!isSubmitted && <div className={`sticky bottom-0 p-4 ${theme.card} border-t backdrop-blur-lg rounded-xl flex justify-between items-center`}><p className={`text-sm ${theme.textSecondary}`}>Last saved: {new Date().toLocaleTimeString()}</p><div className="flex space-x-4"><Button variant="secondary" onClick={() => updateReport(content, resources, files, 'Draft')}><SaveIcon className="w-4 h-4 mr-2" /> Save Draft</Button><Button onClick={() => updateReport(content, resources, files, 'Submitted')}><SendIcon className="w-4 h-4 mr-2" /> Submit Final</Button></div></div>}
            </div>
        );
    };

    // New Admin Submission View Component
    const AdminSubmissionView = ({ project, onBack }) => (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between mb-4">
                 <button onClick={onBack} className={`text-sm ${theme.accentText} hover:underline flex items-center`}><span className="mr-1">←</span> Back to List</button>
                 <h2 className={`text-2xl font-bold ${theme.heading}`}>Reviewing: {project.name}</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 space-y-4">
                    <h3 className={`text-xl font-bold ${theme.heading}`}>Executive Summary</h3>
                    <div className={`w-full p-5 rounded-xl min-h-[300px] font-mono text-sm leading-relaxed whitespace-pre-wrap ${theme.input}`}>
                        {project.report || "No report content submitted."}
                    </div>
                </Card>
                <div className="space-y-6">
                    <Card>
                        <h3 className={`text-lg font-bold ${theme.heading} mb-4 flex items-center`}><FileIcon className="w-5 h-5 mr-2"/> Submitted Files</h3>
                        <ul className="space-y-3">
                            {(project.files || []).map((f, i) => (
                                <li key={i} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50 border border-gray-100'}`}>
                                    <div className="overflow-hidden flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm font-medium ${theme.textPrimary} truncate`}>{f.name}</span>
                                            {/* Explicit Download for Admin */}
                                            <a href={f.url} target="_blank" rel="noopener noreferrer" className="ml-2 p-1 text-indigo-500 hover:bg-indigo-100 rounded" title="Download">
                                                <DownloadIcon className="w-4 h-4" />
                                            </a>
                                        </div>
                                        <p className={`text-[10px] ${theme.textSecondary}`}>{f.size} • {f.date}</p>
                                    </div>
                                </li>
                            ))}
                            {(!project.files || project.files.length === 0) && <p className={`text-sm ${theme.textSecondary}`}>No files.</p>}
                        </ul>
                    </Card>
                    <Card>
                        <h3 className={`text-lg font-bold ${theme.heading} mb-4 flex items-center`}><LinkIcon className="w-5 h-5 mr-2"/> Links</h3>
                         <ul className="space-y-2">
                            {(project.resources || []).map((r, i) => (
                                <li key={i} className={`flex items-center justify-between p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                                    <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-500 truncate hover:underline text-sm flex-1">{r.url}</a>
                                </li>
                            ))}
                             {(!project.resources || project.resources.length === 0) && <p className={`text-sm ${theme.textSecondary}`}>No links.</p>}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );

    const AdminPanel = () => {
        if (adminSelectedProject) {
            return <AdminSubmissionView project={adminSelectedProject} onBack={() => setAdminSelectedProject(null)} />;
        }
        return (
            <Card>
                <h2 className={`text-2xl font-bold ${theme.heading} mb-6 flex items-center`}><ShieldIcon className="w-6 h-6 mr-3 text-rose-500"/> Admin Console</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className={`border-b ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'} text-sm uppercase`}>
                                <th className="pb-3 pl-2">Project</th>
                                <th className="pb-3">Team</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3 text-right pr-2">Action</th>
                            </tr>
                        </thead>
                        <tbody className={`text-sm ${theme.textPrimary}`}>
                            {projects.map(p => (
                                <tr key={p.id} className={`border-b last:border-0 ${darkMode ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                                    <td className="py-4 pl-2 font-medium">{p.name}</td>
                                    <td className={`py-4 ${theme.textSecondary}`}>{p.teamName}</td>
                                    <td className="py-4"><span className={`px-2 py-1 rounded text-xs ${p.evaluation?.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{p.evaluation?.status || 'Pending'}</span></td>
                                    <td className="py-4 text-right pr-2 flex justify-end space-x-2">
                                        <button onClick={() => setAdminSelectedProject(p)} className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20 p-2 rounded transition-colors" title="View Work">
                                            <EyeIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => deleteProj(p.id)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2 rounded transition-colors"><TrashIcon className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        );
    };

    const Dashboard = () => {
        // Pending Invite View
        if (userTeam) {
            const myStatus = userTeam.members.find(m => m.email === userEmail || m.id === userId)?.status;
            
            if (myStatus === 'pending') {
                return (
                    <div className="max-w-2xl mx-auto mt-10">
                        <Card className="text-center p-10 border-l-4 border-indigo-500">
                            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                                <MailIcon className="w-10 h-10" />
                            </div>
                            <h2 className={`text-3xl font-bold ${theme.heading} mb-2`}>Project Proposal Received</h2>
                            <p className={`text-lg ${theme.textSecondary} mb-6`}>
                                You have been invited to join <span className="font-bold text-indigo-500">{userTeam.teamName}</span> for the project <span className="font-bold text-indigo-500">{userTeam.name}</span>.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Button onClick={acceptInvite} className="px-8 py-3">Accept Proposal</Button>
                                <Button variant="secondary" onClick={declineInvite} className="px-8 py-3 text-rose-500 hover:bg-rose-50">Decline</Button>
                            </div>
                        </Card>
                    </div>
                );
            }
        }

        // Standard Dashboard
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <Card className="flex-1 bg-gradient-to-br from-indigo-600 to-violet-600 !border-none text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h2>
                            <p className="text-indigo-100 opacity-90">
                                {userTeam 
                                    ? (isTeamActive ? 'Project is active and tracking.' : 'Waiting for team members to accept.') 
                                    : 'No active projects.'}
                            </p>
                            {!userTeam && <Button onClick={() => setCurrentView(VIEWS.REGISTRATION)} className="mt-6 bg-white text-indigo-600 hover:bg-indigo-50 shadow-none">Start Project</Button>}
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4"><DatabaseIcon width="200" height="200" /></div>
                    </Card>

                    <div className="flex-1 grid grid-cols-2 gap-4">
                        <Card className="flex flex-col items-center justify-center text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${darkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}><DatabaseIcon /></div>
                            <h3 className={`text-2xl font-bold ${theme.heading}`}>{projects.length}</h3>
                            <p className={`text-xs ${theme.textSecondary}`}>Total Projects</p>
                        </Card>
                        <Card className="flex flex-col items-center justify-center text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${darkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}><TeamIcon /></div>
                            <h3 className={`text-2xl font-bold ${theme.heading}`}>{projects.reduce((a,b)=>a + (b.members?.length||0),0)}</h3>
                            <p className={`text-xs ${theme.textSecondary}`}>Active Students</p>
                        </Card>
                    </div>
                </div>

                {userTeam && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Project Status */}
                        <Card className="lg:col-span-2">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className={`text-xl font-bold ${theme.heading}`}>{userTeam.name}</h3>
                                    <p className={`${theme.textSecondary} text-sm`}>{userTeam.teamName}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${userTeam.evaluation.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {userTeam.evaluation.status}
                                </span>
                            </div>
                             {!isTeamActive && (
                                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 text-amber-600">
                                    <ClockIcon className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm font-medium">Team formation in progress. Features locked until everyone accepts.</span>
                                </div>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className={theme.textSecondary}>Task Progress</span>
                                        <span className={theme.textPrimary}>
                                            {Math.round(((userTeam.tasks || []).filter(t => t.completed).length / ((userTeam.tasks || []).length || 1)) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${((userTeam.tasks || []).filter(t => t.completed).length / ((userTeam.tasks || []).length || 1)) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Team Roster with Status */}
                        <Card>
                            <h3 className={`text-lg font-bold ${theme.heading} mb-4`}>Team Roster</h3>
                            <ul className="space-y-3">
                                {userTeam.members.map((m, i) => (
                                    <li key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${m.status === 'accepted' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                            <span className={m.status === 'accepted' ? theme.textPrimary : theme.textSecondary}>
                                                {m.name === "Invited User" ? m.email : m.name}
                                            </span>
                                        </div>
                                        <span className={`text-xs ${m.status === 'accepted' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {m.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                )}
            </div>
        );
    };

    // --- Main Render ---
    if (error) return <div className="flex items-center justify-center min-h-screen bg-rose-50 text-rose-600 p-4">{error}</div>;
    if (!isAuthReady) return <div className={`flex items-center justify-center min-h-screen ${theme.appBg} ${theme.textPrimary}`}>Loading...</div>;
    if (!userId) return <AuthScreen />;

    return (
        <div className={`flex flex-col min-h-screen ${theme.appBg} ${theme.textPrimary} transition-colors duration-300 font-sans selection:bg-indigo-500 selection:text-white`}>
            {/* Top Navigation Bar */}
            <header className={`fixed top-0 w-full z-30 ${theme.navBg} px-4 lg:px-8 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-600/20">P</div>
                    <span className={`font-bold text-xl hidden md:block ${theme.heading}`}>ProTrack</span>
                </div>

                <nav className="hidden md:flex items-center space-x-2 bg-transparent">
                     {[
                        { id: VIEWS.DASHBOARD, label: 'Dashboard' },
                        { id: VIEWS.REGISTRATION, label: 'Register' },
                        { id: VIEWS.TRACKING, label: 'Tracking' },
                        { id: VIEWS.REPORTS, label: 'Reports' },
                        { id: VIEWS.DATABASE, label: 'Projects' },
                        ...(isUserAdmin ? [{ id: VIEWS.ADMIN, label: 'Admin' }] : [{ id: VIEWS.EVALUATION, label: 'Results' }])
                    ].map((item) => (
                         <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${currentView === item.id ? theme.navActive : theme.navItem}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${theme.accentSecondary}`}>
                        {darkMode ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-indigo-600" />}
                    </button>
                    
                    {/* User Profile Button - Triggers Profile View */}
                    <div 
                        onClick={() => setCurrentView(VIEWS.PROFILE)}
                        className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                         <div className="text-right hidden lg:block">
                            <p className={`text-xs font-bold ${theme.textPrimary}`}>{userName}</p>
                            <p className={`text-[10px] ${theme.textSecondary} uppercase`}>{isUserAdmin ? 'Admin' : 'Student'}</p>
                        </div>
                        {userProfile.photoURL ? (
                             <img src={userProfile.photoURL} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-indigo-500">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    
                     <button onClick={() => handleAction('logout')} className={`p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors`} title="Sign Out">
                        <LogOutIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Mobile Nav (Bottom Bar for small screens) */}
            <div className={`md:hidden fixed bottom-0 w-full z-30 ${theme.navBg} border-t border-gray-200 dark:border-gray-800 px-4 py-2 flex justify-around`}>
                {[VIEWS.DASHBOARD, VIEWS.TRACKING, VIEWS.REPORTS, VIEWS.DATABASE].map((view) => (
                     <button key={view} onClick={() => setCurrentView(view)} className={`p-2 rounded-xl ${currentView === view ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : theme.textSecondary}`}>
                         {view === VIEWS.DASHBOARD && <DatabaseIcon className="w-6 h-6" />}
                         {view === VIEWS.TRACKING && <ProgressIcon className="w-6 h-6" />}
                         {view === VIEWS.REPORTS && <ReportIcon className="w-6 h-6" />}
                         {view === VIEWS.DATABASE && <TeamIcon className="w-6 h-6" />}
                     </button>
                ))}
                 <button onClick={() => setCurrentView(isUserAdmin ? VIEWS.ADMIN : VIEWS.PROFILE)} className={`p-2 rounded-xl ${currentView === (isUserAdmin ? VIEWS.ADMIN : VIEWS.PROFILE) ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : theme.textSecondary}`}>
                    {isUserAdmin ? <ShieldIcon className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                 </button>
            </div>

            {/* Main Content */}
            <main className={`flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 pt-24 pb-24 md:pb-12 transition-all duration-300`}>
                <div className="animate-fade-in">
                    {currentView === VIEWS.DASHBOARD && <Dashboard />}
                    {currentView === VIEWS.REGISTRATION && <RegistrationView />}
                    {currentView === VIEWS.REPORTS && <ReportView />}
                    {currentView === VIEWS.ADMIN && <AdminPanel />}
                    {currentView === VIEWS.TRACKING && <ProgressTrackingView />}
                    {currentView === VIEWS.PROFILE && <ProfileView />}

                    {currentView === VIEWS.DATABASE && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {projects.map(p => (
                                <Card key={p.id} className="relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><TeamIcon width="80" height="80"/></div>
                                    <h3 className={`text-lg font-bold ${theme.heading} mb-1`}>{p.name}</h3>
                                    <p className={`text-sm ${theme.textSecondary} mb-4`}>{p.teamName}</p>
                                    <div className="flex items-center gap-2 text-xs bg-gray-100 dark:bg-gray-700 w-fit px-2 py-1 rounded mb-4">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                        <span className={theme.textPrimary}>{p.evaluation?.status || 'Pending'}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-indigo-500 h-full" style={{width: `${((p.tasks || []).filter(t => t.completed).length / ((p.tasks || []).length || 1)) * 100}%`}}></div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                    
                    {currentView === VIEWS.EVALUATION && userTeam && (
                        <Card>
                            <h2 className={`text-2xl font-bold mb-6 ${theme.heading}`}>Evaluation Results</h2>
                            <div className={`p-8 rounded-2xl text-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-2">
                                    {userTeam.evaluation.score}/100
                                </div>
                                <p className={`text-lg font-medium ${theme.textPrimary} mb-6`}>{userTeam.evaluation.status}</p>
                                <div className={`text-left p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                                    <p className={`text-sm font-bold ${theme.textSecondary} uppercase mb-2`}>Feedback</p>
                                    <p className={theme.textPrimary}>{userTeam.evaluation.feedback}</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </main>
            <div id="toast" className="fixed top-4 right-4 z-50 transition-all duration-500 transform translate-y-20 opacity-0"></div>
        </div>
    );
}