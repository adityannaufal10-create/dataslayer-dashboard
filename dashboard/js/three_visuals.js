/**
 * DATA SLAYER - 3D Interactive Spatial & Cluster Engine (Three.js)
 * Provides 3D Spatial Pillar Archipelago and 3D Multidimensional Scatter Plot.
 */

const ThreeVisuals = {
    spatial: {
        scene: null,
        camera: null,
        renderer: null,
        controls: null,
        pillars: [],
        animId: null,
        raycaster: new THREE.Raycaster(),
        mouse: new THREE.Vector2(),
        hoveredObj: null,
        activeMetric: "ikp" // 'ikp' or 'gap' or 'aps'
    },
    scatter3d: {
        scene: null,
        camera: null,
        renderer: null,
        controls: null,
        spheres: [],
        animId: null,
        raycaster: new THREE.Raycaster(),
        mouse: new THREE.Vector2(),
        hoveredObj: null
    },

    // Convert Geo-coordinates (lat, lon) to 3D Plane coordinates
    geoTo3D(lat, lon, centerLat = -2.5, centerLon = 118, scale = 4.2) {
        const x = (lon - centerLon) * scale;
        const z = -(lat - centerLat) * scale * 1.05;
        return { x, z };
    },

    /**
     * Initializes the 3D Spatial Archipelago Pillars
     */
    init3DSpatial(containerId, hudId) {
        const container = document.getElementById(containerId);
        const hud = document.getElementById(hudId);
        if (!container || !window.THREE) return;

        // Cleanup existing if re-initializing
        if (this.spatial.renderer) {
            cancelAnimationFrame(this.spatial.animId);
            container.innerHTML = "";
            this.spatial.pillars = [];
        }

        const width = container.clientWidth || 600;
        const height = container.clientHeight || 380;

        // Scene
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0a0e17, 0.015);
        this.spatial.scene = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
        camera.position.set(0, 95, 115);
        this.spatial.camera = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);
        this.spatial.renderer = renderer;

        // Controls
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.maxPolarAngle = Math.PI / 2.15; // Don't flip below horizon
        controls.minDistance = 35;
        controls.maxDistance = 220;
        this.spatial.controls = controls;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
        dirLight.position.set(50, 100, 50);
        scene.add(dirLight);

        const pinkGlow = new THREE.PointLight(0xf76ca3, 1.5, 150);
        pinkGlow.position.set(0, 40, 0);
        scene.add(pinkGlow);

        // Ground Grid
        const gridHelper = new THREE.GridHelper(260, 26, 0x1e293b, 0x0f172a);
        gridHelper.position.y = -0.5;
        scene.add(gridHelper);

        // Ambient Floating Particles
        const partGeo = new THREE.BufferGeometry();
        const partCount = 180;
        const partPos = new Float32Array(partCount * 3);
        for (let i = 0; i < partCount * 3; i += 3) {
            partPos[i] = (Math.random() - 0.5) * 240;
            partPos[i + 1] = Math.random() * 60;
            partPos[i + 2] = (Math.random() - 0.5) * 240;
        }
        partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
        const partMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 1.2, transparent: true, opacity: 0.5 });
        const particles = new THREE.Points(partGeo, partMat);
        scene.add(particles);

        // Build 3D Pillars for 38 Provinces
        const provCoords = {
            "11": [4.6951, 96.7494], "12": [2.1154, 99.5451], "13": [-0.7399, 100.8000],
            "14": [0.2933, 101.7068], "15": [-1.4852, 102.4381], "16": [-3.3194, 104.9147],
            "17": [-3.5778, 102.3464], "18": [-4.5586, 105.4068], "19": [-2.7411, 106.4406],
            "21": [3.9457, 108.1429], "31": [-6.2088, 106.8456], "32": [-6.9175, 107.6191],
            "33": [-7.1510, 110.1403], "34": [-7.7956, 110.3695], "35": [-7.5361, 112.2384],
            "36": [-6.4058, 106.0640], "51": [-8.4095, 115.1889], "52": [-8.6529, 117.3616],
            "53": [-8.6574, 121.0794], "61": [-0.2787, 111.4753], "62": [-1.6815, 113.3824],
            "63": [-3.0926, 115.2838], "64": [0.5387, 116.4194], "65": [3.0731, 116.0414],
            "71": [0.6247, 123.9750], "72": [-1.4300, 121.4456], "73": [-3.6687, 119.9741],
            "74": [-4.1449, 122.1746], "75": [0.6999, 122.4467], "76": [-2.8441, 119.2321],
            "81": [-3.2385, 130.1453], "82": [1.5709, 127.8088], "91": [-1.3361, 133.1747],
            "92": [-0.8763, 131.2558], "93": [-4.2699, 138.0804], "94": [-7.4984, 139.9942],
            "95": [-3.8441, 136.5684], "96": [-4.0886, 139.1246]
        };

        window.DATA_SLAYER.provinces.forEach(prov => {
            const coords = provCoords[prov.kode];
            if (!coords) return;

            const pos = this.geoTo3D(coords[0], coords[1]);
            // Height proportional to disparity or participation
            const pillarHeight = Math.max(4, (prov.aps_16_18 - 45) * 0.65);
            
            // Color mapping: high participation = emerald, middle = blue, low/vulnerable = pink/amber
            let colHex = 0x3b82f6;
            if (prov.aps_16_18 >= 80) colHex = 0x10b981;
            else if (prov.aps_16_18 < 68) colHex = 0xf43f5e;
            else if (prov.aps_16_18 < 74) colHex = 0xf59e0b;

            // Hexagonal Pillar Geometry
            const geom = new THREE.CylinderGeometry(2.4, 2.8, pillarHeight, 6);
            geom.translate(0, pillarHeight / 2, 0); // anchor at base

            const mat = new THREE.MeshStandardMaterial({
                color: colHex,
                metalness: 0.25,
                roughness: 0.35,
                transparent: true,
                opacity: 0.92
            });

            const mesh = new THREE.Mesh(geom, mat);
            mesh.position.set(pos.x, 0, pos.z);
            mesh.userData = {
                type: "province",
                name: prov.nama,
                kode: prov.kode,
                aps_sma: prov.aps_16_18,
                rls: prov.rls,
                hls: prov.hls,
                rank: prov.peringkat,
                originalColor: colHex
            };

            scene.add(mesh);
            this.spatial.pillars.push(mesh);

            // Add base beacon ring
            const ringGeo = new THREE.RingGeometry(2.8, 3.4, 12);
            ringGeo.rotateX(-Math.PI / 2);
            const ringMat = new THREE.MeshBasicMaterial({ color: colHex, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.set(pos.x, 0.05, pos.z);
            scene.add(ring);
        });

        // Event: Mouse move for Raycast Hover HUD
        renderer.domElement.addEventListener("mousemove", (e) => {
            const rect = renderer.domElement.getBoundingClientRect();
            this.spatial.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.spatial.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            this.spatial.raycaster.setFromCamera(this.spatial.mouse, camera);
            const intersects = this.spatial.raycaster.intersectObjects(this.spatial.pillars);

            if (intersects.length > 0) {
                const hit = intersects[0].object;
                if (this.spatial.hoveredObj !== hit) {
                    if (this.spatial.hoveredObj) {
                        this.spatial.hoveredObj.material.emissive.setHex(0x000000);
                        this.spatial.hoveredObj.scale.set(1, 1, 1);
                    }
                    this.spatial.hoveredObj = hit;
                    hit.material.emissive.setHex(0xf76ca3);
                    hit.scale.set(1.15, 1.1, 1.15);

                    if (hud) {
                        hud.style.display = "block";
                        hud.innerHTML = `
                            <div style="font-size:13px; font-weight:800; color:#fff;">📍 ${hit.userData.name}</div>
                            <div style="font-size:11.5px; color:#94a3b8; margin-top:2px;">
                                • APS SMA (16-18 th): <strong style="color:#f76ca3;">${hit.userData.aps_sma}%</strong><br/>
                                • RLS: ${hit.userData.rls} th | HLS: ${hit.userData.hls} th<br/>
                                • Peringkat Nasional: #${hit.userData.rank} / 38
                            </div>
                        `;
                    }
                }
            } else {
                if (this.spatial.hoveredObj) {
                    this.spatial.hoveredObj.material.emissive.setHex(0x000000);
                    this.spatial.hoveredObj.scale.set(1, 1, 1);
                    this.spatial.hoveredObj = null;
                }
                if (hud) hud.style.display = "none";
            }
        });

        // Click to sync province with dashboard
        renderer.domElement.addEventListener("click", () => {
            if (this.spatial.hoveredObj && this.spatial.hoveredObj.userData.kode) {
                const kode = this.spatial.hoveredObj.userData.kode;
                const provSel = document.getElementById("provSelect");
                if (provSel) {
                    provSel.value = kode;
                    provSel.dispatchEvent(new Event("change"));
                }
            }
        });

        // Animation Loop
        const animate = () => {
            this.spatial.animId = requestAnimationFrame(animate);
            controls.update();
            particles.rotation.y += 0.0008;
            renderer.render(scene, camera);
        };
        animate();
    },

    /**
     * Initializes the 3D Scatter Plot for Central Java (Akses X, Capaian Y, IKP Z)
     */
    init3DScatter(containerId, hudId) {
        const container = document.getElementById(containerId);
        const hud = document.getElementById(hudId);
        if (!container || !window.THREE) return;

        if (this.scatter3d.renderer) {
            cancelAnimationFrame(this.scatter3d.animId);
            container.innerHTML = "";
            this.scatter3d.spheres = [];
        }

        const width = container.clientWidth || 550;
        const height = container.clientHeight || 330;

        const scene = new THREE.Scene();
        this.scatter3d.scene = scene;

        const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
        camera.position.set(70, 60, 80);
        this.scatter3d.camera = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        this.scatter3d.renderer = renderer;

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        this.scatter3d.controls = controls;

        // Lighting
        const amb = new THREE.AmbientLight(0xffffff, 0.85);
        scene.add(amb);
        const light = new THREE.DirectionalLight(0xffffff, 0.9);
        light.position.set(40, 80, 40);
        scene.add(light);

        // 3D Axis Box Helper (Origin at center)
        const boxGeo = new THREE.BoxGeometry(60, 40, 60);
        const edges = new THREE.EdgesGeometry(boxGeo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x334155 }));
        scene.add(line);

        // Grid Base
        const grid = new THREE.GridHelper(60, 10, 0x1e293b, 0x0f172a);
        grid.position.y = -20;
        scene.add(grid);

        // Plot 35 Central Java Regencies as 3D Orbs
        const clusterColors = {
            "Maju Merata": 0x10b981,
            "Kota Timpang": 0xf59e0b,
            "Berkembang": 0x3b82f6,
            "Tertinggal Struktural": 0xef4444
        };

        window.DATA_SLAYER.jatengRegencies.forEach(kab => {
            // Map values to 3D cube space [-25 to 25]
            const posX = ((kab.skor_akses - 75) / (98 - 75) - 0.5) * 50;
            const posY = ((kab.skor_capaian - 45) / (85 - 45) - 0.5) * 35;
            const posZ = ((kab.ikp_skor - 60) / (90 - 60) - 0.5) * 50;

            const orbCol = clusterColors[kab.tipologi] || 0x3b82f6;
            const geom = new THREE.SphereGeometry(1.8, 16, 16);
            const mat = new THREE.MeshStandardMaterial({
                color: orbCol,
                emissive: orbCol,
                emissiveIntensity: 0.15,
                metalness: 0.3,
                roughness: 0.2
            });

            const sphere = new THREE.Mesh(geom, mat);
            sphere.position.set(posX, posY, posZ);
            sphere.userData = kab;
            scene.add(sphere);
            this.scatter3d.spheres.push(sphere);

            // Connect stem line to base for 3D depth perception
            const points = [new THREE.Vector3(posX, -20, posZ), new THREE.Vector3(posX, posY, posZ)];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const stem = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.4 }));
            scene.add(stem);
        });

        // Hover raycasting
        renderer.domElement.addEventListener("mousemove", (e) => {
            const rect = renderer.domElement.getBoundingClientRect();
            this.scatter3d.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.scatter3d.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            this.scatter3d.raycaster.setFromCamera(this.scatter3d.mouse, camera);
            const intersects = this.scatter3d.raycaster.intersectObjects(this.scatter3d.spheres);

            if (intersects.length > 0) {
                const hit = intersects[0].object;
                if (this.scatter3d.hoveredObj !== hit) {
                    if (this.scatter3d.hoveredObj) {
                        this.scatter3d.hoveredObj.scale.set(1, 1, 1);
                    }
                    this.scatter3d.hoveredObj = hit;
                    hit.scale.set(1.5, 1.5, 1.5);

                    if (hud) {
                        hud.style.display = "block";
                        const d = hit.userData;
                        hud.innerHTML = `
                            <div style="font-size:12.5px; font-weight:800; color:#fff;">${d.nama}</div>
                            <div style="font-size:11px; color:#cbd5e1; margin-top:2px;">
                                • Klaster: <strong style="color:${d.cluster_color};">${d.tipologi}</strong><br/>
                                • Akses (X): ${d.skor_akses.toFixed(1)} | Capaian (Y): ${d.skor_capaian.toFixed(1)}<br/>
                                • IKP Skor (Z): ${d.ikp_skor} (Rank #${d.peringkat_jateng})
                            </div>
                        `;
                    }
                }
            } else {
                if (this.scatter3d.hoveredObj) {
                    this.scatter3d.hoveredObj.scale.set(1, 1, 1);
                    this.scatter3d.hoveredObj = null;
                }
                if (hud) hud.style.display = "none";
            }
        });

        const animate = () => {
            this.scatter3d.animId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();
    },

    resize() {
        if (this.spatial.renderer && this.spatial.camera) {
            const cont = this.spatial.renderer.domElement.parentElement;
            if (cont) {
                this.spatial.camera.aspect = cont.clientWidth / cont.clientHeight;
                this.spatial.camera.updateProjectionMatrix();
                this.spatial.renderer.setSize(cont.clientWidth, cont.clientHeight);
            }
        }
        if (this.scatter3d.renderer && this.scatter3d.camera) {
            const cont = this.scatter3d.renderer.domElement.parentElement;
            if (cont) {
                this.scatter3d.camera.aspect = cont.clientWidth / cont.clientHeight;
                this.scatter3d.camera.updateProjectionMatrix();
                this.scatter3d.renderer.setSize(cont.clientWidth, cont.clientHeight);
            }
        }
    }
};

window.ThreeVisuals = ThreeVisuals;
