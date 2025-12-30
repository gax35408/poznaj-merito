import type p5 from 'p5';

type Vec = { x:number; y:number };

const toRad = (deg:number) => deg*Math.PI/180;
const dot = (a:Vec,b:Vec)=>a.x*b.x + a.y*b.y;
const len = (v:Vec)=>Math.hypot(v.x,v.y);
const norm = (v:Vec)=>{ const L=len(v)||1; return {x:v.x/L,y:v.y/L}; };
const sub  = (a:Vec,b:Vec)=>({x:a.x-b.x,y:a.y-b.y});
const add  = (a:Vec,b:Vec)=>({x:a.x+b.x,y:a.y+b.y});
const mul  = (v:Vec,k:number)=>({x:v.x*k,y:v.y*k});

function rectToPolygon(x:number, y:number, w:number, h:number, rotationDeg:number): Vec[] {
  if(!rotationDeg){
    return [
      {x, y},
      {x:x+w, y},
      {x:x+w, y:y+h},
      {x, y:y+h}
    ];
  }
  const a = toRad(rotationDeg),
        cos = Math.cos(a),
        sin = Math.sin(a);
  const locals: Vec[] = [
    {x:0, y:0},
    {x:w, y:0},
    {x:w, y:h},
    {x:0, y:h},
  ].map<Vec>(p => ({
    x: x+p.x*cos - p.y*sin,
    y: y+p.x*sin + p.y*cos
  }));
  return locals;
}
function polygonAxes(poly:Vec[]): Vec[] {
  const axes: Vec[] = [];
  for (let i=0;i<poly.length;i++){
    const p1 = poly[i], p2 = poly[(i+1)%poly.length];
    const edge = sub(p2,p1);
    axes.push(norm({x:-edge.y, y:edge.x})); // normalna, znormalizowana
  }
  return axes;
}
function project(poly:Vec[], axis:Vec): [number,number] {
  const d = (p:Vec)=>dot(p,axis);
  let min=Infinity,max=-Infinity;
  for(const p of poly){
    const v=d(p);
    if(v<min)min=v;
    if(v>max)max=v;
  }
  return [min,max];
}
function overlapDepth(a:[number,number], b:[number,number]) {
  return Math.min(a[1], b[1]) - Math.max(a[0], b[0]);
}
function rectCenter(x:number,y:number,w:number,h:number,rot:number): Vec {
  if (!rot) return { x:x + w/2, y:y + h/2 };
  const a = toRad(rot), c = Math.cos(a), s = Math.sin(a);
  const lx = w/2, ly = h/2;
  return { x: x + lx*c - ly*s, y: y + lx*s + ly*c };
}

export const getFramesPos = (nbCols:number, nbRows:number, tileWidth:any, tileHeight:any) => {
    const framesPos = [];
  let currentTileX = 0;
  let currentTileY = 0;
  for(let i = 0; i < nbRows; i++){
    for(let j = 0; j < nbCols; j++){
        framesPos.push({x: currentTileX, y: currentTileY});
        currentTileX += tileWidth;
    }
    currentTileX = 0;
    currentTileY += tileHeight;
  }

  return framesPos;
}

export const drawTile = (
  p: any,
  src: any,
  destinationX: any,
  destinationY: any,
  srcX: any,
  srcY: any,
  tileWidth: any,
  tileHeight: any
) => {
  p.image(
    src,
    destinationX,
    destinationY,
    tileWidth,
    tileHeight,
    srcX,
    srcY,
    tileWidth,
    tileHeight
  )
}

export const maxOneKeyDown = (p:p5) => {
  let isOnlyOneKeyDown = false;
  for(const key of [p.RIGHT_ARROW, p.LEFT_ARROW, p.UP_ARROW, p.DOWN_ARROW]){
      if(!isOnlyOneKeyDown && p.keyIsDown(key)) {
          isOnlyOneKeyDown = true;
          continue;
      }

      if(isOnlyOneKeyDown && p.keyIsDown(key)) {
          return false;
      }
  }

  return true;
}

export function checkCollision(objA:any, objB:any) {
  const aRot = objA.rotationDeg ?? 0,
        bRot = objB.rotationDeg ?? 0;

  if(!aRot && !bRot){
    return !(
      objA.x + objA.width < objB.x ||
      objA.x > objB.x + objB.width ||
      objA.y + objA.height < objB.y ||
      objA.y > objB.y + objB.height
    );
  }
  
  const pa = rectToPolygon(objA.x,objA.y,objA.width,objA.height,aRot);
  const pb = rectToPolygon(objB.x,objB.y,objB.width,objB.height,bRot);
  const axes = [...polygonAxes(pa), ...polygonAxes(pb)];
  for (const ax of axes) {
    const A = project(pa, ax), B = project(pb, ax);
    if (A[1] < B[0] || B[1] < A[0]) return false; // oś separacji
  }
  return true;
}


function mtvBetweenRects(a:any, b:any): { axis: Vec; depth: number } | null {
  const ar = a.rotationDeg ?? 0, br = b.rotationDeg ?? 0;
  const pa = rectToPolygon(a.x,a.y,a.width,a.height,ar);
  const pb = rectToPolygon(b.x,b.y,b.width,b.height,br);
  const axes = [...polygonAxes(pa), ...polygonAxes(pb)];

  let minDepth = Infinity;
  let minAxis: Vec | null = null;

  for (const ax of axes) {
    const A = project(pa, ax), B = project(pb, ax);
    if (A[1] < B[0] || B[1] < A[0]) return null; // brak kolizji
    const d = overlapDepth(A,B);
    if (d < minDepth) { minDepth = d; minAxis = ax; }
  }
  if (!minAxis) return null;

  // Upewnij się, że oś wskazuje z A -> B (żeby wypchnąć B od A)
  const ca = rectCenter(a.x,a.y,a.width,a.height,ar);
  const cb = rectCenter(b.x,b.y,b.width,b.height,br);
  let axis = minAxis;
  if (dot(axis, sub(cb,ca)) < 0) axis = mul(axis, -1);

  return { axis, depth: minDepth };
}

export function resolveOverlapSAT(staticObj:any, dynamicObj:any, vel?:Vec) {
  const res = mtvBetweenRects(staticObj, dynamicObj);
  if (!res) return;
  const bias = 0.01;

  dynamicObj.x += res.axis.x * (res.depth + bias);
  dynamicObj.y += res.axis.y * (res.depth + bias);

}


export function preventOverlap(objA:any, objB:any) {
  const overlapX =
    Math.min(objA.x + objA.width, objB.x + objB.width) -
    Math.max(objA.x, objB.x);
  const overlapY =
    Math.min(objA.y + objA.height, objB.y + objB.height) -
    Math.max(objA.y, objB.y);

  if (overlapX < overlapY) {
    if (objA.x < objB.x) {
      // right
      objB.x = objA.x + objA.width;
      return;
    }
    // left
    objB.x = objA.x - objB.width;
    return;
  }

  if (objA.y < objB.y) {
    // bottom
    objB.y = objA.y + objA.height;
    return;
  }
  // top
  objB.y = objA.y - objB.height;
}

type DialogLine = string;
type NpcDialog = DialogLine[];

export type NpcConfig = {
  id: string,
  name?: string,
  asset?: string;
  spawn?: string;
  collisionSize?: { x: number, y: number };
  spriteMove?: { x: number, y: number };
  dialog?: NpcDialog;
  questId?: string;
};