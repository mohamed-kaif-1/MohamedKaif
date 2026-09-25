import * as THREE from './vendor/three.module.min.js';

// Composed locations in the supplied artwork, not random card coordinates.
export const SHOTS = [
  { zone: 'Waterfall', position: [-3.7, -1.9, 2.5], cameraOffset: [.2, .45, 11], lookAt: [0, -.65, 0], panelRotation: -.12, panelScale: 1, focusDistance: 11, at: .10 },
  { zone: 'Red branches', position: [3.5, -.1, 2], cameraOffset: [-.25, .35, 11], lookAt: [0, -.65, 0], panelRotation: .14, panelScale: 1, focusDistance: 11, at: .26 },
  { zone: 'Pagoda', position: [-3.9, .65, 1], cameraOffset: [.3, .35, 11.5], lookAt: [0, -.65, 0], panelRotation: -.1, panelScale: 1, focusDistance: 11.5, at: .42 },
  { zone: 'River valley', position: [.7, -1.65, 0], cameraOffset: [-.15, .35, 11], lookAt: [0, -.65, 0], panelRotation: .1, panelScale: 1, focusDistance: 11, at: .58 },
  { zone: 'Mountain mist', position: [1.2, .55, -2.2], cameraOffset: [.15, .3, 11.4], lookAt: [0, -.65, 0], panelRotation: -.08, panelScale: 1, focusDistance: 11.4, at: .74 },
  { zone: 'Foreground garden', position: [2.5, -1.7, 4], cameraOffset: [-.2, .35, 11], lookAt: [0, -.65, 0], panelRotation: .12, panelScale: 1, focusDistance: 11, at: .90 },
];
const smooth = t => t * t * (3 - 2 * t);
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const vertex = `varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;

export class CameraRig {
  constructor(camera) { this.camera = camera; this.target = new THREE.Vector3(); this.destination = new THREE.Vector3(); this.lookDestination = new THREE.Vector3(); this.initialized = false; this.rebuild(); }
  rebuild() {
    const mobile = innerWidth < 700;
    this.anchors = SHOTS.map(shot => ({ ...shot,
      position: new THREE.Vector3(shot.position[0] * (mobile ? .85 : 1), shot.position[1] * (mobile ? .8 : 1), shot.position[2]),
      cameraOffset: new THREE.Vector3(...shot.cameraOffset),
      lookAt: new THREE.Vector3(...shot.lookAt),
    }));
    const start = new THREE.Vector3(0, 0, 17);
    const end = new THREE.Vector3(0, -.2, 17);
    this.path = new THREE.CatmullRomCurve3([start, ...this.anchors.map(s => s.position.clone().add(s.cameraOffset)), end], false, 'centripetal');
    this.lookPath = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -.2, -3), ...this.anchors.map(s => s.position.clone().add(s.lookAt)), new THREE.Vector3(0, -.2, -3)], false, 'centripetal');
    this.times = [0, ...SHOTS.map(s => s.at), 1];
  }
  update(progress, dt) {
    let segment = 0;
    while (segment < this.times.length - 2 && progress > this.times[segment + 1]) segment++;
    const local = clamp((progress - this.times[segment]) / (this.times[segment + 1] - this.times[segment]));
    // Ease into each focus waypoint; one continuous spline, no snapping.
    const t = (segment + smooth(local)) / (this.times.length - 1);
    this.path.getPoint(t, this.destination);
    this.lookPath.getPoint(t, this.lookDestination);
    const ease = this.initialized ? 1 - Math.exp(-dt / .1) : 1;
    this.camera.position.lerp(this.destination, ease);
    this.target.lerp(this.lookDestination, ease);
    this.initialized = true;
    this.camera.lookAt(this.target);
    this.camera.updateMatrixWorld();
  }
}

export async function createProjectWorld(selected, host) {
  const canvas = document.createElement('canvas');
  canvas.className = 'project-world-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const context = canvas.getContext('webgl2', { alpha: true, antialias: false, powerPreference: 'high-performance' });
  if (!context) throw new Error('WebGL2 unavailable');
  const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: false });
  renderer.setClearColor(0x252527, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, .1, 100);
  const rig = new CameraRig(camera);
  const textures = [], materials = [], geometries = [], bitmaps = [];
  let disposed = false;
  const loader = new THREE.TextureLoader();
  const load = async url => {
    const texture = await loader.loadAsync(url);
    if (url.includes('-brand.') && texture.image.width > 1024 && typeof createImageBitmap === 'function') {
      const bitmap = await createImageBitmap(texture.image, { resizeWidth: 1024, resizeHeight: Math.round(texture.image.height * 1024 / texture.image.width), resizeQuality: 'high', imageOrientation: 'flipY' });
      texture.image = bitmap;
      texture.flipY = false;
      texture.needsUpdate = true;
      bitmaps.push(bitmap);
    }
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    textures.push(texture);
    return texture;
  };
  const material = value => { materials.push(value); return value; };
  const geometry = value => { geometries.push(value); return value; };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    textures.forEach(t => t.dispose()); materials.forEach(m => m.dispose()); geometries.forEach(g => g.dispose());
    renderer.dispose(); bitmaps.forEach(b => b.close()); canvas.remove();
  };
  try {
    const [landscape, ...logos] = await Promise.all([load('assets/images/kaif/japanese-landscape.webp'), ...selected.map(p => load(p.image))]);
    // A continuous depth-relief mesh avoids duplicated photographic edges.
    // Semantic depth bands: sky/far mountains, mid mountains, pagoda, trees,
    // waterfall/river, and the closest rock/branch layer.
    const terrainHeight = 40 * 941 / 1672;
    const terrain = geometry(new THREE.PlaneGeometry(40, terrainHeight, 96, 80));
    const positions = terrain.attributes.position, uv = terrain.attributes.uv;
    const bump = (u, v, x, y, rx, ry) => Math.exp(-(((u - x) / rx) ** 2) - ((v - y) / ry) ** 2);
    for (let i = 0; i < positions.count; i++) {
      const u = uv.getX(i), rawV = (uv.getY(i) - .15) / .85;
      // Mirror only the river's bottom edge into an overscan skirt. The original
      // landscape retains its geometry; low dolly shots never reveal a flat seam.
      const v = Math.abs(rawV);
      uv.setY(i, v);
      let z = -9 + smooth(clamp((.78 - v) / .72)) * 9;
      z += bump(u, v, .16, .47, .12, .28) * 1.4;
      z += bump(u, v, .89, .36, .2, .28) * 2.2;
      z += bump(u, v, .28, .16, .2, .18) * 1.2;
      const depthScale = (14 - z) / 23;
      positions.setXYZ(i, positions.getX(i) * depthScale, (rawV - .5) * terrainHeight * depthScale, z);
    }
    terrain.computeBoundingSphere();
    const landscapeMaterial = material(new THREE.ShaderMaterial({
      uniforms: { uMap: { value: landscape }, uTime: { value: 0 }, uVelocity: { value: 0 } },
      vertexShader: `uniform float uTime;varying vec2 vUv;
      void main(){vUv=uv;vec3 p=position;float tree=(1.-smoothstep(.40,.72,uv.y))*smoothstep(.55,.85,uv.x);
      p.x+=sin(uTime*.48+uv.y*5.)*.025*tree;p.y+=sin(uTime*.33+uv.x*7.)*.008*tree;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
      fragmentShader: `uniform sampler2D uMap;uniform float uTime;uniform float uVelocity;varying vec2 vUv;
      void main(){vec2 uv=vUv;float fall=exp(-pow((uv.x-.30)/.045,2.)-pow((uv.y-.16)/.12,2.));
      float river=(1.-smoothstep(.02,.10,uv.y))*smoothstep(.23,.4,uv.x)*(1.-smoothstep(.8,.95,uv.x));
      uv.y+=sin(uv.y*180.+uTime*4.5)*.0022*fall;
      uv.x+=sin(uv.y*310.-uTime*1.3)*.0023*river;
      uv.x+=sin(uTime*.06+uv.y*8.)*.0015*smoothstep(.7,.88,uv.y);
      vec4 c=texture2D(uMap,uv);float light=dot(c.rgb,vec3(.2126,.7152,.0722));
      c.rgb+=vec3(.012)*fall*smoothstep(.2,.75,light)*sin(uv.y*240.+uTime*5.);
      float sun=exp(-pow((uv.x-.37)/.045,2.)-pow((uv.y-.83)/.08,2.));
      c.rgb*=.48+sun*sin(uTime*.27)*.02;
      gl_FragColor=vec4(c.rgb,1.);
      #include <colorspace_fragment>
      }`,
      side: THREE.DoubleSide,
    }));
    scene.add(new THREE.Mesh(terrain, landscapeMaterial));
    const fogs = [];
    for (let i = 0; i < 3; i++) {
      const fogMaterial = material(new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uOpacity: { value: .12 }, uSeed: { value: i * 1.7 } },
        vertexShader: vertex,
        fragmentShader: `varying vec2 vUv;uniform float uTime;uniform float uOpacity;uniform float uSeed;
        void main(){vec2 p=(vUv-.5)*2.;float edge=exp(-dot(p,p)*3.)*(1.-smoothstep(.6,1.,abs(p.x)));
        float w=.55+.2*sin(vUv.x*11.+uTime*.12+uSeed)+.14*sin(vUv.x*23.-uTime*.2+vUv.y*7.);
        gl_FragColor=vec4(.55,.54,.52,edge*w*uOpacity);
        #include <colorspace_fragment>
        }`, transparent: true, depthWrite: false,
      }));
      const fog = new THREE.Mesh(geometry(new THREE.PlaneGeometry(19, 4.2)), fogMaterial);
      fog.position.set(i * 3 - 3, -1.3 - i * .55, -3 + i * 3.2);
      scene.add(fog); fogs.push(fog);
    }
    const panels = selected.map((p, i) => {
      const mat = material(new THREE.ShaderMaterial({
        uniforms: { uMap: { value: logos[i] }, uOpacity: { value: 1 }, uFocus: { value: 1 } },
        vertexShader: vertex,
        fragmentShader: `varying vec2 vUv;uniform sampler2D uMap;uniform float uOpacity;uniform float uFocus;
        void main(){vec4 c=texture2D(uMap,vUv);float ink=max(c.r,max(c.g,c.b));
        float edge=smoothstep(0.,.06,vUv.x)*smoothstep(0.,.06,1.-vUv.x)*smoothstep(0.,.06,vUv.y)*smoothstep(0.,.06,1.-vUv.y);
        float alpha=smoothstep(.001,.009,ink)*edge*uOpacity;
        c.rgb=mix(c.rgb*.62+vec3(.025),c.rgb,uFocus);
        gl_FragColor=vec4(c.rgb,alpha);
        #include <colorspace_fragment>
        }`, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      }));
      const mesh = new THREE.Mesh(geometry(new THREE.PlaneGeometry(4.2, 4.2 * 941 / 1672)), mat);
      mesh.position.copy(rig.anchors[i].position);
      scene.add(mesh);
      return mesh;
    });
    // A small shared instanced leaf geometry, never a canvas/loop per leaf.
    const leafShape = new THREE.Shape();
    [[0,-1],[.25,-.3],[.8,-.6],[.55,0],[1,.2],[.25,.45],[0,.9],[-.25,.4],[-.8,.2],[-.5,-.15],[-.65,-.6],[-.2,-.35]].forEach(([x,y],i) => i ? leafShape.lineTo(x,y) : leafShape.moveTo(x,y));
    leafShape.closePath();
    const leafMaterial = material(new THREE.MeshBasicMaterial({ color: 0xb01822, side: THREE.DoubleSide, transparent: true, opacity: .64, depthWrite: false }));
    const leafCount = innerWidth < 700 ? 7 : 15;
    const leaves = new THREE.InstancedMesh(geometry(new THREE.ShapeGeometry(leafShape)), leafMaterial, leafCount);
    leaves.frustumCulled = false; scene.add(leaves);
    const dummy = new THREE.Object3D(), projected = new THREE.Vector3(), localTurn = new THREE.Quaternion();
    const yAxis = new THREE.Vector3(0, 1, 0);
    let windTime = 0;
    function resize() {
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.5));
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
      rig.rebuild();
    }
    resize();
    host.append(canvas);
    return {
      canvas, camera, rig, renderer, resize, dispose,
      render(time, progress, velocity, dt) {
        if (disposed) return [];
        windTime += dt * (1 + velocity * .18);
        rig.update(progress, dt);
        landscapeMaterial.uniforms.uTime.value = time;
        landscapeMaterial.uniforms.uVelocity.value = velocity;
        fogs.forEach((fog, i) => {
          fog.material.uniforms.uTime.value = time;
          fog.material.uniforms.uOpacity.value = .10 + velocity * .04;
          fog.position.x = i * 3 - 3 + Math.sin(windTime * .07 + i) * .55;
        });
        for (let i = 0; i < leafCount; i++) {
          const phase = (windTime * (.035 + i * .001) + i * .137) % 1;
          dummy.position.set(-8 + (i * 3.71) % 16 + Math.sin(phase * 5 + i) * .35, 5 - phase * 11, -2 + i % 5 * 1.7);
          dummy.rotation.set(phase * 2, time * .25 + i, Math.sin(phase * 7 + i) * .7);
          dummy.scale.setScalar(.035 + i % 3 * .012);
          dummy.updateMatrix(); leaves.setMatrixAt(i, dummy.matrix);
        }
        leaves.instanceMatrix.needsUpdate = true;
        const items = panels.map((mesh, i) => {
          mesh.position.lerp(rig.anchors[i].position, 1 - Math.exp(-dt / .12));
          const distance = Math.abs(progress - SHOTS[i].at) / .16;
          const focus = Math.exp(-distance * distance * 4);
          const opacity = clamp(1 / (1 + distance ** 3 * 3.5));
          const size = (.86 + .14 * focus) * (innerWidth < 700 ? .63 : 1);
          mesh.scale.setScalar(size);
          mesh.quaternion.copy(camera.quaternion).multiply(localTurn.setFromAxisAngle(yAxis, SHOTS[i].panelRotation * (1 - focus)));
          mesh.material.uniforms.uFocus.value = focus;
          mesh.material.uniforms.uOpacity.value = opacity;
          projected.copy(mesh.position).project(camera);
          const cameraDistance = mesh.position.distanceTo(camera.position);
          const pixelWidth = 4.2 * size / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * cameraDistance) * innerHeight;
          return { x: (projected.x + 1) * innerWidth / 2, y: (1 - projected.y) * innerHeight / 2, width: pixelWidth, opacity: projected.z < 1 ? opacity : 0, focus, state: distance < .24 ? 'focus' : progress < SHOTS[i].at ? 'approach' : 'departure' };
        });
        renderer.render(scene, camera);
        return items;
      },
    };
  } catch (error) { dispose(); throw error; }
}
