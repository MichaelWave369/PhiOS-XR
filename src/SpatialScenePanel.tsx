import {useState} from 'react'
import {loadBundledSpatialDemo} from './spatial-scene-demo'
import {
  MAX_SCENE_BYTES,parseSpatialScene,PROVENANCE_LABELS,
  type SpatialNode,type SpatialScene,
} from './spatial-scene'

/**
 * Local user-selected file → strict parse → explicit preview.
 * No remote URL fetching, hidden device pose collection or persistence.
 */
export function SpatialScenePanel({onPreview}:{
  onPreview:(scene:SpatialScene|null)=>void
}) {
  const [staged,setStaged]=useState<SpatialScene|null>(null)
  const [visible,setVisible]=useState<SpatialScene|null>(null)
  const [selection,setSelection]=useState<string>('')
  const [status,setStatus]=useState('No spatial scene selected. Choose a local PhiSpatial R6 JSON file.')
  const picked:SpatialNode|undefined=visible?.nodes.find(node=>node.id===selection)
  async function stage(file:File|undefined) {
    setStaged(null)
    if(!file)return
    try {
      if(file.size>MAX_SCENE_BYTES)throw new RangeError('Scene exceeds 96 KB')
      const candidate=parseSpatialScene(await file.text())
      setStaged(candidate)
      setStatus('STAGED · '+candidate.title+' · '+candidate.nodes.length+
        ' nodes · unverified visual geometry. Confirm before displaying.')
    }catch(error){
      setStatus('IMPORT REJECTED · '+(error instanceof Error?error.message:'Invalid scene file'))
    }
  }
  function stageBundledDemo() {
    try {
      const candidate = loadBundledSpatialDemo()
      setStaged(candidate)
      setStatus('BUILT-IN DEMO STAGED · 4 simulated orbs + 18 invented evidence markers. '+
        'Press CONFIRM to render. This is synthetic, not measured research.')
    } catch(error) {
      setStaged(null)
      setStatus('BUNDLED DEMO REJECTED · '+(error instanceof Error ? error.message : 'Invalid bundled scene'))
    }
  }
  function confirm() {
    if(!staged)return
    try {
      onPreview(staged)
      setVisible(staged)
      setSelection(staged.nodes[0]?.id??'')
      setStaged(null)
      setStatus('DISPLAYING '+staged.nodes.length+' read-only holographic nodes in the VR Worlds view. No physics or room commands.')
    }catch(error){
      setStatus('PREVIEW REJECTED · '+(error instanceof Error?error.message:'Could not display scene'))
    }
  }
  function clear() {
    onPreview(null)
    setStaged(null)
    setVisible(null)
    setSelection('')
    setStatus('Spatial preview cleared. No other XR content was modified.')
  }
  return <section className="spatial-interchange" aria-label="PhiSpatial scene importer">
    <div className="spatial-interchange-header">
      <strong>ΦSPATIAL SCENE BRIDGE</strong>
      <small>PhiXRCommons R6 → PhiOS XR · passive, local and read-only</small>
    </div>
    <p>Import a PhiSpatial scene from a file, inspect its contents, then explicitly display
      non-colliding ghost shapes in the PhiOS XR Hearth. View in desktop or VR Worlds mode.
      The imported coordinates are illustrative, not calibrated measurements.</p>
    <button type="button" className="spatial-demo-button" onClick={stageBundledDemo}>
      LOAD BUILT-IN ΦSPACE DEMO · NO FILE NEEDED
    </button>
    <small>Quick headset test: load this synthetic example, confirm the scene, then ENTER VR.
      The hologram is visible in VR Worlds; MR passthrough intentionally hides it.</small>
    <label className="spatial-scene-import">
      SELECT SCENE JSON (96 KB / 120 NODES MAX)
      <input type="file" accept=".json,application/json" onChange={event=>{
        const file=event.currentTarget.files?.[0]
        event.currentTarget.value=''
        void stage(file)
      }}/>
    </label>
    {staged && <div className="spatial-interchange-preview">
      <strong>PREVIEW: {staged.title}</strong>
      <span>{staged.creator} · {staged.nodes.length} nodes · {staged.truth}</span>
      <button type="button" onClick={confirm}>CONFIRM · DISPLAY GHOST SCENE</button>
    </div>}
    <button type="button" className="spatial-clear" onClick={clear} disabled={!staged&&!visible}>CLEAR SPATIAL SCENE</button>
    {visible && <div className="spatial-node-detail">
      <label htmlFor="spatial-node">INSPECT IMPORTED NODE</label>
      {visible.nodes.length > 0
        ? <select id="spatial-node" value={selection} onChange={event=>setSelection(event.currentTarget.value)}>
          {visible.nodes.map(node=><option key={node.id} value={node.id}>{node.label}</option>)}
        </select>
        : <p>This passive scene contains no nodes.</p>}
      {picked && <div className="spatial-node-data">
        <strong>{picked.kind==='sphere'?'SIMULATED SPHERE':'EVIDENCE MARKER'}</strong>
        <p>{picked.label} · {picked.id}</p>
        <p>POSITION: {picked.position.x}, {picked.position.y}, {picked.position.z} meters</p>
        {picked.metadata&&<>
          <p>{PROVENANCE_LABELS[picked.metadata.kind]}</p>
          <p>VALUE: {picked.metadata.value} {picked.metadata.unit}</p>
          <p>UNCERTAINTY: {picked.metadata.uncertainty===null?'NOT PROVIDED':picked.metadata.uncertainty+' '+picked.metadata.unit}</p>
          <p>SOURCE: {picked.metadata.source}</p>
          <p>METHOD: {picked.metadata.method}</p>
          <p>REFERENCE (TEXT ONLY): {picked.metadata.sourceUrl??'NOT PROVIDED'}</p>
        </>}
      </div>}
    </div>}
    <p className="spatial-interchange-status" role="status" aria-live="polite">{status}</p>
    <small>No upload, authentication, remote source fetch, local storage, physics, collision,
      portal launch or headset motion authority. Evidence source claims are not independently verified.
      The hologram is hidden in MR passthrough for comfort.</small>
  </section>
}
