import {describe,it,expect} from 'vitest'
import {MAX_SCENE_BYTES,SCENE_TRUTH,SCENE_COORDINATES,
  normalizeSpatialScene,parseSpatialScene,PROVENANCE_LABELS} from './spatial-scene'

const fixture=()=>({
  schema:'phi.spatial.scene.v1',
  truth:'UNVERIFIED_VISUALIZATION_ONLY',
  creator:'phi-space-dynamics',
  title:'PhiXRCommons R6 export test',
  coordinateFrame:{...SCENE_COORDINATES},
  nodes:[
    {id:'body-orb-1',kind:'sphere',label:'Simulated orb-1',
      position:{x:-2.8,y:4.4,z:-1},radius:.38,metadata:null},
    {id:'evidence-sample-1',kind:'evidence-marker',label:'Invented sample 1',
      position:{x:2.3,y:2.5,z:0},radius:.12,
      metadata:{kind:'synthetic',unit:'arbitrary',value:15,
        uncertainty:null,source:'Synthetic demonstration',sourceUrl:null,
        method:'Invented example data, not a measurement'}},
  ],
})
describe('PhiSpatial R6 passive scene consumer',()=>{
  it('imports the producer shaped fixture without physics credentials or execution',()=>{
    const result=parseSpatialScene(JSON.stringify(fixture()))
    expect(result.nodes.map(n=>n.kind)).toEqual(['sphere','evidence-marker'])
    expect(result.truth).toBe(SCENE_TRUTH)
    expect(result.coordinateFrame).toEqual(SCENE_COORDINATES)
    expect(result.nodes[1].metadata?.kind).toBe('synthetic')
    expect(result).not.toHaveProperty('gravity')
    expect(result).not.toHaveProperty('room')
  })
  it('rejects code properties, extra object fields, arbitrary metadata',()=>{
    const a=fixture() as any;a.execute='shell'
    expect(()=>normalizeSpatialScene(a)).toThrow()
    delete a.execute;a.nodes[0].metadata={script:'alert(1)'}
    expect(()=>normalizeSpatialScene(a)).toThrow()
    a.nodes[0].metadata=null;a.nodes[0].command='run'
    expect(()=>normalizeSpatialScene(a)).toThrow()
  })
  it('refuses forged truth claims and noncanonical coordinate frames',()=>{
    const a=fixture() as any
    a.truth='CERTIFIED_VALIDATED'
    expect(()=>normalizeSpatialScene(a)).toThrow()
    a.truth=SCENE_TRUTH;a.coordinateFrame.upAxis='Z'
    expect(()=>normalizeSpatialScene(a)).toThrow()
  })
  it('bounds positions, radii, IDs, and nonfinite values',()=>{
    const a=fixture() as any;a.nodes[0].position.x=70
    expect(()=>normalizeSpatialScene(a)).toThrow()
    a.nodes[0].position.x=-2.8;a.nodes[0].radius=Infinity
    expect(()=>normalizeSpatialScene(a)).toThrow()
    a.nodes[0].radius=.38;a.nodes[1].id=a.nodes[0].id
    expect(()=>normalizeSpatialScene(a)).toThrow()
  })
  it('does not trust purported measurements without a reference',()=>{
    const a=fixture() as any
    a.nodes[1].metadata.kind='reported-measurement'
    expect(()=>normalizeSpatialScene(a)).toThrow(/source URL/i)
    a.nodes[1].metadata.sourceUrl='https://example.org/report'
    const s=normalizeSpatialScene(a)
    expect(s.nodes[1].metadata?.kind).toBe('reported-measurement')
    expect(PROVENANCE_LABELS['reported-measurement']).toMatch(/UNVERIFIED/)
    a.nodes[1].metadata.sourceUrl='javascript:alert(1)'
    expect(()=>normalizeSpatialScene(a)).toThrow(/URL/)
  })
  it('rejects oversized payloads, excessive nodes, malformed JSON',()=>{
    expect(()=>parseSpatialScene(' '.repeat(MAX_SCENE_BYTES+1))).toThrow(/96 KB/)
    const a=fixture() as any
    a.nodes=Array.from({length:121},(_,i)=>({...a.nodes[0],id:'orb-'+i}))
    expect(()=>normalizeSpatialScene(a)).toThrow()
    expect(()=>parseSpatialScene('{bad')).toThrow(/Malformed/)
  })
  it('clones all accepted geometry and metadata so callers cannot mutate the importer',()=>{
    const a=fixture()
    const scene=normalizeSpatialScene(a)
    scene.nodes[0].position.x=0
    expect(a.nodes[0].position.x).toBe(-2.8)
    scene.nodes[1].metadata!.source='Changed'
    expect(a.nodes[1].metadata!.source).toBe('Synthetic demonstration')
  })
  it('retains a zero-node scene as a passive empty preview',()=>{
    const a=fixture();a.nodes=[]
    expect(parseSpatialScene(JSON.stringify(a)).nodes).toEqual([])
  })
})
