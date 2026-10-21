(function(){
  "use strict";

  /* ---------- mobile nav ---------- */
  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');
  toggle.addEventListener('click', function(){ links.classList.toggle('open'); });
  links.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ links.classList.remove('open'); });
  });

  /* ---------- scroll progress ---------- */
  var progress = document.getElementById('progress');
  function updateProgress(){
    var h = document.documentElement;
    var scrolled = h.scrollTop;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (scrolled / max) * 100 : 0;
    progress.style.width = pct + '%';
  }

  /* ---------- reveal on scroll ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduceMotion && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); }
      });
    }, {threshold:0.15, rootMargin:'0px 0px -60px 0px'});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in-view'); });
  }

  /* ---------- tilt effect (cards) ---------- */
  if(!reduceMotion){
    document.querySelectorAll('.tilt').forEach(function(card){
      var rect;
      card.addEventListener('mousemove', function(e){
        rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'perspective(900px) rotateY(' + (x * 11) + 'deg) rotateX(' + (y * -11) + 'deg) translateZ(12px)';
      });
      card.addEventListener('mouseleave', function(){
        card.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0)';
      });
    });
  }

  /* ---------- hero tilt (follows mouse) ---------- */
  var heroTilt = document.getElementById('hero-tilt');
  if(heroTilt && !reduceMotion){
    document.querySelector('.hero').addEventListener('mousemove', function(e){
      var x = (e.clientX / window.innerWidth) - 0.5;
      var y = (e.clientY / window.innerHeight) - 0.5;
      heroTilt.style.transform = 'rotateY(' + (x * 6) + 'deg) rotateX(' + (y * -6) + 'deg)';
    });
    document.querySelector('.hero').addEventListener('mouseleave', function(){
      heroTilt.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
  }

  /* ---------- three.js background scene ---------- */
  var canvas = document.getElementById('bg-canvas');
  var scene, camera, renderer;
  var core, coreWire, shell, particles, lineMesh, stars;
  var scrollT = 0, targetScrollT = 0;
  var mouseX = 0, mouseY = 0, mouseTX = 0, mouseTY = 0;

  function hexToThree(hex){ return new THREE.Color(hex); }

  function getVar(name){
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function buildNetwork(count, radius, color, size, opacity, maxDist, lineOpacity){
    var positions = new Float32Array(count * 3);
    for(var i=0;i<count;i++){
      var phi = Math.acos(-1 + (2*i)/count);
      var theta = Math.sqrt(count * Math.PI) * phi;
      positions[i*3]   = radius * Math.cos(theta) * Math.sin(phi);
      positions[i*3+1] = radius * Math.sin(theta) * Math.sin(phi);
      positions[i*3+2] = radius * Math.cos(phi);
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var pMat = new THREE.PointsMaterial({color:color, size:size, transparent:true, opacity:opacity});
    var pts = new THREE.Points(pGeo, pMat);

    var linePositions = [];
    for(var a=0; a<count; a++){
      for(var b=a+1; b<count; b++){
        var dx = positions[a*3]-positions[b*3];
        var dy = positions[a*3+1]-positions[b*3+1];
        var dz = positions[a*3+2]-positions[b*3+2];
        var d = Math.sqrt(dx*dx+dy*dy+dz*dz);
        if(d < maxDist){
          linePositions.push(positions[a*3],positions[a*3+1],positions[a*3+2]);
          linePositions.push(positions[b*3],positions[b*3+1],positions[b*3+2]);
        }
      }
    }
    var lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    var lMat = new THREE.LineBasicMaterial({color:color, transparent:true, opacity:lineOpacity});
    var lines = new THREE.LineSegments(lGeo, lMat);

    return {points:pts, lines:lines};
  }

  function initScene(){
    if(typeof THREE === 'undefined') return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.z = 7.5;

    renderer = new THREE.WebGLRenderer({canvas:canvas, alpha:true, antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    core = new THREE.Group();
    scene.add(core);

    var accent = hexToThree(getVar('--accent') || '#e8a15c');
    var accent2 = hexToThree(getVar('--accent2') || '#5fd9c9');

    /* inner wireframe icosahedron */
    var icoGeo = new THREE.IcosahedronGeometry(2.1, 1);
    coreWire = new THREE.LineSegments(new THREE.EdgesGeometry(icoGeo), new THREE.LineBasicMaterial({color:accent, transparent:true, opacity:0.4}));
    core.add(coreWire);

    /* outer wireframe shell, counter-rotating, larger + fainter -> depth */
    var shellGeo = new THREE.IcosahedronGeometry(3.55, 1);
    shell = new THREE.LineSegments(new THREE.EdgesGeometry(shellGeo), new THREE.LineBasicMaterial({color:accent2, transparent:true, opacity:0.16}));
    core.add(shell);

    /* node network -> circuit trace look */
    var net = buildNetwork(150, 3.6, accent2, 0.05, 0.9, 1.5, 0.14);
    particles = net.points; lineMesh = net.lines;
    core.add(particles); core.add(lineMesh);

    /* distant starfield for parallax depth */
    var starCount = 260;
    var starPos = new Float32Array(starCount * 3);
    for(var s=0; s<starCount; s++){
      starPos[s*3]   = (Math.random()-0.5) * 30;
      starPos[s*3+1] = (Math.random()-0.5) * 30;
      starPos[s*3+2] = -8 - Math.random() * 14;
    }
    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    stars = new THREE.Points(starGeo, new THREE.PointsMaterial({color:0xffffff, size:0.035, transparent:true, opacity:0.35}));
    scene.add(stars);

    core.rotation.x = 0.3;
    positionCore();

    window.addEventListener('resize', onResize);
    document.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('mousemove', onMouseMove, {passive:true});
    onScroll();
    animate();
  }

  function positionCore(){
    core.position.x = window.innerWidth > 760 ? 2.3 : 0;
    core.position.y = window.innerWidth > 760 ? -0.3 : -1.8;
  }

  function onResize(){
    if(!renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    positionCore();
  }

  function onScroll(){
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    targetScrollT = max > 0 ? h.scrollTop / max : 0;
    updateProgress();
  }

  function onMouseMove(e){
    mouseTX = (e.clientX / window.innerWidth) - 0.5;
    mouseTY = (e.clientY / window.innerHeight) - 0.5;
  }

  function animate(){
    requestAnimationFrame(animate);
    if(!renderer) return;

    scrollT += (targetScrollT - scrollT) * 0.06;
    mouseX += (mouseTX - mouseX) * 0.04;
    mouseY += (mouseTY - mouseY) * 0.04;

    var baseSpeed = reduceMotion ? 0.0008 : 0.0024;
    core.rotation.y += baseSpeed + scrollT * 0.005 + mouseX * 0.01;
    core.rotation.x = 0.3 + scrollT * 0.7 + mouseY * 0.15;
    coreWire.rotation.y -= baseSpeed * 1.5;
    shell.rotation.y -= baseSpeed * 0.8;
    shell.rotation.x += baseSpeed * 0.5;
    stars.rotation.y += baseSpeed * 0.3;

    camera.position.z = 7.5 - scrollT * 2.6;
    camera.position.x = mouseX * 0.6;
    camera.position.y = -mouseY * 0.4;
    camera.lookAt(0,0,0);

    renderer.render(scene, camera);
  }

  if(window.WebGLRenderingContext){
    initScene();
  }

  /* keep progress bar accurate even before scene init */
  document.addEventListener('scroll', updateProgress, {passive:true});
  updateProgress();

})();
