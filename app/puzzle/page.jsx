"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

export default function PuzzlePage() {
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const thumbs = ["/1.png", "/2.png", "/3.png", "/4.png", "/5.png"];

  // AZ & EN açıklamalar
  const descriptionsAz = [
    "“Bayquşlarla qarğaların vuruşması” miniatürü. “Kəlilə və Dimnə”. Rəssam Şəmsəddin Təbrizi. Təbriz, 1390-cı illər. Sultan Əhməd Cəlairin nüsxəsi. Topqapı sarayı muzeyi, İstanbul",
    "“Cəngavər atı ilə” miniatürü. Rəssam Əbdül Baği Bakuvi. Təbriz, 1430-cu illər. Topqapı sarayı muzeyi, İstanbul",
    "“Çövkən oyunu” miniatürü. “Quy və Çövkən”. Rəssam Soltan Məhəmməd (və ya onun şagirdlərindən biri). Təbriz, 1524-cü il. Rusiya Milli Kitabxanası, Sankt-Peterburq",
    "“Gənc zadəgan və qoca” miniatürü. “Xəmsə”. Rəssam Kəmaləddin Behzad. Təbriz, 1530-cu illər. Frir qalereyası, Vaşinqton",
    "“İsfəndiyar əjdahanı öldürür” miniatürü. Rəssam Sadıq bəy Əfşar. II Şah İsmayılın “Şahnamə”si. Təbriz, 1576-1577-ci illər. Ağa Xan Muzeyi, Toronto",
  ];
  const descriptionsEn = [
    "Miniature “The Battle of Owls and Crows”. “Kalila and Dimna”. Artist Shamseddin Tabrizi. Tabriz, 1390s. Copy of Sultan Ahmad Jalayir. Topkapi Palace Museum, Istanbul",
    "Miniature “Knight with his horse”. Artist Abdul-Baqi Bakuvi. Tabriz, 1430s. Topkapi Palace Museum, Istanbul",
    "Miniature “The Chovkan Game”. “Quy and Chovkan”. Artist Sultan Muhammad (or one of his students). Tabriz, 1524. National Library of Russia, St. Petersburg",
    "Miniature “Young Nobleman and Old Man”. “Khamsa”. Artist Kamaleddin Behzad. Tabriz, 1530s. Freer Gallery of Art, Washington",
    "Miniature “Isfandiyar Slaying the Dragon”. Artist Sadiq Bey Afshar",
  ];

  const [activeThumb, setActiveThumb] = useState(0);

  /* ====================== MÜZİK: Kayıttan Devam & Autostart ====================== */
  // ==== GLOBAL BGM (autoplay + sayfalar arası kesintisiz) ====
useEffect(() => {
  if (typeof window === "undefined") return;

  const STORAGE_KEY = "puzzleAudioState";
  const readSaved = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch { return {}; }
  };
  const save = (a) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          time: a.currentTime || 0,
          playing: !a.paused,
          muted: a.muted,
          volume: a.volume,
        })
      );
    } catch {}
  };
  const throttle = (fn, ms = 1000) => {
    let t = 0;
    return () => {
      const n = Date.now();
      if (n - t > ms) { t = n; fn(); }
    };
  };

  const w = window; // @ts-ignore
  let a = w.__bgmAudio;

  // yoksa oluştur
  if (!a) {
    a = new Audio("/1.mp3");
    a.loop = true;
    a.preload = "auto";
    a.autoplay = true;

    // kayıttan devam
    const saved = readSaved();
    const onMeta = () => {
      if (Number.isFinite(saved?.time)) {
        try { a.currentTime = Math.max(0, saved.time); } catch {}
      }
      a.muted  = saved?.muted ?? false;
      a.volume = saved?.volume ?? 1;
      a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    };
    a.addEventListener("loadedmetadata", onMeta, { once: true });

    // engelleme olursa ilk tıklamada/kilit aç
    const unlock = () => {
      a.play().then(() => setIsPlaying(true)).catch(() => {});
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });

    const saveThrottled = throttle(() => save(a), 1000);
    a.addEventListener("timeupdate", saveThrottled);
    a.addEventListener("play", () => { setIsPlaying(true); save(a); });
    a.addEventListener("pause", () => { setIsPlaying(false); save(a); });
    window.addEventListener("pagehide", () => save(a));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") save(a);
    });

    // anında dene
    a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));

    // global’e kaydet ve body’e ekle (DOM’dan kopup garbage olmasın)
    // @ts-ignore
    w.__bgmAudio = a;
    try { document.body.appendChild(a); } catch {}
  } else {
    // var olanı kullan
    setIsPlaying(!a.paused);
    // tekrar dene (engellenmiş olabilir)
    a.play().then(() => setIsPlaying(true)).catch(() => {});
  }

  audioRef.current = a;

  return () => {
    // audio’yu kapatma! sayfalar arası çalmaya devam edecek.
    audioRef.current = a;
  };
}, []);


  const ensurePlayAudio = () => {
    const a = audioRef.current;
    if (!a) return;
    a.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const toggleMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      a.pause();
      setIsPlaying(false);
    }
  };

  /* ====================== PUZZLE ====================== */
  useEffect(() => {
    if (!containerRef.current) return;

    if (typeof window !== "undefined" && window.__puzzleKill) {
      try { window.__puzzleKill(); } catch {}
    }

    /* ---------- SABİT TEPSİ ÖLÇÜLERİ ---------- */
    const BOARD_LEFT = 300, BOARD_TOP = 140;
    const BOARD_W = 1200, BOARD_H = 675;

    /* ---------- STYLES ---------- */
    const style = document.createElement("style");
    style.innerHTML = `
      :root{
        --board-left:${BOARD_LEFT}px;
        --board-top:${BOARD_TOP}px;
        --board-w:${BOARD_W}px;
        --board-h:${BOARD_H}px;
        --blue:#13CAFF;
      }
      html,body{height:100%}
      *{-webkit-tap-highlight-color:transparent}
      .museum-root{position:relative;width:100%;height:100%}
      #forPuzzle{position:absolute;inset:0;overflow:hidden;cursor:pointer;touch-action:none;-webkit-user-select:none;user-select:none}
      .polypiece{position:absolute;display:block;overflow:hidden;touch-action:none;will-change:left,top}
      .moving{transition:top 1s linear,left 1s linear}
      .gameCanvas{display:none;position:absolute}

      .titleWrap{position:absolute;left:0;right:0;top:24px;text-align:center;z-index:1000}
      .title{font-size:36px;font-weight:800;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.5)}
      .subtitle{font-size:22px;color:#fff;opacity:.95;margin-top:4px}

      .leftDock{position:absolute;left:24px;top:140px;width:280px;display:flex;flex-direction:column;gap:18px;z-index:1200}
      .thumbs{display:grid;grid-template-columns:repeat(2,120px);gap:18px}
      .thumb{border:3px solid rgba(255,255,255,.6);border-radius:10px;overflow:hidden;background:transparent;padding:0;transition:box-shadow .2s,border-color .2s,transform .06s;min-height:48px}
      .thumb:active{transform:scale(.98)}
      .thumb.active{border-color:var(--blue);box-shadow:0 0 0 4px rgba(19,202,255,.35)}
      .thumb img{display:block}

      #boardFrame{
        position:absolute;
        left:var(--board-left); top:var(--board-top);
        width:var(--board-w); height:var(--board-h);
        border:3px solid rgba(255,255,255,.95);
        border-radius:6px;
        box-shadow:0 10px 30px rgba(0,0,0,.35) inset;
        pointer-events:none; z-index:5;
      }
      #lockShade{
        position:absolute;
        left:var(--board-left); top:var(--board-top);
        width:var(--board-w); height:var(--board-h);
        z-index:8; pointer-events:none; display:none
      }
      #lockShade.on{
        display:block;
        background:repeating-linear-gradient(45deg,rgba(0,0,0,.15) 0 10px,rgba(0,0,0,.25) 10px 20px)
      }

      /* Sağ üst: Home + Müzik butonları */
      .topBtns{position:absolute; top:24px; right:24px; z-index:1400; display:flex; gap:10px}
      .iconBtn{
        display:inline-flex; align-items:center; justify-content:center;
        width:48px; height:48px; border-radius:12px;
        background:rgba(0,0,0,.5); color:#fff; text-decoration:none;
        border:1px solid rgba(255,255,255,.35);
        backdrop-filter: blur(2px);
        cursor:pointer;
      }
      .iconBtn:active{ transform:translateY(1px) }
      .iconBtn svg{ width:24px; height:24px; stroke:#fff }

      .controlDock{position:absolute;left:24px;bottom:36px;width:260px;z-index:1200;display:flex;flex-direction:column;gap:14px}
      @media screen and (width: 1920px) and (height: 1080px) {
        .controlDock { bottom: 202px !important; }
      }
      .piecesCol{display:flex;flex-direction:column;gap:10px}

      .pieceBtn{
        background:#fff;
        color:var(--blue);
        border:2px solid var(--blue);
        border-radius:12px;
        padding:12px 14px;
        text-align:center;
        font-weight:800;
        cursor:pointer;
        min-height:48px;
      }
      .pieceBtn.active{
        background:var(--blue);
        color:#fff;
        box-shadow:0 0 0 3px rgba(19,202,255,.25) inset;
      }

      .btn{background:var(--blue);color:#fff;font-weight:700;padding:12px 16px;border-radius:12px;text-align:center;cursor:pointer;border:none;min-height:48px}
      .btn.sm{padding:10px 14px;border-radius:10px}
      .btn.active{box-shadow:0 0 0 3px rgba(19,202,255,.35) inset;filter:saturate(1.2)}
      .timerBox{display:flex;align-items:center;gap:8px}
      .label{font-weight:700;color:#fff;opacity:.9}
      .count{min-width:90px;height:48px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;letter-spacing:.5px;font-size:16px}

      .overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;z-index:2000}
      .overlay.show{display:flex}
      .ovbox{background:rgba(25,25,25,.9);padding:28px 32px;border-radius:16px;text-align:center;color:#fff;width:min(90vw,420px)}
      .ovbox h2{font-size:20px;margin:0 0 10px}
      .ovbox p{opacity:.9;margin:0 0 16px}

      /* Açıklama (AZ + EN) */
      .descBar{
        position:absolute;
        left:var(--board-left);
        top:calc(var(--board-top) + var(--board-h) + 14px);
        width:var(--board-w);
        max-height:140px;overflow:auto;padding:12px 14px;border-radius:8px;
        background:rgba(0,0,0,.45);color:#fff;font-size:14px;line-height:1.35;backdrop-filter:blur(2px);z-index:6;
      }
      .descBar .descEn{ margin-top:8px; opacity:.92; font-style:italic; font-size:13px }
    `;
    document.head.appendChild(style);

    const ctrl = new AbortController();
    let rafId = 0;

    /* ---------- Helpers / Engine ---------- */
    const mhypot = Math.hypot, mabs = Math.abs;
    const mround = Math.round, msqrt = Math.sqrt, mfloor = Math.floor;
    const rnd = Math.random;
    const alea = (a,b)=> (b===undefined ? a*rnd() : a + (b-a)*rnd());
    const intAlea = (a,b)=>{ if(b===undefined){b=a;a=0;} return mfloor(a+(b-a)*rnd()); };
    const arrayShuffle = (arr)=>{ for(let k=arr.length-1;k>=1;--k){const r=intAlea(0,k+1);[arr[k],arr[r]]=[arr[r],arr[k]];} return arr; };

    class Point{constructor(x,y){this.x=+x;this.y=+y}}
    class Segment{
      constructor(p1,p2){this.p1=new Point(p1.x,p1.y);this.p2=new Point(p2.x,p2.y);}
      dx(){return this.p2.x-this.p1.x} dy(){return this.p2.y-this.p1.y}
      pointOnRelative(c){return new Point(this.p1.x+c*this.dx(),this.p1.y+c*this.dy())}
    }
    class Side{
      constructor(){this.type="";this.points=[];this.scaledPoints=[]}
      reversed(){const ns=new Side();ns.type=this.type;ns.points=this.points.slice().reverse();return ns}
      scale(p){const sx=p.scalex, sy=p.scaley; this.scaledPoints=this.points.map(pt=>new Point(pt.x*sx, pt.y*sy))}
      drawPath(ctx,ox,oy,noMove){
        const P=this.scaledPoints; if(!noMove) ctx.moveTo(P[0].x+ox, P[0].y+oy);
        if(this.type==="d") ctx.lineTo(P[1].x+ox, P[1].y+oy);
        else for(let k=1;k<P.length-1;k+=3){
          ctx.bezierCurveTo(P[k].x+ox,P[k].y+oy,P[k+1].x+ox,P[k+1].y+oy,P[k+2].x+ox,P[k+2].y+oy);
        }
      }
    }
    function twist(side,ca,cb){
      const seg0=new Segment(side.points[0], side.points[1]);
      const seg1=new Segment(ca, cb);
      const mid0=seg0.pointOnRelative(0.5), mid1=seg1.pointOnRelative(0.5);
      const segM=new Segment(mid0, mid1);
      const dxh=seg0.dx(), dyh=seg0.dy(), dxv=segM.dx(), dyv=segM.dy();
      const pointAt=(ch,cv)=> new Point(seg0.p1.x+ch*dxh+cv*dxv, seg0.p1.y+ch*dyh+cv*dyv);
      const sx=alea(0.85,1), sy=alea(0.9,1), mid=alea(0.45,0.55);
      const pa=pointAt(mid-1/12*sx, 1/12*sy), pb=pointAt(mid-2/12*sx, 3/12*sy), pc=pointAt(mid, 4/12*sy), pd=pointAt(mid+2/12*sx, 3/12*sy), pe=pointAt(mid+1/12*sx, 1/12*sy);
      side.points=[ seg0.p1,
        new Point(seg0.p1.x+5/12*dxh*0.52, seg0.p1.y+5/12*dyh*0.52),
        new Point(pa.x-1/12*dxv*0.72, pa.y-1/12*dyv*0.72), pa,
        new Point(pa.x+1/12*dxv*0.72, pa.y+1/12*dyv*0.72),
        new Point(pb.x-1/12*dxv*0.92, pb.y-1/12*dyv*0.92), pb,
        new Point(pb.x+1/12*dxv*0.52, pb.y+1/12*dyv*0.52),
        new Point(pc.x-2/12*dxh*0.4, pc.y-2/12*dyh*0.4), pc,
        new Point(pc.x+2/12*dxh*0.4, pc.y+2/12*dyh*0.4),
        new Point(pd.x+1/12*dxv*0.52, pd.y+1/12*dyv*0.52), pd,
        new Point(pd.x-1/12*dxv*0.92, pd.y-1/12*dyv*0.92),
        new Point(pe.x+1/12*dxv*0.72, pe.y+1/12*dyv*0.72), pe,
        new Point(pe.x-1/12*dxv*0.72, pe.y-1/12*dyv*0.72),
        new Point(seg0.p2.x-5/12*dxh*0.52, seg0.p2.y-5/12*dyh*0.52),
        seg0.p2
      ];
      side.type="z";
    }
    class Piece{
      constructor(kx,ky){this.ts=new Side();this.rs=new Side();this.bs=new Side();this.ls=new Side();this.kx=kx;this.ky=ky}
      scale(p){this.ts.scale(p);this.rs.scale(p);this.bs.scale(p);this.ls.scale(p)}
    }
    class PolyPiece{
      constructor(piece,puzzle){
        this.pckxmin=piece.kx; this.pckxmax=piece.kx+1; this.pckymin=piece.ky; this.pckymax=piece.ky+1;
        this.pieces=[piece]; this.puzzle=puzzle;
        this.listLoops();
        this.canvas=document.createElement("canvas"); this.canvas.className="polypiece"; this.ctx=this.canvas.getContext("2d");
        puzzle.container.appendChild(this.canvas);
        this.x=0; this.y=0; this.nx=0; this.ny=0; this.offsx=0; this.offsy=0;
      }
      listLoops(){
        const that=this;
        function isCommon(kx,ky,e){ if(e===0)ky--; else if(e===1)kx++; else if(e===2)ky++; else kx--; return that.pieces.some(p=>p.kx===kx && p.ky===ky); }
        function findEdge(kx,ky,e){ for(let i=0;i<tbEdges.length;i++) if(kx===tbEdges[i].kx && ky===tbEdges[i].ky && e===tbEdges[i].edge) return i; return false; }
        let tbLoops=[], tbEdges=[];
        for(let k=0;k<this.pieces.length;k++) for(let e=0;e<4;e++) if(!isCommon(this.pieces[k].kx,this.pieces[k].ky,e)) tbEdges.push({kx:this.pieces[k].kx,ky:this.pieces[k].ky,edge:e,kp:k});
        const tries=[
          [{dkx:0,dky:0,e:1},{dkx:1,dky:0,e:0},{dkx:1,dky:-1,e:3}],
          [{dkx:0,dky:0,e:2},{dkx:0,dky:1,e:1},{dkx:1,dky:1,e:0}],
          [{dkx:0,dky:0,e:3},{dkx:-1,dky:0,e:2},{dkx:-1,dky:1,e:1}],
          [{dkx:0,dky:0,e:0},{dkx:0,dky:-1,e:3},{dkx:-1,dky:-1,e:2}],
        ];
        while(tbEdges.length){
          let loop=[], curr=tbEdges[0]; loop.push(curr); tbEdges.splice(0,1);
          while(1){
            let idx=false, cand;
            for(let t=0;t<3;t++){ cand=tries[curr.edge][t]; idx=findEdge(curr.kx+cand.dkx, curr.ky+cand.dky, cand.e); if(idx!==false) break; }
            if(idx===false) break;
            curr=tbEdges[idx]; loop.push(curr); tbEdges.splice(idx,1);
          }
          tbLoops.push(loop);
        }
        this.tbLoops=tbLoops.map(lp=>lp.map(ed=>{ const c=this.pieces[ed.kp]; if(ed.edge===0) return c.ts; if(ed.edge===1) return c.rs; if(ed.edge===2) return c.bs; return c.ls; }));
      }
      drawPath(ctx,ox,oy){ this.tbLoops.forEach(loop=>{ let first=true; loop.forEach(s=>{ s.drawPath(ctx,ox,oy,!first); first=false; }); ctx.closePath(); }); }
      drawImage(){
        const p=this.puzzle, dpr=p.dpr||1;
        this.nx=this.pckxmax-this.pckxmin+1; this.ny=this.pckymax-this.pckymin+1;

        this.canvas.width  = Math.round(this.nx*p.scalex * dpr);
        this.canvas.height = Math.round(this.ny*p.scaley * dpr);
        this.canvas.style.width  = (this.nx*p.scalex) + "px";
        this.canvas.style.height = (this.ny*p.scaley) + "px";

        this.offsx=(this.pckxmin-0.5)*p.scalex; this.offsy=(this.pckymin-0.5)*p.scaley;

        this.ctx.setTransform(dpr,0,0,dpr,0,0);
        this.path=new Path2D(); this.drawPath(this.path, -this.offsx, -this.offsy);

        const ctx=this.ctx;
        ctx.fillStyle="none"; ctx.shadowColor="rgba(0,0,0,.5)"; ctx.shadowBlur=4; ctx.shadowOffsetX=4; ctx.shadowOffsetY=4; ctx.fill(this.path); ctx.shadowColor="rgba(0,0,0,0)";
        this.pieces.forEach((pp)=>{
          ctx.save();
          const path=new Path2D(); const sx=-this.offsx, sy=-this.offsy;
          pp.ts.drawPath(path,sx,sy,false); pp.rs.drawPath(path,sx,sy,true); pp.bs.drawPath(path,sx,sy,true); pp.ls.drawPath(path,sx,sy,true);
          path.closePath(); ctx.clip(path);

          const srcx=pp.kx ? (pp.kx-0.5)*p.scalex : 0, srcy=pp.ky ? (pp.ky-0.5)*p.scaley : 0;
          const dx=(pp.kx?0:p.scalex/2)+(pp.kx-this.pckxmin)*p.scalex, dy=(pp.ky?0:p.scaley/2)+(pp.ky-this.pckymin)*p.scaley;
          let w=2*p.scalex, h=2*p.scaley; if(srcx+w>p.gameCanvasCssW) w=p.gameCanvasCssW-srcx; if(srcy+h>p.gameCanvasCssH) h=p.gameCanvasCssH-srcy;

          const s = p.dpr||1;
          ctx.drawImage(p.gameCanvas, srcx*s, srcy*s, w*s, h*s, dx,dy,w,h);

          ctx.translate(p.embossThickness/2, -p.embossThickness/2); ctx.lineWidth=p.embossThickness; ctx.strokeStyle="rgba(0,0,0,.35)"; ctx.stroke(path);
          ctx.translate(-p.embossThickness, p.embossThickness); ctx.strokeStyle="rgba(255,255,255,.35)"; ctx.stroke(path);
          ctx.restore();
        });
      }
      moveTo(x,y){ this.x=x; this.y=y; this.canvas.style.left=x+"px"; this.canvas.style.top=y+"px"; }
      ifNear(other){
        const p=this.puzzle;
        const x=this.x - p.scalex*this.pckxmin, y=this.y - p.scaley*this.pckymin;
        const ox=other.x - p.scalex*other.pckxmin, oy=other.y - p.scaley*other.pckymin;
        if(mhypot(x-ox,y-oy)>=p.dConnect) return false;
        for(let i=this.pieces.length-1;i>=0;--i) for(let j=other.pieces.length-1;j>=0;--j){
          const a=this.pieces[i], b=other.pieces[j];
          if(a.kx===b.kx && mabs(a.ky-b.ky)===1) return true;
          if(a.ky===b.ky && mabs(a.kx-b.kx)===1) return true;
        }
        return false;
      }
      merge(other){
        const ox=this.pckxmin, oy=this.pckymin;
        const idx=this.puzzle.polyPieces.indexOf(other); this.puzzle.polyPieces.splice(idx,1);
        this.puzzle.container.removeChild(other.canvas);
        for(let k=0;k<other.pieces.length;k++){
          const p=other.pieces[k];
          this.pieces.push(p);
          this.pckxmin=Math.min(this.pckxmin,p.kx); this.pckxmax=Math.max(this.pckxmax,p.kx+1);
          this.pckymin=Math.min(this.pckymin,p.ky); this.pckymax=Math.max(this.pckymax,p.ky+1);
        }
        this.pieces.sort((p1,p2)=>p1.ky-p2.ky || p1.kx-p2.kx);
        this.listLoops(); this.drawImage();

        this.moveTo(
          this.x + this.puzzle.scalex * (this.pckxmin - ox),
          this.y + this.puzzle.scaley * (this.pckymin - oy)
        );

        const cl = this.puzzle.clampFixed(this.x, this.y);
        this.moveTo(cl.x, cl.y);

        this.puzzle.evaluateZIndex();
      }
    }

    class PuzzleEngine{
      constructor(container, events){
        this.container=container; this._events = events;

        container.addEventListener("pointerdown",(e)=>{ e.preventDefault(); this._events.push({t:"down", p:this.rel(e)}); }, {signal: ctrl.signal});
        container.addEventListener("pointerup",   ()=>{ this._events.push({t:"up"}); }, {signal: ctrl.signal});
        container.addEventListener("pointercancel",()=>{ this._events.push({t:"up"}); }, {signal: ctrl.signal});
        container.addEventListener("pointermove",(e)=>{
          e.preventDefault();
          const last=this._events[this._events.length-1];
          if(last?.t==="move") this._events.pop();
          this._events.push({t:"move", p:this.rel(e)});
        }, {signal: ctrl.signal});

        this.gameCanvas=document.createElement("canvas"); this.gameCanvas.className="gameCanvas"; container.appendChild(this.gameCanvas);
        this.srcImage=new window.Image();
        this.srcImage.onload=()=>{this.imageLoaded=true; this._events.push({t:"imgLoaded"});};

        this.nbPieces=20;
      }
      rel(e){const r=this.container.getBoundingClientRect(); return {x:e.clientX-r.x, y:e.clientY-r.y};}
      getSize(){const cs=getComputedStyle(this.container); this.contWidth=parseFloat(cs.width); this.contHeight=parseFloat(cs.height);}
      reset(){this.container.querySelectorAll(".polypiece").forEach(n=>n.remove()); this.imageLoaded=false;}
      create(){ this.getSize(); this.computenxny(); this.defineShapes({coeffDecentr:0.12});
        this.polyPieces=[]; this.pieces.forEach(row=>row.forEach(pc=>this.polyPieces.push(new PolyPiece(pc,this))));
        arrayShuffle(this.polyPieces); this.evaluateZIndex(); }
      computenxny(){
        const w=this.srcImage.naturalWidth || 1, h=this.srcImage.naturalHeight || 1, n=this.nbPieces || 12;
        let errMin=1e9; const nH=mround(msqrt((n*w)/h)), nV=mround(n/Math.max(1,nH));
        this.nx=Math.max(2,nH); this.ny=Math.max(2,nV);
        for(let ky=0;ky<5;ky++){
          for(let kx=0;kx<5;kx++){
            const ny=nV+ky-2, nx=nH+kx-2;
            if (nx<2 || ny<2) continue;
            let err=(nx*h)/ny/w; err=err+1/err-2; err+=Math.abs(1-(nx*ny)/n);
            if(err<errMin){errMin=err; this.nx=nx; this.ny=ny;}
          }
        }
      }
      defineShapes({coeffDecentr}){
        const nx=this.nx, ny=this.ny, corners=[];
        for(let ky=0;ky<=ny;ky++){ corners[ky]=[];
          for(let kx=0;kx<=nx;kx++){
            corners[ky][kx]=new Point(kx+alea(-coeffDecentr,coeffDecentr), ky+alea(-coeffDecentr,coeffDecentr));
            if(kx===0) corners[ky][kx].x=0; if(kx===nx) corners[ky][kx].x=nx;
            if(ky===0) corners[ky][kx].y=0; if(ky===ny) corners[ky][kx].y=ny;
          }
        }
        this.pieces=[];
        for(let ky=0;ky<ny;ky++){ this.pieces[ky]=[];
          for(let kx=0;kx<nx;kx++){
            const p=new Piece(kx,ky); this.pieces[ky][kx]=p;
            if(ky===0){ p.ts.points=[corners[ky][kx], corners[ky][kx+1]]; p.ts.type="d"; } else p.ts=this.pieces[ky-1][kx].bs.reversed();
            p.rs.points=[corners[ky][kx+1], corners[ky+1][kx+1]]; p.rs.type="d";
            if(kx<nx-1) intAlea(2) ? twist(p.rs, corners[ky][kx], corners[ky+1][kx]) : twist(p.rs, corners[ky][kx+2], corners[ky+1][kx+2]);
            if(kx===0){ p.ls.points=[corners[ky+1][kx], corners[ky][kx]]; p.ls.type="d"; } else p.ls=this.pieces[ky][kx-1].rs.reversed();
            p.bs.points=[corners[ky+1][kx+1], corners[ky+1][kx]]; p.bs.type="d";
            if(ky<ny-1) intAlea(2) ? twist(p.bs, corners[ky][kx+1], corners[ky][kx]) : twist(p.bs, corners[ky+2][kx+1], corners[ky+2][kx]);
          }
        }
      }
      scale(){
        this.getSize();
        const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
        this.dpr = dpr;

        const iw=this.srcImage.naturalWidth, ih=this.srcImage.naturalHeight;
        const rImg = iw/ih, rBoard = (BOARD_W)/(BOARD_H);
        let fitW, fitH, padX, padY;
        if (rImg >= rBoard) { fitW = BOARD_W; fitH = Math.round(BOARD_W / rImg); padX = 0; padY = Math.floor((BOARD_H - fitH)/2); }
        else { fitH = BOARD_H; fitW = Math.round(BOARD_H * rImg); padY = 0; padX = Math.floor((BOARD_W - fitW)/2); }

        this.gameWidth = fitW; this.gameHeight = fitH;
        this.offsx = BOARD_LEFT + padX; this.offsy = BOARD_TOP + padY;

        this.gameCanvas.width  = Math.round(fitW * dpr);
        this.gameCanvas.height = Math.round(fitH * dpr);
        this.gameCanvas.style.left = this.offsx + "px";
        this.gameCanvas.style.top  = this.offsy + "px";
        this.gameCanvas.style.width  = fitW + "px";
        this.gameCanvas.style.height = fitH + "px";

        const gctx = this.gameCanvas.getContext("2d");
        gctx.setTransform(dpr,0,0,dpr,0,0);
        gctx.clearRect(0,0,fitW,fitH);
        gctx.drawImage(this.srcImage, 0, 0, fitW, fitH);

        this.gameCanvasCssW = fitW;
        this.gameCanvasCssH = fitH;

        this.scalex = fitW / this.nx; this.scaley = fitH / this.ny;
        this.pieces.forEach(r=>r.forEach(pc=>pc.scale(this)));
        this.dConnect = Math.max(10, Math.min(this.scalex, this.scaley) / 10);
        this.embossThickness = Math.max(2, Math.min(5, 2 + (Math.min(this.scalex, this.scaley) / 200) * (5 - 2)));

        // Tahta içi kıskaç
        this.boardRect = {
          x0: this.offsx - this.scalex/2,
          y0: this.offsy - this.scaley/2,
          x1: this.offsx + this.gameWidth  - 1.5*this.scalex,
          y1: this.offsy + this.gameHeight - 1.5*this.scaley,
        };
      }
      evaluateZIndex(){ this.polyPieces.forEach((pp,k)=>pp.canvas.style.zIndex=String(k+10)); this.zIndexSup=this.polyPieces.length+10; }
      spreadRight(){
        const sxy = Math.min(this.scalex, this.scaley);
        const x0 = BOARD_LEFT + BOARD_W + sxy*0.5;
        const x1 = Math.min(this.contWidth - 1.5*sxy, BOARD_LEFT + BOARD_W + 420 - sxy*0.5);
        const y0 = BOARD_TOP + 40;
        const y1 = Math.min(this.contHeight - 1.5*this.scaley, BOARD_TOP + BOARD_H - 40);
        const r=(a,b)=> a+Math.random()*(b-a);
        this.polyPieces.forEach(pp=>pp.moveTo(r(x0,x1), r(y0,y1)));
      }
      clampFixed(x,y){
        return {
          x: Math.min(Math.max(x, this.boardRect.x0), this.boardRect.x1),
          y: Math.min(Math.max(y, this.boardRect.y0), this.boardRect.y1),
        };
      }
    }

    // ===== main loop, timer & UI =====
    const container = containerRef.current;
    const events = [];
    const puzzle = new PuzzleEngine(container, events);

    let state = 0;
    let moving = null;
    let currentSrc = thumbs[0];

    const overlay = document.getElementById("ov");
    const restartBtn = document.getElementById("btnRestart");
    const startBtn = document.getElementById("btnStart");
    const counter = document.getElementById("countdown");
    const partBtns = Array.from(document.querySelectorAll("[data-nb]"));
    const lockShade = document.getElementById("lockShade");

    const TIME_LIMIT = 180;
    let timerId = null;
    let timeLeft = TIME_LIMIT;
    let locked = true;

    const fmt = (s)=>{const m=Math.floor(s/60), r=s%60; return String(m).padStart(2,"0")+":"+String(r).padStart(2,"0");};
    function stopTimer(){ if(timerId){ clearInterval(timerId); timerId=null; } }
    function startTimer(){
      stopTimer();
      timeLeft = TIME_LIMIT;
      counter.textContent = fmt(timeLeft);
      locked = false; lockShade.classList.remove("on");
      // kullanıcı etkileşimi => müziği başlatmayı tekrar dene
      ensurePlayAudio();
      timerId = setInterval(()=>{
        timeLeft -= 1; counter.textContent = fmt(Math.max(0,timeLeft));
        if(timeLeft<=0){ stopTimer(); locked = true; lockShade.classList.add("on"); showEnd(false); }
      }, 1000);
    }
    function showEnd(win){
      const msg = document.getElementById("ovMsg");
      const sub = document.getElementById("ovSub");
      if (msg) msg.textContent = win ? "Təbriklər! Qazandınız" : "Vaxt bitdi! Uduzdunuz";
      if (sub) sub.textContent = win
        ? "Təbrik edirik, vaxt bitmədən tamamlandı!  Congratulations, you finished before time ran out!"
        : "Vaxt bitdi, tamamlanamadı.";
      overlay.classList.add("show");
    }
    function isSolved(){ return puzzle.polyPieces.length===1 && puzzle.polyPieces[0].pieces.length===puzzle.nx*puzzle.ny; }

    function bootWith(src){
      state = 0; moving = null; events.length = 0;
      overlay.classList.remove("show");
      currentSrc = src || currentSrc;
      stopTimer();
      counter.textContent = fmt(TIME_LIMIT);
      locked = true; lockShade.classList.add("on");
      puzzle.reset();
      puzzle.srcImage.src = currentSrc;
    }
    function restartKeepCount(){ bootWith(currentSrc); }

    partBtns.forEach((b)=>{
      b.addEventListener("click", ()=>{
        partBtns.forEach(x=>x.classList.remove("active"));
        b.classList.add("active");
        const val = parseInt(b.dataset.nb,10);
        if ([12,20,30].includes(val)) {
          puzzle.nbPieces = val;
          restartKeepCount();
        }
      }, {signal: ctrl.signal});
    });
    startBtn.addEventListener("click", ()=>{ startTimer(); }, {signal: ctrl.signal});
    restartBtn.addEventListener("click", ()=>{ restartKeepCount(); }, {signal: ctrl.signal});

    const def = document.querySelector('[data-nb="20"]');
    if (def) def.classList.add("active");

    window.__startPuzzle = bootWith;

    function animate(){
      rafId = requestAnimationFrame(animate);
      const e = events.shift();
      switch(state){
        case 0:
          if(!puzzle.imageLoaded) return;
          puzzle.create(); puzzle.scale();
          puzzle.polyPieces.forEach((pp)=>{
            pp.drawImage();
            pp.moveTo(
              puzzle.offsx + (pp.pieces[0].kx - 0.5) * puzzle.scalex,
              puzzle.offsy + (pp.pieces[0].ky - 0.5) * puzzle.scaley
            );
          });
          puzzle.polyPieces.forEach((pp)=>pp.canvas.classList.add("moving"));
          setTimeout(()=>puzzle.polyPieces.forEach(pp=>pp.canvas.classList.remove("moving")), 1200);
          puzzle.spreadRight();
          state = 50;
          break;

        case 50:
          if(!e) return;
          if(e.t === "down"){
            if(locked) return;
            const {x,y} = e.p;
            for(let k=puzzle.polyPieces.length-1;k>=0;--k){
              const pp=puzzle.polyPieces[k];
              if(pp.ctx.isPointInPath(pp.path, x-pp.x, y-pp.y)){
                moving={pp,startX:x,startY:y,baseX:pp.x,baseY:pp.y};
                puzzle.polyPieces.splice(k,1); puzzle.polyPieces.push(pp);
                pp.canvas.style.zIndex=String(puzzle.zIndexSup);
                state=55; return;
              }
            }
          }
          break;

        case 55:
          if(!e) return;
          if(e.t==="move"){
            if(locked) return;
            const nx=e.p.x - moving.startX + moving.baseX;
            const ny=e.p.y - moving.startY + moving.baseY;
            const cl=puzzle.clampFixed(nx, ny);
            moving.pp.moveTo(cl.x,cl.y);
          } else if(e.t==="up"){
            if(!locked){
              let merged;
              do{
                merged=false;
                for(let i=puzzle.polyPieces.length-1;i>=0;--i){
                  const other=puzzle.polyPieces[i];
                  if(other===moving.pp) continue;
                  if(moving.pp.ifNear(other)){
                    if(other.pieces.length>moving.pp.pieces.length){ other.merge(moving.pp); moving.pp=other; } else moving.pp.merge(other);
                    merged=true; break;
                  }
                }
              } while(merged);

              const cl = puzzle.clampFixed(moving.pp.x, moving.pp.y);
              moving.pp.moveTo(cl.x, cl.y);

              if(isSolved()){
                if(timeLeft > 0){ stopTimer(); locked = true; lockShade.classList.add("on"); showEnd(true); }
                else { showEnd(false); }
              }
            }
            puzzle.evaluateZIndex(); state=50; moving=null;
          }
          break;
      }
    }

    bootWith(thumbs[0]);
    animate();

    function kill(){
      try{ cancelAnimationFrame(rafId); }catch{}
      try{ ctrl.abort(); }catch{}
      try{ document.head.removeChild(style); }catch{}
      if (window.__startPuzzle === bootWith) window.__startPuzzle = undefined;
      if (window.__puzzleKill === kill) window.__puzzleKill = undefined;
      try{ containerRef.current?.querySelectorAll(".polypiece").forEach(n=>n.remove()); }catch{}
    }
    window.__puzzleKill = kill;

    return kill;
  }, []);

  const loadPuzzle = (src, idx) => {
    setActiveThumb(idx);
    window.__startPuzzle?.(src);
  };

  return (
    <div className="bg-[url(/bgimg.jpg)] bg-cover bg-center h-[100vh] w-full">
      <div className="museum-root">
        {/* Sağ üst: Home + Music */}
        <div className="topBtns">
          <Link href="/" className="iconBtn" aria-label="Ana səhifə">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <path d="M3 10.5L12 3l9 7.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 10v10h14V10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 20v-6h6v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <button
            type="button"
            className="iconBtn"
            onClick={toggleMusic}
            aria-label={isPlaying ? "Müziği durdur" : "Müziği başlat"}
            aria-pressed={isPlaying}
            title={isPlaying ? "Müziği durdur" : "Müziği başlat"}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <rect x="6" y="4" width="4" height="16" rx="1" stroke="currentColor"/>
                <rect x="14" y="4" width="4" height="16" rx="1" stroke="currentColor"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <path d="M8 5v14l11-7z" stroke="currentColor" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

        <div className="titleWrap">
          <div className="title">AZƏRBAYCAN MİNİATÜR SƏNƏTİ MUZEYİ</div>
          <div className="subtitle title">MUSEUM OF AZERBAIJANI MINIATURE ART</div>
        </div>

        {/* Sol thumbnails */}
        <div className="leftDock">
          <div className="thumbs">
            {thumbs.map((src, i) => (
              <button
                key={i}
                className={`thumb ${activeThumb===i ? "active": ""}`}
                onClick={() => loadPuzzle(src, i)}
                aria-label={`thumb-${i+1}`}
              >
                <Image src={src} alt="" width={120} height={120} draggable={false} />
              </button>
            ))}
          </div>
        </div>

        {/* Puzzle alanı + sabit çerçeve */}
        <div id="forPuzzle" ref={containerRef} />
        <div id="boardFrame" />
        <div id="lockShade" className="on" />

        {/* Açıklamalar (AZ + EN) */}
        <div className="descBar">
          <div className="descAz"><span className="font-bold text-[#13CAFF]">AZ </span>{descriptionsAz[activeThumb]}</div>
          <div className="descAz"><span className="font-bold text-[#13CAFF]">EN </span>{descriptionsEn[activeThumb]}</div>
        </div>

        {/* Kontrol paneli */}
        <div className="controlDock">
          <div className="piecesCol">
            <button className="pieceBtn" data-nb="12">12 Parça / 12 Pieces</button>
            <button className="pieceBtn" data-nb="20">20 Parça / 20 Pieces</button>
            <button className="pieceBtn" data-nb="30">30 Parça / 30 Pieces</button>
            <button id="btnStart" className="btn">BAŞLA / START</button>
          </div>
          <div className="timerBox">
            <div className="w-full flex flex-col justify-center items-center">
              <span className="label">Vaxt / Duration</span>
              <div id="countdown" className="count !text-3xl">03:00</div>
            </div>
          </div>
        </div>

        {/* Sonuç overlay */}
        <div id="ov" className="overlay">
          <div className="ovbox">
            <h2 id="ovMsg">Təbrik edirik, vaxt bitmədən tamamlandı!  Congratulations, you finished before time ran out!</h2>
            <p id="ovSub"></p>
            <button id="btnRestart" className="btn">Yenidən başlat / Play again</button>
          </div>
        </div>
      </div>
    </div>
  );
}
