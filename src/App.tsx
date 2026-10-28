import { useEffect, useRef, useState } from 'react'
import { detectXRSupport, type ImmersiveMode, type XRAvailability } from './capabilities'
import { getPortal, getVrWorld, portals, vrWorlds } from './catalog'
import type { LayoutPreset } from './workspace'
import { createSpatialShell, type ClockDisplay, type SpatialShell, type ViewMode } from './world'
import { MAX_NOTE_CHARS } from './fieldtools'
import { emptyDiagnostics, type XRInputDiagnostics } from './xr-input'
import { QUEST_CHECKS, QUEST_STORAGE_KEY, buildQuestExport, createQuestReport, decodeQuestReport, questCounts, recordQuestEvent, type QuestStatus } from './questlab'

const GITHUB = 'https://github.com/MichaelWave369/PhiOS-XR'

export function App() {
  const stageRef = useRef<HTMLDivElement>(null)
  const shellRef = useRef<SpatialShell | null>(null)
  const [selectedId, setSelectedId] = useState('phios')
  const [layout, setLayout] = useState<LayoutPreset>('arc')
  const [view, setView] = useState<ViewMode>('portals')
  const [fieldNote, setFieldNote] = useState('')
  const [clockDisplay, setClockDisplay] = useState<ClockDisplay>({ time: '00:00', running: false })
  const [support, setSupport] = useState<XRAvailability | null>(null)
  const [sessionMode, setSessionMode] = useState<ImmersiveMode | null>(null)
  const [gazeAssist, setGazeAssist] = useState(true)
  const [inputDiagnostics, setInputDiagnostics] = useState<XRInputDiagnostics>(emptyDiagnostics)
  const [error, setError] = useState('')
  const [sceneError, setSceneError] = useState('')
  const [questReport, setQuestReport] = useState(() => {
    try {
      return decodeQuestReport(JSON.parse(window.localStorage.getItem(QUEST_STORAGE_KEY) ?? 'null')) ?? createQuestReport()
    } catch {
      return createQuestReport()
    }
  })
  const [questNotice, setQuestNotice] = useState('')
  const selected = getPortal(selectedId) ?? portals[0]
  const questSummary = questCounts(questReport)

  useEffect(() => {
    try { window.localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(questReport)) }
    catch { /* Storage may be blocked by browser privacy settings. */ }
  }, [questReport])

  function updateQuestField(field: 'deviceModel' | 'firmware' | 'browserVersion' | 'notes', value: string) {
    setQuestReport((previous) => ({ ...previous, [field]: value.slice(0, field === 'notes' ? 1600 : 80) }))
  }

  function exportJson() {
    return JSON.stringify(buildQuestExport(questReport, {
      secureContext: window.isSecureContext,
      webXRExposed: typeof navigator.xr !== 'undefined',
      support,
      appRevision: 'edition-07',
      input: inputDiagnostics,
    }, new Date().toISOString()), null, 2)
  }

  function downloadQuestReport() {
    try {
      const url = URL.createObjectURL(new Blob([exportJson()], { type: 'application/json' }))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'phios-xr-quest-' + new Date().toISOString().slice(0, 10) + '.json'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 2000)
      setQuestNotice('JSON download requested. Review notes before sharing.')
    } catch {
      setQuestNotice('Download blocked by this browser. Try COPY JSON instead.')
    }
  }

  async function copyQuestReport() {
    try {
      await navigator.clipboard.writeText(exportJson())
      setQuestNotice('JSON copied to clipboard. Review notes before sharing.')
    } catch {
      setQuestNotice('Clipboard access denied. Try DOWNLOAD JSON after exiting XR.')
    }
  }

  function resetQuestReport() {
    if (!window.confirm('Reset all local Quest results, notes and session events?')) return
    setQuestReport(createQuestReport())
    setQuestNotice('Local Quest Device Lab results reset.')
  }

  useEffect(() => {
    if (!stageRef.current) return
    let cancelled = false
    try {
      const shell = createSpatialShell(stageRef.current, {
        onSelect: setSelectedId,
        onSession: (mode) => {
          setSessionMode(mode)
          setQuestReport((previous) => recordQuestEvent(previous, mode ? 'start' : 'end', mode, new Date().toISOString()))
        },
        onLayout: setLayout,
        onView: setView,
        onNote: setFieldNote,
        onClock: setClockDisplay,
        onInput: setInputDiagnostics,
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
      const message = err instanceof Error ? err.message : 'Could not start the immersive session.'
      setError(message)
      setQuestReport((previous) => recordQuestEvent(previous, 'error', mode, new Date().toISOString(), message))
    }
  }

  function choose(id: string) {
    const shell = shellRef.current
    shell?.setView(getVrWorld(id) ? 'worlds' : 'portals')
    shell?.select(id)
    setSelectedId(id)
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
        <div className="topbar-mid"><span className="status-pulse" /> EDITION 07 <span className="divider">/</span> EXPERIMENTAL PREVIEW</div>
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
          <div className="rail-caption vr-rail-caption">VR WORLDS <span>{String(vrWorlds.length).padStart(2, '0')}</span></div>
          <nav className="portal-nav world-nav" aria-label="VR worlds">
            {vrWorlds.map((world) => (
              <button className={selectedId === world.id && view === 'worlds' ? 'portal-link active' : 'portal-link'}
                aria-current={selectedId === world.id && view === 'worlds' ? 'page' : undefined}
                key={world.id} onClick={() => choose(world.id)}>
                <span className="portal-number">{world.number}</span>
                <span className="portal-name">{world.name}<small>{world.subtitle}</small></span>
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
              <span>◈ MOVABLE PORTALS / LIVE FIELD TOOLS</span>
              <span>RENDERING / THREE.JS / WEBXR</span>
            </div>
          </div>
          <div className="transport">
            <div className="transport-text"><strong>ENTER THE FIELD</strong><span>{view === 'portals' ? 'Drag panels to move · Gold corner to resize' : 'Select spatial keys to write · Start or pause the clock'}</span></div>
            <div className="transport-buttons">
              <button className="mode-button vr" onClick={() => void enter('immersive-vr')} disabled={!support?.vr || !!sessionMode || !!sceneError}>
                <span>◉</span> ENTER VR
              </button>
              <button className="mode-button mr" onClick={() => void enter('immersive-ar')} disabled={!support?.ar || !!sessionMode || !!sceneError}>
                <span>✦</span> ENTER MR
              </button>
              <button className="mode-button mr" onClick={() => shellRef.current?.recenter()} disabled={!sessionMode}>
                RE-CENTER
              </button>
              <button className="mode-button mr" onClick={() => {
                const shell = shellRef.current
                if (shell) void shell.exit().catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unable to exit XR.'))
              }} disabled={!sessionMode}>
                EXIT XR
              </button>
            </div>
          </div>
          <div className="xr-assist-options">
            <label className="xr-gaze-toggle">
              <input type="checkbox" checked={gazeAssist}
                onChange={(event) => {
                  const enabled = event.target.checked
                  setGazeAssist(enabled)
                  shellRef.current?.setGazeAssist(enabled)
                }} />
              <span>GAZE ASSIST</span><small>Look at a portal for 2.3 seconds to select. No external links or destructive actions.</small>
            </label>
            <div className="xr-diagnostics-summary" aria-live="off">
              INPUT SOURCES {inputDiagnostics.sourceCount} · RAYS {inputDiagnostics.connectedRays} · PRESS {inputDiagnostics.selectStarts} · SELECT {inputDiagnostics.selects}
            </div>
          </div>
          <div className="field-view-switch" role="group" aria-label="Spatial workspace mode">
            <div><strong>SPATIAL SURFACES</strong><small>PORTALS / VR WORLDS / FIELD TOOLS</small></div>
            <div className="layout-actions">
              <button className={view === 'portals' ? 'layout-action is-active' : 'layout-action'}
                aria-pressed={view === 'portals'}
                onClick={() => shellRef.current?.setView('portals')}>PORTALS</button>
              <button className={view === 'worlds' ? 'layout-action is-active' : 'layout-action'}
                aria-pressed={view === 'worlds'}
                onClick={() => shellRef.current?.setView('worlds')}>VR WORLDS</button>
              <button className={view === 'tools' ? 'layout-action is-active' : 'layout-action'}
                aria-pressed={view === 'tools'}
                onClick={() => shellRef.current?.setView('tools')}>FIELD TOOLS</button>
            </div>
          </div>
          {view === 'worlds' && <div className="vr-world-links" aria-label="Open VR destinations">
            {vrWorlds.map((world) => (
              <a className="vr-world-direct-link" key={world.id}
                href={world.href} target="_blank" rel="noopener noreferrer">
                <strong>{world.name}</strong><small>{world.subtitle}</small><span aria-hidden="true">↗</span>
              </a>
            ))}
            <p>Inside VR, select a world card and press <strong>OPEN WORLD</strong> using a controller. This leaves the PhiOS XR shell and opens that site in the current browser tab. Each destination has its own VR entry controls.</p>
          </div>}
          {view === 'tools' && <div className="field-tools-editor">
            <label className="field-pad-editor">
              <strong>FIELD PAD <span>LOCAL / {fieldNote.length} OF {MAX_NOTE_CHARS}</span></strong>
              <textarea value={fieldNote} maxLength={MAX_NOTE_CHARS} rows={3}
                onChange={(event) => shellRef.current?.setNote(event.target.value)}
                placeholder="Write a note here or use the spatial keyboard inside VR." />
            </label>
            <div className="field-clock-editor">
              <strong>FOCUS CLOCK <span>SESSION ONLY</span></strong>
              <div className="clock-controls">
                <span className="clock-value">{clockDisplay.time}</span>
                <button className="layout-action" onClick={() => shellRef.current?.clockAction('toggle')}>
                  {clockDisplay.running ? 'PAUSE' : 'START'}
                </button>
                <button className="layout-action" onClick={() => shellRef.current?.clockAction('reset')}>RESET</button>
              </div>
            </div>
          </div>}
          <div className="layout-strip" aria-label="Workspace arrangement">
            <span className="layout-label">WORKSPACE / {layout.toUpperCase()}</span>
            <div className="layout-actions">
              <button className={layout === 'arc' ? 'layout-action is-active' : 'layout-action'}
                onClick={() => shellRef.current?.arrange('arc')}>ARC</button>
              <button className={layout === 'wall' ? 'layout-action is-active' : 'layout-action'}
                onClick={() => shellRef.current?.arrange('wall')}>WALL</button>
              <button className="layout-action" onClick={() => shellRef.current?.reset()}>RESET</button>
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
          <div className="inspector-head"><span>{getVrWorld(selected.id) ? 'VR WORLD' : 'ACTIVE PORTAL'}</span><span className="inspector-count">{selected.number} / {getVrWorld(selected.id) ? String(vrWorlds.length).padStart(2, '0') : '06'}</span></div>
          <div className="hero-glyph" aria-hidden="true"><div className="glyph-circles"><span>Φ</span></div><small>ACCESS / REVIEWED</small></div>
          <div className="inspector-main">
            <div className="inspector-overline">PORTAL {selected.number}  /  {selected.kind.toUpperCase()}</div>
            <h2>{selected.name}</h2>
            <div className="inspector-subtitle">{selected.subtitle}</div>
            <p>{selected.description}</p>
            <a className="open-portal" href={selected.href} target="_blank" rel="noopener noreferrer">
              {getVrWorld(selected.id) ? 'OPEN VR WORLD' : 'OPEN EXTERNAL PROJECT'} <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="inspector-foot">
            <div className="foot-row"><span>BRIDGE</span><strong className="muted">NOT CONNECTED</strong></div>
            <div className="foot-row"><span>PERMISSIONS</span><strong>READ-ONLY</strong></div>
            <div className="foot-row"><span>COMPUTE</span><strong>LOCAL DEVICE</strong></div>
          </div>
        </aside>
      </main>

      <section className="quest-lab" aria-label="Quest Device Lab">
        <details className="quest-lab-details">
          <summary>
            <span><strong>05 / QUEST DEVICE LAB</strong><small>Real-headset acceptance · local-only evidence</small></span>
            <span className="quest-summary">{questSummary.PASS} / {QUEST_CHECKS.length} PASS <span aria-hidden="true">▾</span></span>
          </summary>
          <div className="quest-lab-body">
            <p className="quest-lab-intro">Run these checks on a physical Quest 3. WebXR feature flags do not prove tracking, passthrough, or hand input. Nothing is uploaded automatically. Keep a clear play area and use the headset boundary.</p>
            <div className="quest-signals" aria-label="Browser capability probes">
              <span>SECURE CONTEXT: <b>{window.isSecureContext ? 'YES' : 'NO'}</b></span>
              <span>WEBXR API: <b>{typeof navigator.xr !== 'undefined' ? 'EXPOSED' : 'ABSENT'}</b></span>
              <span>VR MODE: <b>{support === null ? 'CHECKING' : support.vr ? 'AVAILABLE' : 'UNAVAILABLE'}</b></span>
              <span>MR MODE: <b>{support === null ? 'CHECKING' : support.ar ? 'AVAILABLE' : 'UNAVAILABLE'}</b></span>
              <span>SESSION EVENTS: <b>{questReport.events.length}</b></span>
              <span>XR INPUT SOURCES: <b>{inputDiagnostics.sourceCount}</b></span>
              <span>XR CONNECTED RAYS: <b>{inputDiagnostics.connectedRays}</b></span>
              <span>PRIMARY PRESSES: <b>{inputDiagnostics.selectStarts}</b></span>
              <span>COMPLETED SELECTS: <b>{inputDiagnostics.selects}</b></span>
              <span>LAST INPUT: <b>{inputDiagnostics.lastEvent}</b></span>
            </div>
            <div className="quest-device-fields">
              <label>HEADSET MODEL<input maxLength={80} value={questReport.deviceModel} placeholder="e.g. Quest 3" onChange={(event) => updateQuestField('deviceModel', event.target.value)} /></label>
              <label>FIRMWARE VERSION<input maxLength={80} value={questReport.firmware} placeholder="Read from headset settings" onChange={(event) => updateQuestField('firmware', event.target.value)} /></label>
              <label>BROWSER VERSION<input maxLength={80} value={questReport.browserVersion} placeholder="Read from browser info" onChange={(event) => updateQuestField('browserVersion', event.target.value)} /></label>
            </div>
            <div className="quest-matrix" aria-label="Physical Quest acceptance checklist">
              {QUEST_CHECKS.map((check) => (
                <div className="quest-check" key={check.id}>
                  <span className="quest-check-id">{check.id}</span>
                  <div className="quest-check-copy"><strong>{check.action}</strong><small>{check.expected}</small></div>
                  <label className="quest-result">RESULT
                    <select aria-label={check.id + ' result'} value={questReport.checks[check.id]}
                      onChange={(event) => setQuestReport((previous) => ({
                        ...previous, checks: { ...previous.checks, [check.id]: event.target.value as QuestStatus },
                      }))}>
                      <option value="NOT_TESTED">NOT TESTED</option>
                      <option value="PASS">PASS</option>
                      <option value="FAIL">FAIL</option>
                      <option value="BLOCKED">BLOCKED</option>
                    </select>
                  </label>
                </div>
              ))}
            </div>
            <label className="quest-notes">OBSERVATIONS / BUGS / COMFORT NOTES
              <textarea rows={4} maxLength={1600} value={questReport.notes}
                placeholder="Describe what happened, which controller was used, and any issues. Don't include personal identifiers."
                onChange={(event) => updateQuestField('notes', event.target.value)} />
            </label>
            <div className="quest-lab-actions">
              <button type="button" onClick={downloadQuestReport}>DOWNLOAD JSON</button>
              <button type="button" onClick={() => void copyQuestReport()}>COPY JSON</button>
              <button type="button" className="quest-reset" onClick={resetQuestReport}>RESET RESULTS</button>
              <span aria-live="polite" role="status">{questNotice || (questSummary.NOT_TESTED + ' still untested · ' + questSummary.FAIL + ' failed · ' + questSummary.BLOCKED + ' blocked')}</span>
            </div>
            <p className="quest-fineprint">Results are self-reported and stored in this browser when local storage is permitted. Session start/end and enter errors are timestamped automatically; no test is auto-passed. Downloads and clipboard exports occur only when you select them. <a href={GITHUB + '/blob/main/docs/EDITION_05.md'} target="_blank" rel="noopener noreferrer">READ TEST PROTOCOL ↗</a></p>
          </div>
        </details>
      </section>

      <footer className="footer">
        <span>Φ ENTER THE FIELD <span className="footer-divider">/</span> LEDGER ABOVE EGO</span>
        <span>CAPABILITY ≠ AUTHORITY <span className="footer-divider">·</span> MIT OPEN SOURCE</span>
      </footer>
    </div>
  )
}
