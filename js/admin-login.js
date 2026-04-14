/**
 * Lobo24 - Panel de Administración
 * Versión Producción - Seguridad Mejorada
 * © 2025 Lobo24 - Todos los derechos reservados
 */

// ─────────────────────────────────────────────
// CONFIGURACIÓN DE SEGURIDAD
// ─────────────────────────────────────────────
const SECURITY_CONFIG = {
    maxAttempts: 5,
    lockTime: 15 * 60 * 1000,      // 15 minutos
    sessionDuration: 8 * 60 * 60 * 1000, // 8 horas
    tokenRefreshInterval: 30 * 60 * 1000, // 30 minutos
    bruteForceProtection: true,
    rateLimit: {
        windowMs: 15 * 60 * 1000,  // 15 minutos
        maxRequests: 10             // máx 10 intentos
    }
};

// Estado de seguridad
let loginAttempts = 0;
let isLocked = false;
let lockUntil = 0;
let requestCount = 0;
let rateLimitReset = Date.now() + SECURITY_CONFIG.rateLimit.windowMs;

// ─────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('adminLoginForm');
    loadSecurityState();
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    loadSessionState();
    setupEventListeners();
});

function setupEventListeners() {
    // Prevenir pegado de contraseña en modo producción (opcional)
    const passwordInput = document.getElementById('adminPassword');
    if (passwordInput) {
        passwordInput.addEventListener('paste', (e) => {
            // Permitir pegado pero loguear (opcional)
            console.log('Paste detected on password field');
        });
    }
    
    // Limpiar mensajes de error al escribir
    const inputs = ['adminUsername', 'adminPassword'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                const errorDiv = document.querySelector('.error-message');
                if (errorDiv) errorDiv.remove();
            });
        }
    });
}

// ─────────────────────────────────────────────
// FUNCIONES CRIPTOGRÁFICAS (Seguras)
// ─────────────────────────────────────────────

/**
 * Genera un hash simple para almacenamiento local
 * NOTA: Esto NO es para almacenar contraseñas reales,
 * solo para verificar si hay credenciales guardadas.
 * Las contraseñas NUNCA deben almacenarse en texto plano.
 */
class SecureStorage {
    constructor() {
        this.salt = 'lobo24_salt_2025_secure';
    }
    
    // Encriptar datos (simulación - usar Web Crypto API en producción real)
    async encrypt(data) {
        if (!data) return null;
        // En producción real, usar:
        // const encoder = new TextEncoder();
        // const key = await crypto.subtle.importKey(...)
        // return btoa(encoder.encode(data));
        
        // Versión simple pero no almacena la contraseña real
        // Solo almacenamos un token de que "hay credenciales guardadas"
        return btoa(data.substring(0, 5) + this.salt);
    }
    
    // Verificar si hay credenciales guardadas
    hasSavedCredentials() {
        return localStorage.getItem('admin_has_saved_creds') === 'true';
    }
    
    // Guardar indicador de credenciales (NO la contraseña real)
    saveCredentialsFlag(email) {
        if (email) {
            localStorage.setItem('admin_has_saved_creds', 'true');
            localStorage.setItem('admin_saved_email', email);
            localStorage.setItem('admin_saved_email_hash', this.hashEmail(email));
        }
    }
    
    // Limpiar indicador de credenciales
    clearCredentialsFlag() {
        localStorage.removeItem('admin_has_saved_creds');
        localStorage.removeItem('admin_saved_email');
        localStorage.removeItem('admin_saved_email_hash');
    }
    
    // Hash de email para verificación
    hashEmail(email) {
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            hash = ((hash << 5) - hash) + email.charCodeAt(i);
            hash |= 0;
        }
        return hash.toString(16);
    }
    
    // Verificar si el email coincide con el guardado
    verifySavedEmail(email) {
        const savedHash = localStorage.getItem('admin_saved_email_hash');
        return savedHash === this.hashEmail(email);
    }
}

const secureStorage = new SecureStorage();

// ─────────────────────────────────────────────
// FUNCIONES DE SESIÓN
// ─────────────────────────────────────────────

function loadSessionState() {
    // Verificar si hay una sesión activa
    const sessionToken = localStorage.getItem('admin_session_token');
    const sessionExpiry = localStorage.getItem('admin_session_expiry');
    const sessionHash = localStorage.getItem('admin_session_hash');
    
    if (sessionToken && sessionExpiry && Date.now() < parseInt(sessionExpiry)) {
        // Verificar integridad del token
        const expectedHash = secureStorage.hashEmail(sessionToken + SECURITY_CONFIG.sessionDuration);
        if (sessionHash === expectedHash) {
            // Sesión válida, redirigir
            window.location.href = 'admin.html';
        } else {
            // Token comprometido, limpiar
            clearSession();
        }
    }
}

function createSession(userId, userEmail) {
    const sessionToken = 'lobo24_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    const expiry = Date.now() + SECURITY_CONFIG.sessionDuration;
    const sessionHash = secureStorage.hashEmail(sessionToken + expiry);
    
    localStorage.setItem('admin_session_token', sessionToken);
    localStorage.setItem('admin_session_expiry', expiry.toString());
    localStorage.setItem('admin_session_hash', sessionHash);
    localStorage.setItem('admin_user_id', userId);
    localStorage.setItem('admin_user_email', userEmail);
    localStorage.setItem('admin_user_name', userEmail.split('@')[0]);
    
    // Registrar inicio de sesión (opcional: enviar a backend)
    logSecurityEvent('login_success', userEmail);
}

function clearSession() {
    localStorage.removeItem('admin_session_token');
    localStorage.removeItem('admin_session_expiry');
    localStorage.removeItem('admin_session_hash');
    localStorage.removeItem('admin_user_id');
    localStorage.removeItem('admin_user_email');
    localStorage.removeItem('admin_user_name');
}

function refreshSession() {
    const sessionToken = localStorage.getItem('admin_session_token');
    const sessionExpiry = localStorage.getItem('admin_session_expiry');
    
    if (sessionToken && sessionExpiry && Date.now() < parseInt(sessionExpiry)) {
        const newExpiry = Date.now() + SECURITY_CONFIG.sessionDuration;
        localStorage.setItem('admin_session_expiry', newExpiry.toString());
        const newHash = secureStorage.hashEmail(sessionToken + newExpiry);
        localStorage.setItem('admin_session_hash', newHash);
    }
}

// Auto-refresh de sesión cada 30 minutos
setInterval(() => {
    if (document.visibilityState === 'visible') {
        refreshSession();
    }
}, SECURITY_CONFIG.tokenRefreshInterval);

// ─────────────────────────────────────────────
// FUNCIONES DE "RECORDARME" (Seguro para producción)
// ─────────────────────────────────────────────

function saveCredentials(email, remember) {
    if (remember && email) {
        // NO guardamos la contraseña, solo un indicador de que hay credenciales
        // y guardamos el email para autocompletar
        secureStorage.saveCredentialsFlag(email);
        
        // Guardar timestamp de último login exitoso
        localStorage.setItem('admin_last_successful_login', Date.now().toString());
    } else {
        secureStorage.clearCredentialsFlag();
    }
}

function loadSavedCredentials() {
    if (secureStorage.hasSavedCredentials()) {
        const savedEmail = localStorage.getItem('admin_saved_email');
        const emailInput = document.getElementById('adminUsername');
        const rememberCheckbox = document.getElementById('rememberMe');
        
        if (savedEmail && emailInput) {
            emailInput.value = savedEmail;
        }
        
        if (rememberCheckbox) {
            rememberCheckbox.checked = true;
        }
        
        // Enfocar en contraseña automáticamente
        const passwordInput = document.getElementById('adminPassword');
        if (passwordInput && savedEmail) {
            setTimeout(() => passwordInput.focus(), 100);
        }
    }
}

function clearSavedCredentials() {
    secureStorage.clearCredentialsFlag();
}

// ─────────────────────────────────────────────
// VERIFICACIÓN DE RATE LIMIT
// ─────────────────────────────────────────────

function checkRateLimit() {
    if (Date.now() > rateLimitReset) {
        requestCount = 0;
        rateLimitReset = Date.now() + SECURITY_CONFIG.rateLimit.windowMs;
    }
    
    requestCount++;
    if (requestCount > SECURITY_CONFIG.rateLimit.maxRequests) {
        showError('Demasiados intentos. Esperá 15 minutos.');
        return false;
    }
    return true;
}

// ─────────────────────────────────────────────
// FUNCIONES DEL MODAL (Recuperar contraseña)
// ─────────────────────────────────────────────

function showForgotPassword(e) {
    if(e) e.preventDefault();
    
    // Rate limit para recuperación
    const lastResetAttempt = localStorage.getItem('admin_last_reset_attempt');
    if (lastResetAttempt && Date.now() - parseInt(lastResetAttempt) < 60000) {
        showError('Esperá un minuto antes de solicitar otro enlace');
        return;
    }
    
    const modal = document.getElementById('forgotModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
    }
}

function closeForgotModal() {
    const modal = document.getElementById('forgotModal');
    if (modal) modal.style.display = 'none';
    const resetMessage = document.getElementById('resetMessage');
    if (resetMessage) {
        resetMessage.innerText = "";
        resetMessage.style.color = "";
    }
    const resetEmail = document.getElementById('resetEmail');
    if (resetEmail) resetEmail.value = "";
}

async function sendResetEmail() {
    const emailInput = document.getElementById('resetEmail');
    const msg = document.getElementById('resetMessage');
    const email = emailInput ? emailInput.value.trim() : "";
    
    if (!email) {
        if (msg) {
            msg.innerText = "⚠️ Ingresá un email válido";
            msg.style.color = "#dc3545";
        }
        return;
    }
    
    // Rate limiting
    localStorage.setItem('admin_last_reset_attempt', Date.now().toString());
    
    // Mostrar loading
    const btn = document.querySelector('#forgotModal .login-btn');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    }
    
    try {
        await firebase.auth().sendPasswordResetEmail(email);
        if (msg) {
            msg.innerText = "✓ Enlace enviado. Revisá tu correo.";
            msg.style.color = "#28a745";
        }
        setTimeout(() => {
            closeForgotModal();
            showSuccess('Email de recuperación enviado');
        }, 3000);
    } catch (error) {
        let errorMessage = "Error al enviar el enlace";
        switch(error.code) {
            case 'auth/user-not-found':
                errorMessage = "No existe una cuenta con este email";
                break;
            case 'auth/invalid-email':
                errorMessage = "Email inválido";
                break;
            case 'auth/too-many-requests':
                errorMessage = "Demasiados intentos. Esperá unos minutos";
                break;
        }
        if (msg) {
            msg.innerText = "❌ " + errorMessage;
            msg.style.color = "#dc3545";
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

// ─────────────────────────────────────────────
// LÓGICA PRINCIPAL DE LOGIN
// ─────────────────────────────────────────────

function handleSuccessfulLogin(user, rememberMe) {
    // 🔒 Verificar que sea el administrador autorizado
    const ADMIN_EMAILS = ['rodrigoatatat@gmail.com']; // Lista blanca de admins
    
    if (!ADMIN_EMAILS.includes(user.email)) {
        showError("Acceso denegado. No tenés permisos de administrador.");
        firebase.auth().signOut();
        
        // Log de intento no autorizado
        logSecurityEvent('unauthorized_access_attempt', user.email);
        return;
    }
    
    // Resetear contadores de seguridad
    clearLock();
    
    // Guardar credenciales si "Recordarme" está marcado
    const email = document.getElementById('adminUsername').value.trim();
    saveCredentials(email, rememberMe);
    
    // Crear sesión segura
    createSession(user.uid, user.email);
    
    // Log de evento exitoso
    logSecurityEvent('login_success', user.email);
    
    showSuccess('✓ Acceso concedido. Redirigiendo...');
    setTimeout(() => { window.location.href = 'admin.html'; }, 1500);
}

async function handleLogin(e) {
    e.preventDefault();
    
    // Verificar rate limit
    if (!checkRateLimit()) return;
    
    // Verificar bloqueo
    if (isLocked) {
        const remainingTime = Math.ceil((lockUntil - Date.now()) / 60000);
        if (remainingTime > 0) {
            showError(`Cuenta bloqueada. Intentá de nuevo en ${remainingTime} minuto(s).`);
            return;
        } else {
            clearLock();
        }
    }
    
    const email = document.getElementById('adminUsername').value.trim().toLowerCase();
    const password = document.getElementById('adminPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validaciones básicas
    if (!email || !password) {
        showError('Completá email y contraseña');
        return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
        showError('Ingresá un email válido');
        return;
    }
    
    if (password.length < 6) {
        showError('Contraseña inválida');
        return;
    }
    
    setLoadingState(true);
    
    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        await handleSuccessfulLogin(userCredential.user, rememberMe);
    } catch (error) {
        handleFailedLogin(error);
    }
}

function handleFailedLogin(error) {
    setLoadingState(false);
    
    let message = 'Email o contraseña incorrectos';
    
    switch(error.code) {
        case 'auth/user-not-found':
            message = 'No existe una cuenta con este email';
            break;
        case 'auth/wrong-password':
            message = 'Contraseña incorrecta';
            break;
        case 'auth/too-many-requests':
            message = 'Demasiados intentos. Cuenta temporalmente bloqueada';
            isLocked = true;
            lockUntil = Date.now() + SECURITY_CONFIG.lockTime;
            saveSecurityState();
            break;
        case 'auth/invalid-email':
            message = 'Email inválido';
            break;
        default:
            message = 'Error de autenticación. Intentá nuevamente';
    }
    
    loginAttempts++;
    saveSecurityState();
    
    logSecurityEvent('login_failed', document.getElementById('adminUsername')?.value, error.code);
    
    if (loginAttempts >= SECURITY_CONFIG.maxAttempts) {
        isLocked = true;
        lockUntil = Date.now() + SECURITY_CONFIG.lockTime;
        saveSecurityState();
        showError(`Máximos intentos alcanzados. Bloqueado por 15 minutos.`);
    } else {
        showError(`${message}. Intentos restantes: ${SECURITY_CONFIG.maxAttempts - loginAttempts}`);
    }
}

// ─────────────────────────────────────────────
// LOGS DE SEGURIDAD (opcional)
// ─────────────────────────────────────────────

function logSecurityEvent(eventType, email, details = '') {
    const logEntry = {
        timestamp: new Date().toISOString(),
        eventType: eventType,
        email: email,
        userAgent: navigator.userAgent,
        ip: 'client-side', // En producción, esto vendría del backend
        details: details
    };
    
    // Guardar en localStorage para auditoría (máx 50 eventos)
    const logs = JSON.parse(localStorage.getItem('admin_security_logs') || '[]');
    logs.unshift(logEntry);
    if (logs.length > 50) logs.pop();
    localStorage.setItem('admin_security_logs', JSON.stringify(logs));
    
    // En producción, enviar a backend
    console.log('[SECURITY]', logEntry);
}

// ─────────────────────────────────────────────
// ESTADO DE SEGURIDAD
// ─────────────────────────────────────────────

function saveSecurityState() {
    localStorage.setItem('admin_login_attempts', loginAttempts);
    localStorage.setItem('admin_lock_until', lockUntil);
}

function loadSecurityState() {
    loginAttempts = parseInt(localStorage.getItem('admin_login_attempts') || "0");
    lockUntil = parseInt(localStorage.getItem('admin_lock_until') || "0");
    if (lockUntil && Date.now() < lockUntil) {
        isLocked = true;
    }
}

function clearLock() {
    loginAttempts = 0;
    isLocked = false;
    lockUntil = 0;
    requestCount = 0;
    saveSecurityState();
}

// ─────────────────────────────────────────────
// UI UTILITIES
// ─────────────────────────────────────────────

function setLoadingState(isLoading) {
    const btn = document.getElementById('loginButton');
    if (!btn) return;
    
    const spinner = btn.querySelector('.loading-spinner');
    const span = btn.querySelector('span');
    const icon = btn.querySelector('i');
    
    btn.disabled = isLoading;
    
    if (spinner) {
        spinner.style.display = isLoading ? 'inline-block' : 'none';
    }
    if (span) {
        span.style.opacity = isLoading ? '0.5' : '1';
    }
    if (icon) {
        icon.style.opacity = isLoading ? '0.5' : '1';
    }
}

function togglePassword() {
    const input = document.getElementById('adminPassword');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        if (toggleBtn) {
            toggleBtn.classList.remove('fa-eye');
            toggleBtn.classList.add('fa-eye-slash');
        }
    } else {
        input.type = 'password';
        if (toggleBtn) {
            toggleBtn.classList.remove('fa-eye-slash');
            toggleBtn.classList.add('fa-eye');
        }
    }
}

// Exponer funciones globales necesarias
window.togglePassword = togglePassword;
window.showForgotPassword = showForgotPassword;
window.closeForgotModal = closeForgotModal;
window.sendResetEmail = sendResetEmail;

// ─────────────────────────────────────────────
// NOTIFICACIONES (Toast)
// ─────────────────────────────────────────────

function showError(message) { 
    createToast(message, '#f8d7da', '#721c24', 'fa-exclamation-circle'); 
}

function showSuccess(message) { 
    createToast(message, '#d4edda', '#155724', 'fa-check-circle'); 
}

function createToast(message, bgColor, textColor, icon) {
    // Remover toasts existentes
    const existingToasts = document.querySelectorAll('.custom-toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${bgColor};
        color: ${textColor};
        padding: 14px 20px;
        border-radius: 8px;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-left: 4px solid ${textColor};
        animation: slideInRight 0.3s ease forwards;
        max-width: 350px;
    `;
    toast.innerHTML = `<i class="fas ${icon}" style="font-size: 16px;"></i> <span>${message}</span>`;
    document.body.appendChild(toast);
    
    // Agregar estilos de animación si no existen
    if (!document.querySelector('#toastAnimations')) {
        const style = document.createElement('style');
        style.id = 'toastAnimations';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => { 
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ─────────────────────────────────────────────
// CARGAR CREDENCIALES GUARDADAS AL INICIO
// ─────────────────────────────────────────────
loadSavedCredentials();