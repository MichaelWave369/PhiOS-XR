import { useEffect, useRef, useState } from 'react'
import FieldCompanionReceiver from './FieldCompanionReceiver'
import {SpatialScenePanel} from './SpatialScenePanel'
import { detectXRSupport, type ImmersiveMode, type XRAvailability } from './capabilities'
import type { XRFrameReport } from './xr-frame-observer'
import { getPortal, getVrWorld, portals, vrWorlds } from './catalog'
import type { LayoutPreset } from './workspace'
import { createSpatialShell, type ClockDisplay, type SpatialShell, type ViewMode } from './world'
import { MAX_NOTE_CHARS } from './fieldtools'
import { HEARTH_MOODS, HEARTH_MOOD_STYLES, type HearthMood } from './hearth-mood'
import { HEARTH_ARTWORKS, HEARTH_ART_DETAILS, type HearthArtwork } from './hearth-gallery'
import { PERSONAL_GALLERY_LIMIT, addPersonalArt, deletePersonalArtById, listPersonalArts, loadPersonalArtById, preparePersonalArt, readPersonalArtMode, readSelectedPersonalId, type PersonalArtInfo } from './personal-art'
import { emptyDiagnostics, type XRInputDiagnostics } from './xr-input'
import { QUEST_CHECKS, QUEST_STORAGE_KEY, buildQuestExport, createQuestReport, decodeQuestReport, questCounts, recordQuestEvent, type QuestStatus } from './questlab'

const GITHUB = 'https://github.com/MichaelWave369/PhiOS-XR'

export function App() {
  const stageRef = useRef<HTMLDivElement>(null)
  const shellRef = useRef<SpatialShell | null>(null)
  const personalRevision = useRef(0)
  const [selectedId, setSelectedId] = useState('domistika-xr')
  const [layout, setLayout] = useState<LayoutPreset>('arc')
  const [view, setView] = useState<ViewMode>('worlds')
  const [mood, setMood] = useState<HearthMood>('fireside')
  const [artwork, setArtwork] = useState<HearthArtwork>('golden-spiral')
  const [personalItems, setPersonalItems] = useState<PersonalArtInfo[]>([])
  const [activePersonalId, setActivePersonalId] = useState<string | null>(null)
  const [personalBusy, setPersonalBusy] = useState(true)
  const [personalNotice, setPersonalNotice] = useState('')
  const [fieldNote, setFieldNote] = useState('')
  const [clockDisplay, setClockDisplay] = useState<ClockDisplay>({ time: '00:00', running: false })
  const [support, setSupport] = useState<XRAvailability | null>(null)
  const [sessionMode, setSessionMode] = useState<ImmersiveMode | null>(null)
  const [frameSampling, setFrameSampling] = useState(false)
  const [frameReport, setFrameReport] = useState<XRFrameReport | null>(null)
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
      appRevision: 'edition-11-phi-hearth',
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

  function toggleFrameSampling() {
    const shell = shellRef.current
    if (!shell) {
      setFrameReport(null)
      setQuestNotice('Cannot observe frames: the spatial scene is unavailable.')
      return
    }
    if (frameSampling) {
      shell.setFrameSampling(false)
      setFrameReport(shell.getFrameReport())
      setFrameSampling(false)
    } else {
      shell.setFrameSampling(true)
      setFrameReport(null)
      setFrameSampling(true)
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
        onMood: setMood,
        onArtwork: setArtwork,
        onPersonalArt: setActivePersonalId,
        onInput: setInputDiagnostics,
      })
      shellRef.current = shell
      const loadRevision = personalRevision.current
      void (async () => {
        const items = await listPersonalArts()
        const loaded: PersonalArtInfo[] = []
        for (const item of items) {
          if (cancelled || personalRevision.current !== loadRevision) return
          try {
            const record = await loadPersonalArtById(item.id)
            if (!record) continue
            const prepared = await preparePersonalArt(record.image, record.name)
            if (cancelled || personalRevision.current !== loadRevision) return
            shell.registerPersonalArtwork(item, prepared.canvas)
            loaded.push(item)
          } catch { /* Bad or inaccessible art cannot take down the XR scene */ }
        }
        if (cancelled || personalRevision.current !== loadRevision) return
        setPersonalItems(loaded)
        const storage = (() => { try { return window.localStorage } catch { return null } })()
        if (readPersonalArtMode(storage) === 'personal') {
          const selected = readSelectedPersonalId(storage)
          const id = loaded.find((item) => item.id === selected)?.id ?? loaded[0]?.id
          if (id) shell.showPersonalArtwork(id)
        }
      })().catch(() => { /* Browsers may block IndexedDB; art can still work in-session */ })
        .finally(() => { if (!cancelled && personalRevision.current === loadRevision) setPersonalBusy(false) })
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

  async function importPersonalImage(file: File | undefined) {
    if (!file || personalBusy) return
    if (personalItems.length >= PERSONAL_GALLERY_LIMIT) {
      setPersonalNotice('Gallery full: remove a local painting before adding another.')
      return
    }
    const revision = ++personalRevision.current
    setPersonalBusy(true)
    setPersonalNotice('')
    try {
      const prepared = await preparePersonalArt(file, file.name)
      if (personalRevision.current !== revision) return
      let item: PersonalArtInfo
      try {
        item = await addPersonalArt(prepared)
        setPersonalNotice('Painting added to this browser’s private collection.')
      } catch (error) {
        if (error instanceof Error && error.message.includes('Gallery full')) throw error
        // Storage-blocked browsers may keep at most six paintings this session.
        item = { id: 'session-' + crypto.randomUUID(), name: prepared.name }
        setPersonalNotice('Storage unavailable: painting is available for this session only.')
      }
      if (personalRevision.current !== revision) return
      shellRef.current?.registerPersonalArtwork(item, prepared.canvas)
      shellRef.current?.showPersonalArtwork(item.id)
      setPersonalItems((previous) => [...previous, item].slice(0, PERSONAL_GALLERY_LIMIT))
    } catch (error) {
      setPersonalNotice(error instanceof Error ? error.message : 'Unable to import painting.')
    } finally {
      if (personalRevision.current === revision) setPersonalBusy(false)
    }
  }

  async function clearPersonalImage(item: PersonalArtInfo) {
    if (personalBusy || !window.confirm('Remove "' + item.name + '" from this browser’s Hearth gallery?')) return
    const revision = ++personalRevision.current
    setPersonalBusy(true)
    try {
      if (!item.id.startsWith('session-')) await deletePersonalArtById(item.id)
      if (personalRevision.current !== revision) return
      shellRef.current?.removePersonalArtwork(item.id)
      setPersonalItems((previous) => previous.filter((entry) => entry.id !== item.id))
      setPersonalNotice('Removed the local copy. Your original Domistika export is untouched.')
    } catch {
      setPersonalNotice('Unable to remove artwork. Browser storage may be restricted.')
    } finally {
      if (personalRevision.current === revision) setPersonalBusy(false)
    }
  }

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
    <div className={view === 'worlds' ? 'app vr-worlds-active mood-' + mood : 'app mood-' + mood}>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <header className="topbar">
        <a className="identity" href={GITHUB} target="_blank" rel="noopener noreferrer" aria-label="PhiOS XR source code">
          <span className="identity-mark">Φ</span>
          <span className="identity-copy"><strong>PHIOS <em>XR</em></strong><small>THE SOVEREIGN SPATIAL SHELL</small></span>
        </a>
        <div className="topbar-mid"><span className="status-pulse" /> THE Φ HEARTH <span className="divider">/</span> VR WORLD DECK</div>
        <a className="source-link" href={GITHUB} target="_blank" rel="noopener noreferrer">SOURCE CODE <span aria-hidden="true">↗</span></a>
      </header>

      <main className="workbench">
        <aside className="rail">
          <div className="eyebrow"><span className="rail-index">01 /</span> SPATIAL INDEX</div>
          <h1>One system.<br/><i>Infinite rooms.</i></h1>
          <p className="intro">Come home between worlds. Settle into a warm, quiet room, then explore VR experiences and XR companions.</p>
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
            <span><span className="small-cross">✳</span> Φ FIELDSPACE / {view === 'gallery' ? 'THE Φ GALLERY' : 'THE Φ HEARTH'}</span>
            <span className="stage-top-right">WEBXR <span className="mini-badge">{sessionMode ? 'SESSION ACTIVE' : 'STANDBY'}</span></span>
          </div>
          <div className="stage" ref={stageRef}>
            {sceneError && <div className="render-error" role="alert">3D PREVIEW UNAVAILABLE<br/><small>{sceneError}. You can still use the portal index.</small></div>}
            <div className="stage-centerpiece" aria-hidden="true"><span>Φ</span></div>
            <div className="stage-overlay-top" aria-hidden="true">{view === 'gallery' ? 'Φ GALLERY / YOUR COLLECTION' : 'THE Φ HEARTH / LIVING ROOM'} <span>///</span> {view === 'gallery' ? 'BACK TO HEARTH' : 'WORLD DECK'}</div>
            <div className="stage-overlay-bottom" aria-hidden="true">
              <span>◈ PICK / SHUFFLE / ENTER THE FIELD</span>
              <span>RENDERING / THREE.JS / WEBXR</span>
            </div>
          </div>
          <div className="transport">
            <div className="transport-text"><strong>ENTER THE FIELD</strong><span>{view === 'portals' ? 'Drag panels to move · Gold corner to resize' : view === 'worlds' ? 'Previous · Shuffle · Next · Enter the gallery or open a world' : view === 'gallery' ? 'Six framed works · Turn to look around · Return to Hearth to launch a world' : 'Select spatial keys to write · Start or pause the clock'}</span></div>
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
          <div className="hearth-room-switch" role="group" aria-label="Choose a virtual room">
            <div><strong>YOUR XR ROOMS</strong><small>Stationary transition · no forced locomotion</small></div>
            <div className="hearth-room-switch-actions">
              <button type="button" className={view === 'worlds' ? 'is-active' : ''}
                aria-pressed={view === 'worlds'} onClick={() => shellRef.current?.setView('worlds')}>COZY HEARTH</button>
              <button type="button" className={view === 'gallery' ? 'is-active' : ''}
                aria-pressed={view === 'gallery'} onClick={() => shellRef.current?.setView('gallery')}>ART GALLERY</button>
            </div>
          </div>
          <div className="hearth-moods" role="group" aria-label="Phi Hearth ambience">
            <div className="hearth-mood-heading">
              <strong>ROOM AMBIENCE</strong>
              <small>{HEARTH_MOOD_STYLES[mood].description} Changes stay on this browser.</small>
            </div>
            <div className="hearth-mood-actions">
              {HEARTH_MOODS.map((option) => (
                <button key={option} type="button"
                  className={mood === option ? 'is-active' : ''}
                  aria-pressed={mood === option}
                  onClick={() => shellRef.current?.setMood(option)}>
                  {HEARTH_MOOD_STYLES[option].label}
                </button>
              ))}
            </div>
          </div>
          <div className="hearth-gallery" role="group" aria-label="Phi Hearth wall gallery">
            <div className="hearth-mood-heading">
              <strong>WALL GALLERY</strong>
              <small>{activePersonalId ? 'Your imported Domistika art is on the wall.' : HEARTH_ART_DETAILS[artwork].subtitle + '. Original local artwork.'} Everything stays in this browser.</small>
            </div>
            <div className="hearth-art-actions">
              {HEARTH_ARTWORKS.map((option) => (
                <button key={option} type="button"
                  className={artwork === option && !activePersonalId ? 'is-active' : ''}
                  aria-pressed={artwork === option && !activePersonalId}
                  onClick={() => shellRef.current?.setArtwork(option)}>
                  {HEARTH_ART_DETAILS[option].label}
                </button>
              ))}
            </div>
            <div className="personal-gallery-controls">
              <label className="personal-gallery-import">
                ADD DOMISTIKA PNG
                <input type="file" accept="image/png,image/jpeg,image/webp"
                  disabled={personalBusy || personalItems.length >= PERSONAL_GALLERY_LIMIT}
                  aria-label="Add an exported Domistika painting as PNG, JPEG or WebP"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0]
                    event.currentTarget.value = ''
                    void importPersonalImage(file)
                  }} />
              </label>
              <span className="personal-gallery-count">{personalItems.length}/{PERSONAL_GALLERY_LIMIT} LOCAL PAINTINGS</span>
              {personalItems.length > 0 && (
                <div className="personal-gallery-list" aria-label="Your imported paintings">
                  {personalItems.map((item) => (
                    <div className="personal-gallery-item" key={item.id}>
                      <button type="button" disabled={personalBusy}
                        className={activePersonalId === item.id ? 'is-active' : ''}
                        aria-pressed={activePersonalId === item.id}
                        title={item.name}
                        onClick={() => shellRef.current?.showPersonalArtwork(item.id)}>
                        {item.name}{item.id.startsWith('session-') ? ' (session)' : ''}
                      </button>
                      <button type="button" disabled={personalBusy} className="personal-gallery-remove"
                        aria-label={'Remove ' + item.name + ' from local gallery'}
                        onClick={() => void clearPersonalImage(item)}>REMOVE</button>
                    </div>
                  ))}
                </div>
              )}
              <span role="status" aria-live="polite">{personalBusy ? 'Preparing local art…' : personalNotice}</span>
              <small>One picture displayed at a time; up to six stored in this browser. In VR, ART cycles all three built-ins and the imported paintings. No network uploads.</small>
            </div>
          </div>
          <SpatialScenePanel onPreview={(scene) => {
            const shell=shellRef.current
            if(!shell)throw new Error('PhiOS XR spatial shell is not ready')
            shell.setSpatialPreview(scene)
            if(scene)shell.setView('worlds')
          }}/>
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
            <div><strong>SPATIAL SURFACES</strong><small>PORTALS / VR WORLDS / GALLERY / FIELD TOOLS</small></div>
            <div className="layout-actions">
              <button className={view === 'portals' ? 'layout-action is-active' : 'layout-action'}
                aria-pressed={view === 'portals'}
                onClick={() => shellRef.current?.setView('portals')}>PORTALS</button>
              <button className={view === 'worlds' ? 'layout-action is-active' : 'layout-action'}
                aria-pressed={view === 'worlds'}
                onClick={() => shellRef.current?.setView('worlds')}>VR WORLDS</button>
              <button className={view === 'gallery' ? 'layout-action is-active' : 'layout-action'}
                aria-pressed={view === 'gallery'}
                onClick={() => shellRef.current?.setView('gallery')}>GALLERY</button>
              <button className={view === 'tools' ? 'layout-action is-active' : 'layout-action'}
                aria-pressed={view === 'tools'}
                onClick={() => shellRef.current?.setView('tools')}>FIELD TOOLS</button>
            </div>
          </div>
          {view === 'worlds' && <div className="vr-deck-controls" role="group" aria-label="VR deck controls">
            <div><strong>THE HEARTH SHELF</strong><small>FIVE IMMERSIVE EXPERIENCES · {vrWorlds.length} TOTAL DOORS</small></div>
            <div className="vr-deck-actions">
              <button onClick={() => shellRef.current?.deckAction('previous')} aria-label="Previous VR world">◀ PREV</button>
              <button className="shuffle-button" onClick={() => shellRef.current?.deckAction('shuffle')} aria-label="Shuffle VR worlds">⤨ SHUFFLE</button>
              <button onClick={() => shellRef.current?.deckAction('next')} aria-label="Next VR world">NEXT ▶</button>
            </div>
          </div>}
          {view === 'worlds' && <div className="vr-world-links" aria-label="Open VR destinations">
            {vrWorlds.map((world) => (
              <a className="vr-world-direct-link" key={world.id}
                href={world.href} target="_blank" rel="noopener noreferrer">
                <strong>{world.name}</strong><small>{world.experience === 'companion' ? 'XR COMPANION · ' : 'VR WORLD · '}{world.subtitle}</small><span aria-hidden="true">↗</span>
              </a>
            ))}
            <p>In VR, select a destination, use PREV / SHUFFLE / NEXT, then trigger <strong>OPEN PORTAL</strong>. This leaves the Hearth for an external site. Companion links are project demos, not certified immersive apps. Gaze never opens links automatically.</p>
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
          <div className="inspector-head"><span>{getVrWorld(selected.id)?.experience === 'companion' ? 'XR COMPANION' : getVrWorld(selected.id) ? 'VR WORLD' : 'ACTIVE PORTAL'}</span><span className="inspector-count">{selected.number} / {getVrWorld(selected.id) ? String(vrWorlds.length).padStart(2, '0') : '06'}</span></div>
          <div className="hero-glyph" aria-hidden="true"><div className="glyph-circles"><span>Φ</span></div><small>ACCESS / REVIEWED</small></div>
          <div className="inspector-main">
            <div className="inspector-overline">PORTAL {selected.number}  /  {selected.kind.toUpperCase()}</div>
            <h2>{selected.name}</h2>
            <div className="inspector-subtitle">{selected.subtitle}</div>
            <p>{selected.description}</p>
            <a className="open-portal" href={selected.href} target="_blank" rel="noopener noreferrer">
              {getVrWorld(selected.id)?.experience === 'companion' ? 'OPEN XR COMPANION' : getVrWorld(selected.id) ? 'OPEN VR WORLD' : 'OPEN EXTERNAL PROJECT'} <span aria-hidden="true">↗</span>
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
            <div className="quest-lab-actions" aria-label="GPU Observatory render callback cadence">
              <button type="button" onClick={toggleFrameSampling}>
                {frameSampling ? 'STOP XR FRAME SAMPLE' : 'START XR FRAME SAMPLE'}
              </button>
              <span role="status" aria-live="polite">
                {frameSampling ? 'Armed. Enter VR/MR to collect up to 240 frame intervals, then stop.'
                  : frameReport?.status === 'observed'
                    ? 'XR render callbacks: ' + frameReport.sample_count + ' intervals · median '
                      + frameReport.median_interval_ms + ' ms · p95 '
                      + frameReport.p95_interval_ms + ' ms'
                    : frameReport ? 'No immersive frames captured.' : 'Not sampled. Opt-in only.'}
              </span>
            </div>
            <p className="quest-fineprint">
              GPU Observatory: browser render callback intervals only, <strong>not GPU execution time</strong>,
              compositor timing, guaranteed refresh rate or Quest hardware certification. No sampling until
              START; no upload, privilege, driver change or clock adjustment.
            </p>
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

      <FieldCompanionReceiver />
      <footer className="footer">
        <span>Φ ENTER THE FIELD <span className="footer-divider">/</span> LEDGER ABOVE EGO</span>
        <span>CAPABILITY ≠ AUTHORITY <span className="footer-divider">·</span> MIT OPEN SOURCE</span>
      </footer>
    </div>
  )
}
