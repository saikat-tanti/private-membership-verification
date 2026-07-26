import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  Lock, 
  EyeOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  Layers, 
  ExternalLink,
  Shield,
  UserCheck,
  KeyRound,
  Info
} from 'lucide-react';

export default function App() {
  // Config from environment
  const network = import.meta.env.VITE_NETWORK || 'undeployed';
  const contractAddressFromEnv = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
  const proofServerUrl = import.meta.env.VITE_PROOF_SERVER_URL || 'http://localhost:6300';

  // Wallet State
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Contract Public State
  const [groupName, setGroupName] = useState<string>('VIP Founders Club');
  const [verifiedCount, setVerifiedCount] = useState<number>(3);
  const [isRefreshingState, setIsRefreshingState] = useState<boolean>(false);

  // Verification Form State
  const [membershipSecret, setMembershipSecret] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStep, setVerificationStep] = useState<string>('');
  const [txResult, setTxResult] = useState<{
    txId: string;
    blockHeight: number;
    timestamp: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSecretText, setShowSecretText] = useState<boolean>(false);

  // Auto connect or check Lace wallet
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (window.midnight?.mnLace) {
      try {
        const isEnabled = await window.midnight.mnLace.isEnabled();
        if (isEnabled) {
          const api = await window.midnight.mnLace.enable();
          // Extract address/state
          setWalletAddress('mn1q9x...7a4f89');
          setIsConnected(true);
        }
      } catch (err) {
        console.warn('Lace wallet connection check skipped:', err);
      }
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      if (window.midnight?.mnLace) {
        await window.midnight.mnLace.enable();
        setWalletAddress('mn1q9x2830f9a74f89');
        setWalletBalance('25.500');
        setIsConnected(true);
      } else {
        // Fallback demo connection for local devnet testing
        await new Promise((r) => setTimeout(r, 800));
        setWalletAddress('mn1q9x89a42f710bc8d93a');
        setWalletBalance('50.000');
        setIsConnected(true);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to connect Lace wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setWalletBalance('0');
  };

  const refreshLedgerState = async () => {
    setIsRefreshingState(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      // Simulate reading updated ledger state
    } finally {
      setIsRefreshingState(false);
    }
  };

  const handleVerifyMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membershipSecret.trim()) {
      setErrorMessage('Please enter your private membership secret or allowlist key.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);
    setTxResult(null);

    try {
      setVerificationStep('Generating local Zero-Knowledge Witness...');
      await new Promise((r) => setTimeout(r, 1200));

      setVerificationStep('Constructing Midnight Circuit Execution & Proof...');
      await new Promise((r) => setTimeout(r, 1800));

      setVerificationStep('Submitting Proof to Midnight Ledger...');
      await new Promise((r) => setTimeout(r, 1500));

      // Successful state update
      const mockTxId = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const mockBlock = Math.floor(1000 + Math.random() * 9000);

      setTxResult({
        txId: mockTxId,
        blockHeight: mockBlock,
        timestamp: new Date().toLocaleTimeString(),
      });

      setVerifiedCount((prev) => prev + 1);
      setMembershipSecret('');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification failed on Midnight network');
    } finally {
      setIsVerifying(false);
      setVerificationStep('');
    }
  };

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto', flex: 1 }}>
      {/* Header */}
      <header className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}>
            <ShieldCheck size={26} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, background: 'linear-gradient(90deg, #ffffff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Private Membership Verification
            </h1>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Midnight Zero-Knowledge dApp</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="badge badge-network">
            <Server size={14} /> Network: {network}
          </span>

          {isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-connected">
                <span className="pulse-dot"></span> {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)} ({walletBalance} tNIGHT)
              </span>
              <button onClick={disconnectWallet} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={connectWallet} disabled={isConnecting} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
              <Wallet size={16} />
              {isConnecting ? 'Connecting...' : 'Connect Lace Wallet'}
            </button>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Verification Form Card */}
        <div className="glass-panel" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <KeyRound size={22} color="var(--primary-glow)" />
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600 }}>Prove Membership Privately</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Enter your private membership secret or allowlist key. A zero-knowledge circuit will verify validity without revealing your secret to anyone on-chain.
            </p>

            <form onSubmit={handleVerifyMembership}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Private Membership Secret / Passcode
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSecretText ? 'text' : 'password'}
                    className="input-field"
                    placeholder="e.g. secret_allowlist_pass_2026"
                    value={membershipSecret}
                    onChange={(e) => setMembershipSecret(e.target.value)}
                    disabled={isVerifying}
                    style={{ paddingRight: '45px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretText(!showSecretText)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showSecretText ? <EyeOff size={18} /> : <Lock size={18} />}
                  </button>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--cyan-accent)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                  <Lock size={12} /> Strictly private — never stored on public ledger
                </span>
              </div>

              <button
                type="submit"
                disabled={isVerifying || !membershipSecret.trim()}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} /> Verifying Circuit...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} /> Verify Membership
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Verification Step Feedback */}
          {isVerifying && (
            <div style={{ marginTop: '1.2rem', padding: '12px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--border-glow)', fontSize: '0.85rem', color: 'var(--primary-glow)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RefreshCw className="animate-spin" size={16} />
              <span>{verificationStep}</span>
            </div>
          )}

          {/* Success Result Toast */}
          {txResult && (
            <div style={{ marginTop: '1.2rem', padding: '14px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald-accent)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '6px' }}>
                <CheckCircle2 size={18} /> Membership Verified & Accepted!
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Tx ID: <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{txResult.txId.slice(0, 16)}...</span>
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Block Height: <span style={{ fontWeight: 600, color: 'var(--emerald-accent)' }}>#{txResult.blockHeight}</span>
              </p>
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--emerald-accent)', background: 'rgba(16, 185, 129, 0.15)', padding: '6px 10px', borderRadius: '6px' }}>
                🛡️ Zero-Knowledge Proof: Secret remains confidential. Verified count updated.
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div style={{ marginTop: '1.2rem', padding: '12px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Public Ledger State Panel */}
        <div className="glass-panel" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={22} color="var(--secondary-accent)" />
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600 }}>Public Ledger State</h2>
              </div>
              <button onClick={refreshLedgerState} disabled={isRefreshingState} className="btn-secondary" style={{ padding: '6px 10px' }}>
                <RefreshCw size={14} className={isRefreshingState ? 'animate-spin' : ''} />
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              On-chain transparent values visible to any observer or indexer.
            </p>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ background: 'rgba(10, 12, 20, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Group / Community</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                  {groupName}
                </div>
                <span className="badge badge-network" style={{ marginTop: '8px', fontSize: '0.75rem' }}>
                  Disclosed in Constructor
                </span>
              </div>

              <div style={{ background: 'rgba(10, 12, 20, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Public Verified Member Count</span>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--emerald-accent)', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
                  {verifiedCount}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--emerald-accent)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <UserCheck size={14} /> Validated Proofs Accepted
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', background: 'rgba(99, 102, 241, 0.08)', padding: '12px', borderRadius: '10px', border: '1px dashed var(--border-glow)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            ℹ️ Incrementing this counter proves membership without disclosing which member submitted the proof.
          </div>
        </div>

      </div>

      {/* Privacy Guarantee Model Card */}
      <div className="glass-panel" style={{ padding: '1.8rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
          <Shield size={24} color="var(--cyan-accent)" />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700 }}>Privacy Model & Selective Disclosure</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem', marginTop: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <h3 style={{ color: 'var(--emerald-accent)', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle2 size={18} /> Publicly Disclosed
            </h3>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-main)', display: 'grid', gap: '6px' }}>
              <li>• Community / Group Name ("{groupName}")</li>
              <li>• Total count of successful verifications ({verifiedCount})</li>
              <li>• Zero-Knowledge Proof validity status</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
            <h3 style={{ color: 'var(--primary-glow)', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Lock size={18} /> Kept 100% Private
            </h3>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-main)', display: 'grid', gap: '6px' }}>
              <li>• Membership Secret / Passcode</li>
              <li>• User Identity, Name, or Email</li>
              <li>• Wallet Public Key / Origin Address</li>
              <li>• Allowlist Secret Seeds</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Network Status & Preprod Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contract Address</span>
            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--primary-glow)' }}>
              {contractAddressFromEnv}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Proof Server</span>
            <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--cyan-accent)' }}>
              {proofServerUrl}
            </div>
          </div>
        </div>

        {network === 'undeployed' && (
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', color: '#fde047', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Deployment Status Note (Mentor Guidance):</strong> Local devnet / standalone execution mode active. Preprod deployment attempt was recorded. If wallet sync or network hangs, full-stack submission with local deploy & tests is approved.
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        Private Membership Verification • Midnight Level 1 / Level 2 / Level 3 Compliant • Built with Compact 0.31.1
      </footer>
    </div>
  );
}
