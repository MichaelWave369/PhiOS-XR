import { useEffect, useRef, useState } from 'react'
import { detectXRSupport, type ImmersiveMode, type XRAvailability } from './capabilities'
import { getPortal, portals } from './catalog'
import { createSpatialShell, type SpatialShell } from './world'

const GITHUB = 'https://github.com/MichaelWave369/PhiOS-XR'

export function App() {
  const stageRef = useRef<HTMLDivElement>(null)
  const shellRef = useRef<SpatialShell | null>(null)
  const [selectedId, setSelectedId] = useState('phios')
  const [support, setSupport] = useState<XRAvailability | null>(null)
  const [sessionMode, setSessionMode] = useState<ImmersiveMode | null>(null)
  const [error, setError] = useState('')
  const [sceneError, setSceneError] = useState('')
  const selected = getPortal(selectedId) ?? portals[0]

  useEffect(() => {
    if (!stageRef.current) return
    let cancelled = false
    try {
      const shell = createSpatialShell(stageRef.current, {
        onSelect: setSelectedId,
        onSession: setSessionMode,
      })
      shellRef.current = shell
    } catch (err) {
      setSceneError(err instanceof Error ? err.message : 'Unable to create the 3D view.')
    }
    void detectXRSupport(navigator.xr).then((result) => {
      if (!cancelled) setSupport(result)
    })
    return () => {
      cancelled = true
      shellRef.current?.dispose()
      shellRef.current = null
    }
  }, [])

  async function enter(mode: ImmersiveMode) {
    setError('')
    try {
      if (!shellRef.current) throw new Error('The 3D renderer did not initialize.')
      await shellRef.current.enter(mode)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the immersive session.')
    }
  }

  function choose(id: string) {
    setSelectedId(id)
    shellRef.current?.select(id)
  }

  return (
    <div className="app">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <header className="topbar">
        <a className="identity" href={GITHUB} target="_blank" rel="noopener noreferrer" aria-label="PhiOS XR source code">
          <span className="identity-mark">Φ</span>
          <span className="identity-copy"><strong>PHIOS <em>XR</em></strong><small>THE SOVEREIGN SPATIAL SHELL</small></span>
        </a>
        <div className="topbar-mid"><span className="status-pulse" /> EDITION 01 <span className="divider">/</span> EXPERIMENTAL PREVIEW</div>
        <a className="source-link" href={GITHUB} target="_blank" rel="noopener noreferrer">SOURCE CODE <span aria-hidden="true">↗</span></a>
      </header>

      <main className="workbench">
        <aside className="rail">
          <div className="eyebrow"><span className="rail-index">01 /</span> SPATIAL INDEX</div>
          <h1>One system.<br/><i>Infinite rooms.</i></h1>
          <p className="intro">An experimental doorway to the Enter the Field universe. Select a portal to explore the connections.</p>
          <div className="rail-caption">ACTIVE MODULES <span>06</span></div>
          <nav className="portal-nav" aria-label="Spatial portals">
            {portals.map((portal) => (
              <button className={selectedId === portal.id ? 'portal-link active' : 'portal-link'}
                aria-current={selectedId === portal.id ? 'page' : undefined}
                key={portal.id} onClick={() => choose(portal.id)}>
                <span className="portal-number">{portal.number}</span>
                <span className="portal-name">{portal.name}<small>{portal.subtitle}</small></span>
                <span className="portal-chevron">↗</span>
              </button>
            ))}
          </nav>
          <div className="rail-foot"><span className="tiny-dot"/> LOCAL-FIRST BY DESIGN<br/><small>No agent authority granted by this interface.</small></div>
        </aside>

        <section className="stage-section" aria-label="Spatial environment">
          <div className="stage-topline">
            <span><span className="small-cross">✳</span> Φ FIELDSPACE / SANDBOX 001</span>
            <span className="stage-top-right">WEBXR <span className="mini-badge">{sessionMode ? 'SESSION ACTIVE' : 'STANDBY'}</span></span>
          </div>
          <div className="stage" ref={stageRef}>
            {sceneError && <div className="render-error" role="alert">3D PREVIEW UNAVAILABLE<br/><small>{sceneError}. You can still use the portal index.</small></div>}
            <div className="stage-centerpiece" aria-hidden="true"><span>Φ</span></div>
            <div className="stage-overlay-top" aria-hidden="true">LIVE SPATIAL INTERFACE <span>///</span> READING MODE</div>
            <div className="stage-overlay-bottom" aria-hidden="true">
              <span>◈ SIX CONNECTED PORTALS</span>
              <span>RENDERING / THREE.JS / WEBXR</span>
            </div>
          </div>
          <div className="transport">
            <div className="transport-text"><strong>ENTER THE FIELD</strong><span>Quest Browser · HTTPS required · Controller select / pinch where supported</span></div>
            <div className="transport-buttons">
              <button className="mode-button vr" onClick={() => void enter('immersive-vr')} disabled={!support?.vr || !!sessionMode || !!sceneError}>
                <span>◉</span> ENTER VR
              </button>
              <button className="mode-button mr" onClick={() => void enter('immersive-ar')} disabled={!support?.ar || !!sessionMode || !!sceneError}>
                <span>✦</span> ENTER MR
              </button>
            </div>
          </div>
          <div className="session-feedback" role="status" aria-live="polite">
            {error ? <span className="warning">{error}</span> : sessionMode
              ? 'Immersive session active. Use the headset system controls to leave XR.'
              : support === null
                ? 'Detecting browser WebXR capabilities…'
                : support.vr || support.ar
                  ? `Available: ${support.vr ? 'VR' : ''}${support.vr && support.ar ? ' + ' : ''}${support.ar ? 'mixed reality' : ''}. Select a mode above.`
                  : support.reason}
          </div>
        </section>

        <aside className="inspector">
          <div className="inspector-head"><span>ACTIVE PORTAL</span><span className="inspector-count">{selected.number} / 06</span></div>
          <div className="hero-glyph" aria-hidden="true"><div className="glyph-circles"><span>Φ</span></div><small>ACCESS / REVIEWED</small></div>
          <div className="inspector-main">
            <div className="inspector-overline">PORTAL {selected.number}  /  {selected.kind.toUpperCase()}</div>
            <h2>{selected.name}</h2>
            <div className="inspector-subtitle">{selected.subtitle}</div>
            <p>{selected.description}</p>
            <a className="open-portal" href={selected.href} target="_blank" rel="noopener noreferrer">
              OPEN EXTERNAL PROJECT <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="inspector-foot">
            <div className="foot-row"><span>BRIDGE</span><strong className="muted">NOT CONNECTED</strong></div>
            <div className="foot-row"><span>PERMISSIONS</span><strong>READ-ONLY</strong></div>
            <div className="foot-row"><span>COMPUTE</span><strong>LOCAL DEVICE</strong></div>
          </div>
        </aside>
      </main>

      <footer className="footer">
        <span>Φ ENTER THE FIELD <span className="footer-divider">/</span> LEDGER ABOVE EGO</span>
        <span>CAPABILITY ≠ AUTHORITY <span className="footer-divider">·</span> MIT OPEN SOURCE</span>
      </footer>
    </div>
  )
}
