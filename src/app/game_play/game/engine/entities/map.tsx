// map.tsx
import { drawTile, getFramesPos, checkCollision } from "../utils/utils";
import { makeCollidable } from "./collisions";

import { Types } from "./mapObjTypes";

const FLIP_H = 0x80000000;
const FLIP_V = 0x40000000;
const FLIP_D = 0x20000000;
const FLIP_MASK = ~(FLIP_H | FLIP_V | FLIP_D);



export const makeTiledMap = (p: any, x: number, y: number) => {
  return {
    tileWidth: 48,
    tileHeight: 48,
    x, y,
    tilesets: [] as Types.TileSetEntry[],
    tiledData: null as any,
    reversedTilesets: [] as Types.TileSetEntry[],
    boundaries: [] as Types.Boundaries[],
    portals: [] as Types.Portals[],
    rooms: [] as Types.Rooms[],
    monitors: [] as Types.Monitors[],
    doors: [] as Types.Doors[],
    texts: [] as Types.Texts[],

    load(tilesetURLs: string[], tiledMapURL: string, onLoaded?: () => void) {
      // this.tiledData = p.loadJSON(tiledMapURL);
      const done = (() => {
        let jsonReady = false;
        let imagesLeft = -1;
        return {
          json: () => { jsonReady = true; maybeReady(); },
          imagesInit: (n: number) => { imagesLeft = n; if (n===0) maybeReady();},
          imageOne: () => { imagesLeft--; maybeReady(); }
        };
        function maybeReady() {
          if(jsonReady && imagesLeft === 0) onLoaded?.();
        }
      })();

      p.loadJSON(tiledMapURL, (data: any) => {
        this.tiledData = data;

        const urls = (tilesetURLs && tilesetURLs.length)
          ? tilesetURLs
          : (data.tilesets ?? []).map((ts:any) => ts.image?.startsWith('/') ? ts.image: `/${ts.image}`);

          this.tilesets = urls.map(() => ({firstgrid: 0, image: null as any, tilePos: [] }));
          done.imagesInit(urls.length);

          urls.forEach((u:any,i:any) => {
            this.tilesets[i].image = p.loadImage(u,
              () => done.imageOne(),
              () => done.imageOne()
            );
          });

          done.json();
      });      
    },

    prepareTiles() {
      const jsonTilesets = this.tiledData?.tilesets ?? [];
      if (!jsonTilesets.length || !this.tilesets.length) return;
      
      const n = Math.min(this.tilesets.length, jsonTilesets.length);
      for (let i = 0; i < n; i++) {
        this.tilesets[i].firstgid = jsonTilesets[i].firstgid;
      }

      this.tilesets.forEach((t) => {
        const cols = Math.floor(t.image.width  / this.tileWidth);
        const rows = Math.floor(t.image.height / this.tileHeight);
        t.tilePos = getFramesPos(cols, rows, this.tileWidth, this.tileHeight);
      });
      this.reversedTilesets = [...this.tilesets].sort((a,b) => b.firstgid - a.firstgid);
      
      this.boundaries.length = 0;
      this.portals.length = 0;
      this.rooms.length = 0;
      this.monitors.length = 0;
      this.doors.length = 0;
      this.texts.length = 0;

      // GRANICE
      for (const layer of this.tiledData.layers) {
        if (layer.type === "objectgroup" && layer.name === "Boundaries" && layer.objects) {
          for (const boundary of layer.objects) {
            const col = makeCollidable(
              p,
              this.x + boundary.x,
              this.y + boundary.y,
              boundary.width,
              boundary.height,
              boundary.rotation ?? 0
            );
            this.boundaries.push(col);
          }
        }

        // PORTAL
        if(layer.type === "objectgroup" && layer.name === "Portals" && layer.objects) {
          for (const obj of layer.objects) {
            const propsArr = obj.properties || [];
            const props = Object.fromEntries(propsArr.map((pr: any) => [pr.name, pr.value]));
            const portal = Object.assign(
              makeCollidable(p, this.x + obj.x, this.y + obj.y, obj.width, obj.height, obj.rotation ?? 0),
              {
                name: String(props.name || ""),
                targetMap: String(props.targetMap || ""),
                targetSpawn: props.targetSpawn ? String(props.targetSpawn) : undefined,
                once: props.once ?? true,
                active: props.active ?? true,
                questPortalId: props.questPortalId ? String(props.questPortalId) : undefined
              }
            );
            this.portals.push(portal);
          }
        }

        // Rooms - for RoomBox
        if(layer.type === "objectgroup" && layer.name === "Rooms" && layer.objects) {
          for (const obj of layer.objects) {
            const propsArr = obj.properties || [];
            const props = Object.fromEntries(propsArr.map((pr: any) => [pr.name, pr.value]));
            const room = Object.assign(
              makeCollidable(p, this.x + obj.x, this.y + obj.y, obj.width, obj.height, obj.rotation ?? 0),
              {
                roomName: String(props.roomName || ""),
              }
            );
            this.rooms.push(room);
          }
        }

        // Monitor
        if(layer.type === "objectgroup" && layer.name === "Monitors" && layer.objects) {
          for(const obj of layer.objects) {
            const propsArr = obj.properties || [];
            const props = Object.fromEntries(propsArr.map((pr: any) => [pr.name, pr.value]));
            const monitor = Object.assign(
              makeCollidable(p, this.x + obj.x, this.y + obj.y, obj.width, obj.height, obj.rotation ?? 0),
              {
                monitorPlan: String(props.monitor || ""),
                monitorPlanMobile: String(props.monitorMobile || ""),
              }
            );
            this.monitors.push(monitor);
          }
        }

        // DRZWI
        if (layer.type === 'objectgroup' && layer.objects) {
          for (const obj of layer.objects) {
            const t = (obj.type ?? obj.class ?? '').toLowerCase();
            if (t !== 'door') continue;
              
            const propsArr = Array.isArray(obj.properties) ? obj.properties : [];
            const props = Object.fromEntries(propsArr.map((p:any)=>[p.name,p.value]));

            const frames: number[] = String(props.frames ?? '')
              .split(',')
              .map(s => parseInt(s.trim(), 10))
              .filter(n => Number.isFinite(n));

              
            const door = {
              x: this.x + obj.x,
              y: this.y + obj.y,
              w: obj.width,
              h: obj.height,
              layerName: String(props.layerName ?? ''),
              frames: frames.length ? frames : [
                Number(props.closedGid ?? 0) >>> 0,
                Number(props.openGid ?? 0) >>> 0
              ].filter(Boolean),
              blocking: !!props.blocking,
              autoCloseMs: props.autoCloseMs ? Number(props.autoCloseMs) : undefined,
              state: 'closed' as const,
              frameIndex: 0,
              timer: 0,
              collidable: makeCollidable(p, this.x + obj.x, this.y + obj.y, obj.width, obj.height, obj.rotation ?? 0),
            };

            this.doors.push(door);

          }
        }

        //texts
        if (layer.type === "objectgroup" && layer.name === "Texts" && Array.isArray(layer.objects)) {
          for(const obj of layer.objects){
            const propsArr = obj.properties || [];
            const props = Object.fromEntries(propsArr.map((pr: any) => [pr.name, pr.value]));
            const textRaw: string =
              typeof (obj as any).text?.text === "string" ? (obj as any).text.text
              : typeof props.text === "string" ? props.text : "";
            
            if(!textRaw) continue;

            const color: string | undefined = (obj as any).text?.color || props.color;
            const fontSize: number | undefined =
              typeof (obj as any).text?.pixelsize === "number"
              ? (obj as any).text?.pixelsize
              : (props.fontSize ? Number(props.fontSize) : undefined);

            const above: boolean = !!props.above;

            this.texts.push({
              x: this.x + obj.x,
              y: this.y + obj.y,
              width: obj.width ?? 0,
              height: obj.height ?? 0,
              text: String(textRaw),
              color,
              fontSize,
              above
            });
          }
        }
      }

    },  
    getSpawnPoints() {
      const layer =
        this.tiledData.layers.find(
          (l: any) =>
            l.type === "objectgroup" && /spawn/i.test(String(l.name ?? ""))
        ) ?? null;
      return layer?.objects ?? [];
    },
    checkPortals(player: any){
      for(const portal of this.portals){
        if(!portal.active) continue;
        if(checkCollision(portal,player)) return portal;
      }
      return null;
    },
    checkRooms(player: any){
      for(const room of this.rooms){
        if(checkCollision(room, player)) return room;
      }
      return null;
    },
    checkMonitors(player: any){
      for(const monitor of this.monitors){
        if(checkCollision(monitor, player)) return monitor;
      }
      return null;
    },
    drawOneText(p: any, t: Types.Texts, camera: any){
      p.push();
      if( t.color ){
        const hex = t.color.replace('#','');
        const hasAlpha = hex.length === 8;
        const r = parseInt(hex.substring(0,2), 16);
        const g = parseInt(hex.substring(2,4), 16);
        const b = parseInt(hex.substring(4,6), 16);
        const a = hasAlpha ? parseInt(hex.substring(6,8), 16) : 255;
        p.fill(r,g,b,a);
      }else{
        p.fill(255);
      }
      p.noStroke();
      if(t.fontSize) p.textSize(t.fontSize);

      const dx = Math.round(t.x + camera.x);
      const dy = Math.round(t.y + camera.y);

      p.textAlign(p.LEFT, p.TOP);
      p.text(t.text, dx, dy);
      p.pop();
    },
    drawTileLayer(layer:any,camera:any){
      if (layer.visible === false) return;
      
      const layerOpacity = typeof layer.opacity === 'number' ? layer.opacity : 1;
      const needsTint = layerOpacity >= 0 && layerOpacity < 1;
      if (needsTint) { p.push(); p.tint(255, Math.round(layerOpacity * 255)); }

      if (this.tiledData.infinite && layer.chunks) {
        const vx0 = -camera.x, vy0 = -camera.y;
        const vx1 = vx0 + p.width, vy1 = vy0 + p.height;

        for (const chunk of layer.chunks) {
          const startX = this.x + chunk.x * this.tileWidth;
          const startY = this.y + chunk.y * this.tileHeight;

          const cx0 = startX, cy0 = startY;
          const cx1 = cx0 + chunk.width * this.tileWidth;
          const cy1 = cy0 + chunk.height * this.tileHeight;
          if (cx1 < vx0 || cx0 > vx1 || cy1 < vy0 || cy0 > vy1) continue;

          const colStart = Math.max(0, Math.floor((vx0 - cx0) / this.tileWidth));
          const colEnd   = Math.min(chunk.width - 1, Math.floor((vx1 - cx0) / this.tileWidth));
          const rowStart = Math.max(0, Math.floor((vy0 - cy0) / this.tileHeight));
          const rowEnd   = Math.min(chunk.height - 1, Math.floor((vy1 - cy0) / this.tileHeight));

          for (let row = rowStart; row <= rowEnd; row++) {
            for (let col = colStart; col <= colEnd; col++) {
              const i = row * chunk.width + col;
              const raw = (chunk.data[i] >>> 0);
              if (!raw) continue;

              const gid = raw & FLIP_MASK;
              const ts = this.reversedTilesets.find(ts => gid >= ts.firstgid);
              if (!ts) continue;

              const idx = gid - ts.firstgid;
              const pos = ts.tilePos[idx];
              if (!pos) continue;

              const dx = Math.round(startX + col * this.tileWidth + camera.x);
              const dy = Math.round(startY + row * this.tileHeight + camera.y);
              drawTile(p, ts.image, dx, dy, pos.x, pos.y, this.tileWidth, this.tileHeight);
            }
          }
        }
      }
      if (needsTint) { p.pop(); }
    },
    drawBackgroundLayers(player:any, camera:any){
      if (!this.tiledData) return;
      for (const layer of this.tiledData.layers) {
        if (layer.type !== 'tilelayer') continue;
        const propsArr = Array.isArray(layer.properties) ? layer.properties : [];
        const props = Object.fromEntries(propsArr.map((pr: any) => [pr.name, pr.value]));
        const isAbove = !!props.above;
        if (isAbove) continue;
        this.drawTileLayer(layer, camera);
      }

      for (const t of this.texts){
        if(t.above) continue;
        const vx0 = -camera.x, vy0 = -camera.y;
        const vx1 = vx0 + p.width, vy1 = vy0 + p.height;
        const x = t.x, y = t.y;
        if( x < vx0 - 64 || x > vx1 + 64 || y < vy0 - 64 || y > vy1 + 64) continue;
        this.drawOneText(p,t,camera);
      }


      for (const b of this.boundaries) {
        
        if (b.x > player.x + player.width + 96) continue;
        if (b.x + b.width < player.x - 96) continue;
        if (b.y > player.y + player.height + 96) continue;
        if (b.y + b.height < player.y - 96) continue;

        b.preventPassthroughFrom(player);
        // b.update(camera);
        // b.draw();
      }
    },
    drawForegroundLayers(player:any, camera:any){
      if (!this.tiledData) return;
      for (const layer of this.tiledData.layers) {
        if (layer.type !== 'tilelayer') continue;
        const propsArr = Array.isArray(layer.properties) ? layer.properties : [];
        const props = Object.fromEntries(propsArr.map((pr: any) => [pr.name, pr.value]));
        const isAbove = !!props.above;
        if (!isAbove) continue;
        this.drawTileLayer(layer, camera);
      }

      for(const t of this.texts){
        if(!t.above) continue;
        const vx0 = -camera.x, vy0 = -camera.y;
        const vx1 = vx0 + p.width, vy1 = vy0 + p.height;
        const x = t.x, y = t.y;
        if( x < vx0 - 64 || x > vx1 + 64 || y < vy0 - 64 || y > vy1 + 64) continue;
        this.drawOneText(p, t, camera);
      }

      for (const b of this.boundaries) {
        if (b.x > player.x + player.width + 96) continue;
        if (b.x + b.width < player.x - 96) continue;
        if (b.y > player.y + player.height + 96) continue;
        if (b.y + b.height < player.y - 96) continue;
        // b.preventPassthroughFrom(player);
        b.update(camera);
        b.draw();
      }
      for (const portal of this.portals) {
        if (portal.x > player.x + player.width + 144) continue;
        if (portal.x + portal.width < player.x - 144) continue;
        if (portal.y > player.y + player.height + 144) continue;
        if (portal.y + portal.height < player.y - 144) continue;
        portal.update(camera);
        portal.draw("portal");
      }
      
      for (const room of this.rooms) {
        if (room.x > player.x + player.width + 144) continue;
        if (room.x + room.width < player.x - 144) continue;
        if (room.y > player.y + player.height + 144) continue;
        if (room.y + room.height < player.y - 144) continue;
        room.update(camera);
        room.draw("room");
      }
      
      for (const monitor of this.monitors) {
        if (monitor.x > player.x + player.width + 256) continue;
        if (monitor.x + monitor.width < player.x - 256) continue;
        if (monitor.y > player.y + player.height + 256) continue;
        if (monitor.y + monitor.height < player.y - 256) continue;
        monitor.update(camera);
        monitor.draw("monitor");
      }
    },
    draw(camera:any, player:any) {
      if (!this.tiledData) return;

      const vx0 = -camera.x, vy0 = -camera.y;
      const vx1 = vx0 + p.width, vy1 = vy0 + p.height;

      for (const layer of this.tiledData.layers) {
        if (layer.type === 'tilelayer') {
          const layerOpacity = typeof layer.opacity === "number" ? layer.opacity : 1;
          const needsTint = layerOpacity >= 0 && layerOpacity < 1;

          if (this.tiledData.infinite && layer.chunks) {
            if(needsTint) { p.push(); p.tint(255, Math.round(layerOpacity * 255)); }

            for (const chunk of layer.chunks) {
              const startX = this.x + chunk.x * this.tileWidth;
              const startY = this.y + chunk.y * this.tileHeight;

              const cx0 = startX, cy0 = startY;
              const cx1 = cx0 + chunk.width * this.tileWidth;
              const cy1 = cy0 + chunk.height * this.tileHeight;
              if (cx1 < vx0 || cx0 > vx1 || cy1 < vy0 || cy0 > vy1) continue;

              const colStart = Math.max(0, Math.floor((vx0 - cx0) / this.tileWidth));
              const colEnd   = Math.min(chunk.width - 1, Math.floor((vx1 - cx0) / this.tileWidth));
              const rowStart = Math.max(0, Math.floor((vy0 - cy0) / this.tileHeight));
              const rowEnd   = Math.min(chunk.height - 1, Math.floor((vy1 - cy0) / this.tileHeight));

              for (let row = rowStart; row <= rowEnd; row++) {
                for (let col = colStart; col <= colEnd; col++) {
                  const i = row * chunk.width + col;
                  const raw = chunk.data[i] >>> 0;
                  if (!raw) continue;
                  
                  const fh = (raw & FLIP_H) !== 0;
                  const fv = (raw & FLIP_V) !== 0;
                  const gid = raw & FLIP_MASK;

                  const ts = this.reversedTilesets.find(ts => gid >= ts.firstgid);
                  if (!ts) continue;
                  const idx = gid - ts.firstgid;
                  const pos = ts.tilePos[idx];
                  if (!pos) continue;

                  const dx = Math.round(startX + col * this.tileWidth + camera.x);
                  const dy = Math.round(startY + row * this.tileHeight + camera.y);

                  drawTile(p, ts.image, dx, dy, pos.x, pos.y, this.tileWidth, this.tileHeight);
                }
              }
            }
            if (needsTint) { p.pop(); }
          }
        }        
      }
      
      // for (const b of this.boundaries) {
      //   if (b.x > player.x + player.width + 96) continue;
      //   if (b.x + b.width < player.x - 96) continue;
      //   if (b.y > player.y + player.height + 96) continue;
      //   if (b.y + b.height < player.y - 96) continue;
      //   b.preventPassthroughFrom(player);
      //   b.update(camera);
      //   b.draw(); 
      // }

      // for (const portal of this.portals) {
      //   portal.update(camera);
      //   portal.draw();
      // }
    }
    
  };
};
``