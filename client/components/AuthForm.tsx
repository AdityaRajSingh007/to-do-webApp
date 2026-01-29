'use client';

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CyberpunkInput from './CyberpunkInput';
import CyberpunkButton from './CyberpunkButton';
import CyberpunkToggle from './CyberpunkToggle';
import TerminalHeader from './TerminalHeader';
import CyberpunkPanel from './CyberpunkPanel';
import { Shield, Lock, Mail, Chrome } from 'lucide-react';

type AuthMode = 'login' | 'signup';

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Simulate authentication with delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (mode === 'login') {
      if (!email || !password) {
        setError('ACCESS_DENIED: Missing credentials');
      } else {
        setSuccess(
          `SESSION_INITIALIZED: Welcome back, ${email.split('@')[0]}`
        );
        setEmail('');
        setPassword('');
      }
    } else {
      if (!email || !password || !confirmPassword) {
        setError('ACCESS_DENIED: Incomplete registration');
      } else if (password !== confirmPassword) {
        setError('ACCESS_DENIED: Password mismatch');
      } else {
        setSuccess(
          `NEW_PROTOCOL_ACTIVATED: Account created for ${email.split('@')[0]}`
        );
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setMode('login');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <motion.div
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'loop',
          }}
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(0, 255, 65, 0.1) 25%, rgba(0, 255, 65, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, 0.1) 75%, rgba(0, 255, 65, 0.1) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(0, 255, 65, 0.1) 25%, rgba(0, 255, 65, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, 0.1) 75%, rgba(0, 255, 65, 0.1) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Glowing corners */}
      <div className="fixed top-4 right-4 w-32 h-32 bg-primary/10 rounded-full filter blur-3xl animate-pulse" />
      <div className="fixed bottom-4 left-4 w-40 h-40 bg-secondary/10 rounded-full filter blur-3xl animate-pulse" />

      {/* Main content */}
      <div className="relative z-10">
        <CyberpunkPanel>
          <TerminalHeader />

          {/* Mode toggle */}
          <CyberpunkToggle
            isActive={mode === 'signup'}
            onChange={(isSignup) => {
              setMode(isSignup ? 'signup' : 'login');
              setError('');
              setSuccess('');
            }}
            options={['ACCESS_EXISTING', 'NEW_PROTOCOL']}
          />

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-accent/20 border border-accent text-accent font-mono text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-primary/20 border border-primary text-primary font-mono text-sm"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <CyberpunkInput
              label="EMAIL_ID"
              icon={<Mail size={18} />}
              type="email"
              placeholder="> Enter Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            <CyberpunkInput
              label="PASSWORD"
              icon={<Lock size={18} />}
              type="password"
              placeholder="> Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CyberpunkInput
                    label="CONFIRM_PASSWORD"
                    icon={<Lock size={18} />}
                    type="password"
                    placeholder="> Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-4 space-y-3">
              <CyberpunkButton
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
              >
                {mode === 'login'
                  ? 'INITIALIZE_SESSION'
                  : 'ACTIVATE_NEW_PROTOCOL'}
              </CyberpunkButton>

              <CyberpunkButton
                type="button"
                variant="secondary"
                disabled={isLoading}
                className="w-full"
              >
                <Chrome size={18} />
                OAUTH_GOOGLE_LINK
              </CyberpunkButton>
            </div>
          </form>
        </CyberpunkPanel>

        {/* System status footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center font-mono text-xs text-muted-foreground"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            SYSTEM_ONLINE • SECURITY_LEVEL_GREEN • READY_FOR_ACCESS
          </div>
        </motion.div>
      </div>
    </div>
  );
}
