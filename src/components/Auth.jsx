import { useState } from 'react';
import { logIn, signUp, resetPassword, isDemoMode } from '../firebase';
import { Mail, Lock, Sparkles, AlertCircle, Database, HelpCircle, ArrowRight, CheckCircle, Info, LogIn } from 'lucide-react';
import './Auth.css';

export function Auth({ onAuthSuccess, guestProgress }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [migrateData, setMigrateData] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (isForgot) {
      try {
        await resetPassword(email);
        setMessage('Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.');
      } catch (err) {
        setError(getFriendlyErrorMessage(err.code) || err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    if (!isLogin && password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const result = await logIn(email, password);
        onAuthSuccess(result.user, false);
      } else {
        const result = await signUp(email, password);
        // Si hay progreso local del invitado, pasamos la opción de migrarlo
        const hasLocalProgress = guestProgress && (guestProgress.dopaminePoints > 0 || guestProgress.completedTasks?.length > 0 || guestProgress.pendingTasks?.length > 0);
        onAuthSuccess(result.user, migrateData && hasLocalProgress);
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err.code) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFriendlyErrorMessage = (code) => {
    switch (code) {
      case 'auth/user-not-found':
        return 'No hay ningún usuario registrado con este correo.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Credenciales incorrectas. Verifica tu email y contraseña.';
      case 'auth/email-already-in-use':
        return 'Este correo ya está registrado por otro usuario.';
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      default:
        return null;
    }
  };

  const hasLocalProgress = guestProgress && (
    guestProgress.dopaminePoints > 0 || 
    (guestProgress.completedTasks && guestProgress.completedTasks.length > 0) || 
    (guestProgress.pendingTasks && guestProgress.pendingTasks.length > 0) ||
    (guestProgress.lists && guestProgress.lists.length > 0)
  );

  return (
    <div className="auth-card fade-in">
      <div className="auth-header">
        <div className="auth-logo">
          <Sparkles className="auth-logo-icon animate-pulse" size={40} />
          <h2>TDAH Organiza</h2>
          <p className="auth-subtitle">Tu espacio personal libre de abrumación</p>
        </div>
      </div>

      {isDemoMode && (
        <div className="demo-badge-container">
          <div className="demo-badge" onClick={() => setShowFirebaseGuide(!showFirebaseGuide)}>
            <Database size={16} />
            <span>Modo Demo Local Activo</span>
            <HelpCircle size={14} className="guide-trigger-icon" />
          </div>
          
          {showFirebaseGuide && (
            <div className="firebase-guide-box fade-in">
              <h4>¿Cómo activar la sincronización real?</h4>
              <p>Actualmente la app simula la base de datos localmente. Para guardarlo en internet de verdad:</p>
              <ol>
                <li>Crea un proyecto en <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer">Firebase Console</a>.</li>
                <li>Habilita <strong>Email/Password</strong> en Authentication.</li>
                <li>Crea una base de datos <strong>Cloud Firestore</strong>.</li>
                <li>Crea un archivo llamado <code>.env</code> en la raíz del proyecto con tus credenciales:</li>
              </ol>
              <pre>
{`VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id`}
              </pre>
              <p className="guide-footer">La app se reiniciará automáticamente al guardar el archivo <code>.env</code> y se conectará a la nube.</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="auth-alert error fade-in">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="auth-alert success fade-in">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        {isForgot ? (
          <div className="forgot-view fade-in">
            <h3>Restablecer contraseña</h3>
            <p className="form-info-text">Introduce tu correo y te enviaremos un enlace para cambiar tu contraseña.</p>
            
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="primary btn-block" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar enlace'}
              <ArrowRight size={18} />
            </button>

            <button type="button" className="btn-link" onClick={() => setIsForgot(false)}>
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <div className="form-fields fade-in">
            {/* Tabs de login / registro */}
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(true); setError(''); setMessage(''); }}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(false); setError(''); setMessage(''); }}
              >
                Registrarse
              </button>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="input-group fade-in">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {!isLogin && hasLocalProgress && (
              <div className="migration-toggle fade-in">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={migrateData}
                    onChange={(e) => setMigrateData(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <div className="migration-text">
                    <strong>Sincronizar mi progreso actual</strong>
                    <span>Guardar mis puntos y tareas actuales de invitado en mi nueva cuenta.</span>
                  </div>
                </label>
              </div>
            )}

            {isLogin && (
              <button
                type="button"
                className="btn-forgot-password"
                onClick={() => { setIsForgot(true); setError(''); setMessage(''); }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}

            <button type="submit" className="primary btn-block" disabled={loading}>
              {loading ? (
                'Procesando...'
              ) : (
                <>
                  {isLogin ? 'Entrar' : 'Crear Cuenta'}
                  <LogIn size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
