/**
 * DATA SLAYER - Dashboard Controller & Application Logic
 * Coordinates UI events, reactive rendering, Chart.js, and Leaflet Maps.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Application State
    const state = {
        activePage: "page1",
        simUplift: 0,
        activeMapLayer: "aps",
        selectedProfile: {
            provinsiKode: "33", // Default Jawa Tengah
            daerah: "Perdesaan",
            kuintil: "Q1",
            gender: "Laki-laki"
        },
        benchmarkProfile: {
            provinsiKode: "33",
            daerah: "Perkotaan",
            kuintil: "Q5",
            gender: "Laki-laki"
        },
        selectedKabJateng: "Kabupaten Brebes",
        charts: {},
        map: null,
        mapMarkers: []
    };

    // UI Element References
    const elements = {
        navPage1: document.getElementById("navPage1"),
        navPage2: document.getElementById("navPage2"),
        page1View: document.getElementById("page1View"),
        page2View: document.getElementById("page2View"),
        
        // Page 1 Controls
        provSelect: document.getElementById("provSelect"),
        kuintilSelect: document.getElementById("kuintilSelect"),
        segUrban: document.getElementById("segUrban"),
        segRural: document.getElementById("segRural"),
        segMale: document.getElementById("segMale"),
        segFemale: document.getElementById("segFemale"),
        
        // Page 1 KPI
        kpiSmaProb: document.getElementById("kpiSmaProb"),
        kpiSmaBadge: document.getElementById("kpiSmaBadge"),
        kpiOppGap: document.getElementById("kpiOppGap"),
        kpiOppGapBadge: document.getElementById("kpiOppGapBadge"),
        kpiObstacle: document.getElementById("kpiObstacle"),
        kpiObstacleDesc: document.getElementById("kpiObstacleDesc"),
        kpiProvRank: document.getElementById("kpiProvRank"),
        kpiProvRankDesc: document.getElementById("kpiProvRankDesc"),
        
        // Page 1 Funnel & Waffle
        funnelContainer: document.getElementById("funnelBars"),
        waffleGrid: document.getElementById("waffleGrid"),
        waffleNarrative: document.getElementById("waffleNarrative"),
        benchmarkInfoBox: document.getElementById("benchmarkInfoBox"),
        
        // Page 2 Controls & Displays
        p2ProvFilter: document.getElementById("p2ProvFilter"),
        p2SyncNotice: document.getElementById("p2SyncNotice"),
        kabSelectJateng: document.getElementById("kabSelectJateng"),
        kabInfoBox: document.getElementById("kabInfoBox"),
        theilInsightText: document.getElementById("theilInsightText"),
        
        // Modal
        btnToggleWatermark: document.getElementById("btnToggleWatermark"),
        txtToggleWatermark: document.getElementById("txtToggleWatermark"),
        simSlider: document.getElementById("simSlider"),
        simValPill: document.getElementById("simValPill"),
        simUpliftText: document.getElementById("simUpliftText"),
        btnView2D: document.getElementById("btnView2D"),
        btnView3D: document.getElementById("btnView3D"),
        btnScatter2D: document.getElementById("btnScatter2D"),
        btnScatter3D: document.getElementById("btnScatter3D"),
        mapSearchInput: document.getElementById("mapSearchInput"),
        regionList: document.getElementById("regionList"),
        threeMapContainer: document.getElementById("threeMapContainer"),
        scatter2DContainer: document.getElementById("scatter2DContainer"),
        scatter3DContainer: document.getElementById("scatter3DContainer"),
        dsWatermarkOverlay: document.getElementById("dsWatermarkOverlay"),
        btnMetodologi: document.getElementById("btnMetodologi"),
        btnDisclModal: document.getElementById("btnDisclModal"),
        modalOverlay: document.getElementById("modalOverlay"),
        modalClose: document.getElementById("modalClose"),
        btnPrintPdf: document.getElementById("btnPrintPdf")
    };

    // Coordinates mapping for Indonesian Provinces
    const PROVINCE_COORDS = {
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

    // Central Java Regency coords
    const JATENG_COORDS = {
        "Kabupaten Cilacap": [-7.7028, 108.9959], "Kabupaten Banyumas": [-7.4558, 109.1685],
        "Kabupaten Purbalingga": [-7.3879, 109.3629], "Kabupaten Banjarnegara": [-7.3995, 109.6974],
        "Kabupaten Kebumen": [-7.6699, 109.6521], "Kabupaten Purworejo": [-7.7144, 110.0074],
        "Kabupaten Wonosobo": [-7.3592, 109.9079], "Kabupaten Magelang": [-7.5458, 110.2194],
        "Kabupaten Boyolali": [-7.5303, 110.5960], "Kabupaten Klaten": [-7.7032, 110.6041],
        "Kabupaten Sukoharjo": [-7.6833, 110.8359], "Kabupaten Wonogiri": [-7.8139, 110.9252],
        "Kabupaten Karanganyar": [-7.5961, 110.9525], "Kabupaten Sragen": [-7.4269, 111.0219],
        "Kabupaten Grobogan": [-7.1128, 110.9168], "Kabupaten Blora": [-7.0264, 111.4172],
        "Kabupaten Rembang": [-6.7112, 111.3414], "Kabupaten Pati": [-6.7554, 111.0378],
        "Kabupaten Kudus": [-6.8048, 110.8405], "Kabupaten Jepara": [-6.5891, 110.6778],
        "Kabupaten Demak": [-6.8944, 110.6386], "Kabupaten Semarang": [-7.2186, 110.4344],
        "Kabupaten Temanggung": [-7.3167, 110.1772], "Kabupaten Kendal": [-7.0186, 110.2036],
        "Kabupaten Batang": [-7.0234, 109.8736], "Kabupaten Pekalongan": [-7.0392, 109.6384],
        "Kabupaten Pemalang": [-7.0247, 109.3814], "Kabupaten Tegal": [-7.0094, 109.1502],
        "Kabupaten Brebes": [-6.8703, 109.0433], "Kota Magelang": [-7.4706, 110.2178],
        "Kota Surakarta": [-7.5693, 110.8250], "Kota Salatiga": [-7.3305, 110.5084],
        "Kota Semarang": [-6.9932, 110.4203], "Kota Pekalongan": [-6.8886, 109.6753],
        "Kota Tegal": [-6.8694, 109.1256]
    };

    // ==========================================
    // INITIALIZATION
    // ==========================================
    function init() {
        populateProvinceDropdowns();
        populateKabupatenDropdown();
        populateRegionDatalist();
        setupEventListeners();
        renderAll();
        initPage2Charts();
        initMap();
    }

    // Populate Provinces
        function populateRegionDatalist() {
        if (!elements.regionList) return;
        elements.regionList.innerHTML = "";
        window.DATA_SLAYER.provinces.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.nama;
            opt.label = `Provinsi (Rank #${p.peringkat})`;
            elements.regionList.appendChild(opt);
        });
        window.DATA_SLAYER.jatengRegencies.forEach(k => {
            const opt = document.createElement("option");
            opt.value = k.nama;
            opt.label = `Jateng: ${k.tipologi}`;
            elements.regionList.appendChild(opt);
        });
    }

    function populateProvinceDropdowns() {
        elements.provSelect.innerHTML = "";
        elements.p2ProvFilter.innerHTML = "";

        window.DATA_SLAYER.provinces.forEach(prov => {
            const opt1 = new Option(`${prov.nama} (Rank #${prov.peringkat})`, prov.kode);
            const opt2 = new Option(`${prov.nama} (Rank #${prov.peringkat})`, prov.kode);
            if (prov.kode === state.selectedProfile.provinsiKode) {
                opt1.selected = true;
                opt2.selected = true;
            }
            elements.provSelect.add(opt1);
            elements.p2ProvFilter.add(opt2);
        });
    }

    // Populate Central Java Regencies
    function populateKabupatenDropdown() {
        elements.kabSelectJateng.innerHTML = "";
        window.DATA_SLAYER.jatengRegencies.forEach(kab => {
            const opt = new Option(`${kab.nama} [${kab.tipologi}]`, kab.nama);
            if (kab.nama === state.selectedKabJateng) {
                opt.selected = true;
            }
            elements.kabSelectJateng.add(opt);
        });
    }

    // Event Listeners
    function setupEventListeners() {
        // Navigation Tabs
        elements.navPage1.addEventListener("click", () => switchPage("page1"));
        elements.navPage2.addEventListener("click", () => switchPage("page2"));

        // Page 1 Inputs
        elements.provSelect.addEventListener("change", (e) => {
            updateProvinceSelection(e.target.value);
        });

        elements.kuintilSelect.addEventListener("change", (e) => {
            state.selectedProfile.kuintil = e.target.value;
            renderAll();
        });

        elements.segUrban.addEventListener("click", () => {
            state.selectedProfile.daerah = "Perkotaan";
            elements.segUrban.classList.add("active");
            elements.segRural.classList.remove("active");
            renderAll();
        });

        elements.segRural.addEventListener("click", () => {
            state.selectedProfile.daerah = "Perdesaan";
            elements.segRural.classList.add("active");
            elements.segUrban.classList.remove("active");
            renderAll();
        });

        elements.segMale.addEventListener("click", () => {
            state.selectedProfile.gender = "Laki-laki";
            state.benchmarkProfile.gender = "Laki-laki";
            elements.segMale.classList.add("active");
            elements.segFemale.classList.remove("active");
            renderAll();
        });

        elements.segFemale.addEventListener("click", () => {
            state.selectedProfile.gender = "Perempuan";
            state.benchmarkProfile.gender = "Perempuan";
            elements.segFemale.classList.add("active");
            elements.segMale.classList.remove("active");
            renderAll();
        });

        // Page 2 Filters
        elements.p2ProvFilter.addEventListener("change", (e) => {
            updateProvinceSelection(e.target.value);
        });

        elements.kabSelectJateng.addEventListener("change", (e) => {
            state.selectedKabJateng = e.target.value;
            renderKabupatenDetail();
            highlightKabupatenInScatter();
            if (state.map && JATENG_COORDS[state.selectedKabJateng]) {
                state.map.setView(JATENG_COORDS[state.selectedKabJateng], 10);
            }
        });

        // Modals & PDF
        elements.btnMetodologi.addEventListener("click", openModal);
        elements.btnDisclModal.addEventListener("click", openModal);
        elements.modalClose.addEventListener("click", closeModal);
        elements.modalOverlay.addEventListener("click", (e) => {
            if (e.target === elements.modalOverlay) closeModal();
        });

        elements.btnPrintPdf.addEventListener("click", () => {
            window.print();
        });

        // Watermark Mode Toggle (Jelas 72% -> Halus 28% -> Nonaktif 0%)
        let watermarkModes = [
            { name: "Bingkai: Jelas", cls: "" },
            { name: "Bingkai: Halus", cls: "soft" },
            { name: "Bingkai: Nonaktif", cls: "off" }
        ];
        let currentWatermarkIdx = 0;

        if (elements.btnToggleWatermark && elements.dsWatermarkOverlay) {
            elements.btnToggleWatermark.addEventListener("click", () => {
                currentWatermarkIdx = (currentWatermarkIdx + 1) % watermarkModes.length;
                const m = watermarkModes[currentWatermarkIdx];
                elements.dsWatermarkOverlay.className = "ds-watermark-overlay-img " + m.cls;
                elements.txtToggleWatermark.innerText = m.name;
            });
        }

        // Simulation Slider (Intervensi Bantuan PIP / Beasiswa)
        if (elements.simSlider) {
            elements.simSlider.addEventListener("input", (e) => {
                const val = parseInt(e.target.value, 10);
                elements.simValPill.innerText = "Rp " + val.toLocaleString("id-ID") + " / tahun";
                // Max bonus +14.5 pp when receiving max scholarship
                const uplift = parseFloat(((val / 1800000) * 14.5).toFixed(1));
                state.simUplift = uplift;
                elements.simUpliftText.innerText = (uplift > 0 ? "+" + uplift : "+0") + " pp Peluang Tamat";
                renderAll();
            });
        }

        // Map View Mode Toggle (2D Leaflet vs 3D Three.js Pillars)
        if (elements.btnView2D && elements.btnView3D) {
            elements.btnView2D.addEventListener("click", () => {
                elements.btnView2D.classList.add("active");
                elements.btnView3D.classList.remove("active");
                document.getElementById("mapProvinsi").style.display = "block";
                elements.threeMapContainer.style.display = "none";
                if (state.map) state.map.invalidateSize();
            });

            elements.btnView3D.addEventListener("click", () => {
                elements.btnView3D.classList.add("active");
                elements.btnView2D.classList.remove("active");
                document.getElementById("mapProvinsi").style.display = "none";
                elements.threeMapContainer.style.display = "block";
                if (window.ThreeVisuals) {
                    ThreeVisuals.init3DSpatial("threeMapContainer", "threeMapHud");
                }
            });
        }

        // Scatter View Mode Toggle (2D Chart.js vs 3D Three.js Cube)
        if (elements.btnScatter2D && elements.btnScatter3D) {
            elements.btnScatter2D.addEventListener("click", () => {
                elements.btnScatter2D.classList.add("active");
                elements.btnScatter3D.classList.remove("active");
                elements.scatter2DContainer.style.display = "block";
                elements.scatter3DContainer.style.display = "none";
                if (state.charts.scatter) state.charts.scatter.resize();
            });

            elements.btnScatter3D.addEventListener("click", () => {
                elements.btnScatter3D.classList.add("active");
                elements.btnScatter2D.classList.remove("active");
                elements.scatter2DContainer.style.display = "none";
                elements.scatter3DContainer.style.display = "block";
                if (window.ThreeVisuals) {
                    ThreeVisuals.init3DScatter("scatter3DContainer", "threeScatterHud");
                }
            });
        }

        // Map Search & Autocomplete
        if (elements.mapSearchInput) {
            elements.mapSearchInput.addEventListener("change", (e) => {
                const query = e.target.value.trim().toLowerCase();
                if (!query) return;

                // Search provinces
                const foundProv = window.DATA_SLAYER.provinces.find(p => p.nama.toLowerCase().includes(query));
                if (foundProv && state.map && PROVINCE_COORDS[foundProv.kode]) {
                    updateProvinceSelection(foundProv.kode);
                    state.map.flyTo(PROVINCE_COORDS[foundProv.kode], 7, { duration: 1.2 });
                    return;
                }

                // Search Central Java Regencies
                const foundKab = window.DATA_SLAYER.jatengRegencies.find(k => k.nama.toLowerCase().includes(query));
                if (foundKab && state.map && JATENG_COORDS[foundKab.nama]) {
                    state.selectedKabJateng = foundKab.nama;
                    elements.kabSelectJateng.value = foundKab.nama;
                    renderKabupatenDetail();
                    highlightKabupatenInScatter();
                    state.map.flyTo(JATENG_COORDS[foundKab.nama], 10, { duration: 1.2 });
                }
            });
        }

        // Map Thematic Layer Selector Buttons
        document.querySelectorAll(".map-layer-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                document.querySelectorAll(".map-layer-btn").forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");
                state.activeMapLayer = e.target.getAttribute("data-layer");
                updateMapThematicLayer();
            });
        });
    }

    function updateProvinceSelection(kode) {
        state.selectedProfile.provinsiKode = kode;
        state.benchmarkProfile.provinsiKode = kode;
        elements.provSelect.value = kode;
        elements.p2ProvFilter.value = kode;
        renderAll();
        focusProvinceOnMap(kode);
    }

    // Switch Navigation Tabs
    function switchPage(pageKey) {
        state.activePage = pageKey;
        if (pageKey === "page1") {
            elements.navPage1.classList.add("active");
            elements.navPage2.classList.remove("active");
            elements.page1View.classList.add("active");
            elements.page2View.classList.remove("active");
        } else {
            elements.navPage2.classList.add("active");
            elements.navPage1.classList.remove("active");
            elements.page2View.classList.add("active");
            elements.page1View.classList.remove("active");
            setTimeout(() => {
                if (state.charts.scatter) state.charts.scatter.resize();
                if (state.charts.theil) state.charts.theil.resize();
                if (state.charts.theilTrend) state.charts.theilTrend.resize();
                if (state.charts.gapDrivers) state.charts.gapDrivers.resize();
                if (state.map) state.map.invalidateSize();
            }, 100);
        }
    }

    function openModal() {
        elements.modalOverlay.classList.add("active");
    }

    function closeModal() {
        elements.modalOverlay.classList.remove("active");
    }

    // ==========================================
    // RENDER CONTROLLERS
    // ==========================================
    function renderAll() {
        const selectedResults = ModelEngine.calculateProfileProbabilities(state.selectedProfile);
        const benchmarkResults = ModelEngine.calculateProfileProbabilities(state.benchmarkProfile);
        const gapAnalysis = ModelEngine.calculateOpportunityGap(selectedResults, benchmarkResults);

        // Apply Simulation Uplift to selected results if active
        if (state.simUplift > 0) {
            const rawSma = selectedResults.stages.SMA.probability;
            selectedResults.stages.SMA.probability = Math.min(100.0, parseFloat((rawSma + state.simUplift).toFixed(2)));
            const rawPt = selectedResults.stages.PT.probability;
            selectedResults.stages.PT.probability = Math.min(100.0, parseFloat((rawPt + (state.simUplift * 0.6)).toFixed(2)));
            // Recalculate gap
            gapAnalysis.smaProbSelected = selectedResults.stages.SMA.probability;
            gapAnalysis.smaGap = parseFloat((benchmarkResults.stages.SMA.probability - gapAnalysis.smaProbSelected).toFixed(2));
            gapAnalysis.gaps.SMA.selected = selectedResults.stages.SMA.probability;
            gapAnalysis.gaps.SMA.gap = gapAnalysis.smaGap;
        }

        renderKPIs(selectedResults, benchmarkResults, gapAnalysis);
        renderFunnel(selectedResults, benchmarkResults, gapAnalysis);
        renderWaffle(selectedResults, benchmarkResults);
        renderBenchmarkCard();
        renderKabupatenDetail();
        updatePage2SyncBanner();
    }

    // 1. Render Top KPI Cards
    function renderKPIs(selected, benchmark, gap) {
        const smaP = selected.stages.SMA.probability;
        const bmkP = benchmark.stages.SMA.probability;
        const prov = selected.province;

        elements.kpiSmaProb.innerText = `${smaP}%`;
        if (smaP < 60) {
            elements.kpiSmaBadge.className = "kpi-badge danger";
            elements.kpiSmaBadge.innerText = "Rendah (<60%)";
        } else if (smaP < 80) {
            elements.kpiSmaBadge.className = "kpi-badge warning";
            elements.kpiSmaBadge.innerText = "Moderat";
        } else {
            elements.kpiSmaBadge.className = "kpi-badge success";
            elements.kpiSmaBadge.innerText = "Tinggi";
        }

        elements.kpiOppGap.innerText = `${gap.smaGap} pp`;
        elements.kpiOppGapBadge.innerText = `vs ${bmkP}% (Acuan)`;

        elements.kpiObstacle.innerText = gap.largestObstacle;
        elements.kpiObstacleDesc.innerText = gap.obstacleDesc;

        elements.kpiProvRank.innerText = `#${prov.peringkat} / 38`;
        elements.kpiProvRankDesc.innerText = `Prov. ${prov.nama} (HLS: ${prov.hls} th, RLS: ${prov.rls} th)`;
    }

    // 2. Render Funnel "Tangga yang Bocor"
    function renderFunnel(selected, benchmark, gap) {
        const stages = [
            { key: "SD", label: "SD / MI Sederajat", sub: "Usia 7-12 Tahun" },
            { key: "SMP", label: "SMP / MTs Sederajat", sub: "Usia 13-15 Tahun" },
            { key: "SMA", label: "SMA / SMK / MA", sub: "Usia 16-18 Tahun (Fokus Kebocoran)" },
            { key: "PT", label: "Perguruan Tinggi", sub: "Usia 19-24 Tahun (Kesenjangan Ekstrem)" }
        ];

        let html = "";
        stages.forEach(stg => {
            const pSel = selected.stages[stg.key].probability;
            const pBmk = benchmark.stages[stg.key].probability;
            const stageGap = gap.gaps[stg.key].gap;

            html += `
                <div class="funnel-stage-row">
                    <div class="stage-label-box">
                        <span class="stage-name">${stg.label}</span>
                        <span class="stage-sub">${stg.sub}</span>
                    </div>
                    <div class="stage-bars">
                        <div class="bar-wrapper">
                            <div class="bar-track">
                                <div class="bar-fill selected" style="width: ${pSel}%">
                                    ${pSel >= 25 ? pSel + '%' : ''}
                                </div>
                            </div>
                            <span class="bar-val-label pink">${pSel}%</span>
                        </div>
                        <div class="bar-wrapper">
                            <div class="bar-track">
                                <div class="bar-fill benchmark" style="width: ${pBmk}%">
                                    ${pBmk >= 25 ? pBmk + '%' : ''}
                                </div>
                            </div>
                            <span class="bar-val-label blue">${pBmk}%</span>
                        </div>
                    </div>
                    <div class="stage-gap-box">
                        <div class="stage-gap-val">-${stageGap} pp</div>
                        <div class="stage-gap-lbl">Opportunity Gap</div>
                    </div>
                </div>
            `;
        });

        elements.funnelContainer.innerHTML = html;
    }

    // 3. Render 100 Person Icons (Waffle Chart)
    function renderWaffle(selected, benchmark) {
        const smaSelCount = Math.round(selected.stages.SMA.probability);
        const smaBmkCount = Math.round(benchmark.stages.SMA.probability);

        elements.waffleNarrative.innerHTML = `
            Dari <strong>100 anak</strong> dengan profil terpilih ini, diperkirakan hanya sekitar 
            <strong class="pink-text">${smaSelCount} anak</strong> yang berhasil menamatkan jenjang SMA/SMK sederajat, 
            berbanding <strong class="blue-text">${smaBmkCount} anak</strong> pada profil pembanding optimal kuintil 5 perkotaan.
        `;

        let iconsHtml = "";
        const personSvg = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 10c-4.42 0-8 2.24-8 5v3h16v-3c0-2.76-3.58-5-8-5z"/>
            </svg>
        `;

        for (let i = 1; i <= 100; i++) {
            let stateClass = "inactive";
            let tooltip = `Anak #${i}: Tidak Tamat SMA`;

            if (i <= smaSelCount) {
                stateClass = "active";
                tooltip = `Anak #${i}: Lulus SMA (Profil Terpilih)`;
            } else if (i <= smaBmkCount) {
                stateClass = "benchmark-marker";
                tooltip = `Anak #${i}: Lulus SMA pada Profil Acuan (Opportunity Gap)`;
            }

            iconsHtml += `
                <div class="waffle-icon ${stateClass}" title="${tooltip}">
                    ${personSvg}
                </div>
            `;
        }

        elements.waffleGrid.innerHTML = iconsHtml;
    }

    // 4. Benchmark Card
    function renderBenchmarkCard() {
        const prov = window.DATA_SLAYER.provinces.find(p => p.kode === state.selectedProfile.provinsiKode) || { nama: "Jawa Tengah" };
        elements.benchmarkInfoBox.innerHTML = `
            <div class="benchmark-title">
                <span>🎯 Profil Pembanding Otomatis</span>
            </div>
            <div class="benchmark-desc">
                Anak dari <strong>Kuintil 5 (Teratas 20%)</strong>, bertempat tinggal di wilayah <strong>Perkotaan</strong>, 
                Provinsi <strong>${prov.nama}</strong>.
            </div>
            <span class="benchmark-badge">Baseline Optimal Lokal</span>
        `;
    }

    function updatePage2SyncBanner() {
        const prov = window.DATA_SLAYER.provinces.find(p => p.kode === state.selectedProfile.provinsiKode) || { nama: "Jawa Tengah" };
        elements.p2SyncNotice.innerText = `Sinkronisasi Aktif: Provinsi ${prov.nama}`;
    }

    // 5. Regency Detail (Central Java Context)
    function renderKabupatenDetail() {
        const kab = window.DATA_SLAYER.jatengRegencies.find(k => k.nama === state.selectedKabJateng) || window.DATA_SLAYER.jatengRegencies[0];
        
        elements.kabInfoBox.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h4 style="font-size:14px; font-weight:700; color:#fff;">${kab.nama}</h4>
                <span class="cluster-pill" style="border-color:${kab.cluster_color}; color:${kab.cluster_color}; background:rgba(255,255,255,0.05);">
                    ${kab.tipologi}
                </span>
            </div>
            <div style="font-size:12px; color:#cbd5e1; line-height:1.6;">
                <p>• <strong>Indeks Kesenjangan Pendidikan (IKP):</strong> <span style="color:#f472b6; font-weight:700;">${kab.ikp_skor}</span> (Peringkat #${kab.peringkat_jateng} di Jateng)</p>
                <p>• <strong>Partisipasi SMA (APS 16-18):</strong> ${kab.aps_16_18}% | <strong>Partisipasi SMP (13-15):</strong> ${kab.aps_13_15}%</p>
                <p>• <strong>Rata-rata Lama Sekolah (RLS):</strong> ${kab.rls} tahun | <strong>Harapan Lama Sekolah:</strong> ${kab.hls} tahun</p>
                <p style="margin-top:6px; font-size:11px; color:#94a3b8; font-style:italic;">"${kab.cluster_desc}"</p>
            </div>
        `;
    }

    function highlightKabupatenInScatter() {
        if (!state.charts.scatter) return;
        state.charts.scatter.update();
    }

    // ==========================================
    // MAP INTEGRATION (Leaflet)
    // ==========================================
        // Update Map Styling Dynamically based on active thematic layer
    function updateMapThematicLayer() {
        if (!state.map || !state.mapMarkers) return;

        state.mapMarkers.forEach(item => {
            const prov = window.DATA_SLAYER.provinces.find(p => p.kode === item.kode);
            if (!prov) return;

            let color = "#3b82f6";
            let radius = 7;

            if (state.activeMapLayer === "aps") {
                if (prov.aps_16_18 >= 80) color = "#10b981";
                else if (prov.aps_16_18 >= 72) color = "#3b82f6";
                else if (prov.aps_16_18 >= 65) color = "#f59e0b";
                else color = "#f43f5e";
                radius = Math.max(6, (prov.aps_16_18 - 50) * 0.25);
            } else if (state.activeMapLayer === "ikp") {
                // Higher rank = greener
                if (prov.peringkat <= 10) color = "#10b981";
                else if (prov.peringkat <= 25) color = "#38bdf8";
                else color = "#f43f5e";
                radius = 7.5;
            } else if (state.activeMapLayer === "hls") {
                if (prov.hls >= 14) color = "#10b981";
                else if (prov.hls >= 13) color = "#38bdf8";
                else color = "#f59e0b";
                radius = (prov.hls - 8) * 1.2;
            } else if (state.activeMapLayer === "klaster") {
                color = prov.peringkat <= 8 ? "#10b981" : prov.peringkat <= 22 ? "#3b82f6" : "#f43f5e";
                radius = 8;
            }

            const isSel = prov.kode === state.selectedProfile.provinsiKode;
            item.marker.setStyle({
                fillColor: isSel ? "#f76ca3" : color,
                color: isSel ? "#fff" : color,
                radius: isSel ? radius + 4 : radius,
                weight: isSel ? 2.5 : 1
            });
        });
    }

    function initMap() {
        const mapContainer = document.getElementById("mapProvinsi");
        if (!mapContainer || typeof L === "undefined") return;

        state.map = L.map("mapProvinsi", {
            center: [-2.5, 118],
            zoom: 5,
            zoomControl: true,
            attributionControl: false
        });

        // Dark theme map tiles
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            maxZoom: 18,
            subdomains: "abcd"
        }).addTo(state.map);

        // Plot 38 Provinces as interactive circles
        window.DATA_SLAYER.provinces.forEach(prov => {
            const coords = PROVINCE_COORDS[prov.kode];
            if (!coords) return;

            const isSelected = prov.kode === state.selectedProfile.provinsiKode;
            const circleColor = isSelected ? "#f43f5e" : (prov.aps_16_18 > 78 ? "#10b981" : prov.aps_16_18 > 70 ? "#3b82f6" : "#f59e0b");

            const marker = L.circleMarker(coords, {
                radius: isSelected ? 11 : 7,
                fillColor: circleColor,
                color: isSelected ? "#fff" : circleColor,
                weight: isSelected ? 2.5 : 1,
                opacity: 1,
                fillOpacity: 0.85
            }).addTo(state.map);

            marker.bindTooltip(`<b>${prov.nama}</b><br/>Rank Nasional: #${prov.peringkat}<br/>APS SMA (16-18): ${prov.aps_16_18}%<br/>RLS: ${prov.rls} th`, {
                direction: "top"
            });

            marker.on("click", () => {
                updateProvinceSelection(prov.kode);
            });

            state.mapMarkers.push({ kode: prov.kode, marker: marker });
        });

        // Plot Central Java Regencies as finer dots
        window.DATA_SLAYER.jatengRegencies.forEach(kab => {
            const coords = JATENG_COORDS[kab.nama];
            if (!coords) return;

            const jatengMarker = L.circleMarker(coords, {
                radius: 4.5,
                fillColor: kab.cluster_color,
                color: "#1e293b",
                weight: 1,
                opacity: 0.9,
                fillOpacity: 0.9
            }).addTo(state.map);

            jatengMarker.bindTooltip(`<b>${kab.nama}</b><br/>Klaster: ${kab.tipologi}<br/>IKP: ${kab.ikp_skor}<br/>APS SMA: ${kab.aps_16_18}%`, {
                direction: "top"
            });

            jatengMarker.on("click", () => {
                elements.kabSelectJateng.value = kab.nama;
                state.selectedKabJateng = kab.nama;
                renderKabupatenDetail();
                highlightKabupatenInScatter();
            });
        });
    }

    function focusProvinceOnMap(kode) {
        if (!state.map) return;
        const coords = PROVINCE_COORDS[kode];
        if (coords) {
            state.map.flyTo(coords, kode === "33" ? 8 : 6, { duration: 1 });
        }
        state.mapMarkers.forEach(m => {
            if (m.kode === kode) {
                m.marker.setStyle({ radius: 11, color: "#fff", weight: 2.5, fillColor: "#f43f5e" });
            } else {
                m.marker.setStyle({ radius: 7, color: "#3b82f6", weight: 1, fillColor: "#3b82f6" });
            }
        });
    }

    // ==========================================
    // PAGE 2 CHARTS INITIALIZATION (Chart.js)
    // ==========================================
    function initPage2Charts() {
        initScatterChart();
        initTheilDonutChart();
        initTheilTrendChart();
        initGapDriversChart();
    }

    // 1. Scatter Plot: Akses vs Capaian (K-Means k=4)
    function initScatterChart() {
        const ctx = document.getElementById("scatterChart").getContext("2d");
        
        const clusters = {
            "Maju Merata": { color: "#10b981", data: [] },
            "Kota Timpang": { color: "#f59e0b", data: [] },
            "Berkembang": { color: "#3b82f6", data: [] },
            "Tertinggal Struktural": { color: "#ef4444", data: [] }
        };

        window.DATA_SLAYER.jatengRegencies.forEach(kab => {
            if (clusters[kab.tipologi]) {
                clusters[kab.tipologi].data.push({
                    x: kab.skor_akses,
                    y: kab.skor_capaian,
                    raw: kab
                });
            }
        });

        const datasets = Object.keys(clusters).map(tipologi => ({
            label: tipologi,
            data: clusters[tipologi].data,
            backgroundColor: clusters[tipologi].color,
            borderColor: clusters[tipologi].color,
            pointRadius: 6,
            pointHoverRadius: 9,
            pointBorderWidth: 1
        }));

        state.charts.scatter = new Chart(ctx, {
            type: "scatter",
            data: { datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "top",
                        labels: { color: "#94a3b8", font: { size: 11, family: "Inter" } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) {
                                const r = ctx.raw.raw;
                                return [
                                    `${r.nama} [${r.tipologi}]`,
                                    `Akses (APS Komposit): ${r.skor_akses.toFixed(1)}`,
                                    `Capaian (RLS/HLS): ${r.skor_capaian.toFixed(1)}`,
                                    `IKP Skor: ${r.ikp_skor} (Rank #${r.peringkat_jateng})`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: "Dimensi Akses (APS Gabungan 7-18 th)", color: "#94a3b8", font: { size: 11 } },
                        grid: { color: "#1e293b" },
                        ticks: { color: "#94a3b8" }
                    },
                    y: {
                        title: { display: true, text: "Dimensi Capaian (Standar RLS & HLS)", color: "#94a3b8", font: { size: 11 } },
                        grid: { color: "#1e293b" },
                        ticks: { color: "#94a3b8" }
                    }
                }
            }
        });
    }

    // 2. Theil Decomposition Donut Chart
    function initTheilDonutChart() {
        const ctx = document.getElementById("theilDonutChart").getContext("2d");
        const theil = window.DATA_SLAYER.theil;

        state.charts.theil = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: [
                    `Dalam Provinsi (Within: ${theil.pct_within}%)`,
                    `Antar Provinsi (Between: ${theil.pct_between}%)`
                ],
                datasets: [{
                    data: [theil.theil_within, theil.theil_between],
                    backgroundColor: ["#f76ca3", "#3b82f6"],
                    borderColor: "#1e293b",
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { color: "#94a3b8", font: { size: 11 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: (c) => ` ${c.label}: Nilai Indeks ${c.raw}`
                        }
                    }
                },
                cutout: "65%"
            }
        });
    }

    // 3. Theil Historical Trend Line Chart
    function initTheilTrendChart() {
        const ctx = document.getElementById("theilTrendChart").getContext("2d");
        const hist = window.DATA_SLAYER.theil.historical_trends;

        state.charts.theilTrend = new Chart(ctx, {
            type: "line",
            data: {
                labels: hist.map(h => h.tahun),
                datasets: [
                    {
                        label: "Dalam Provinsi (Within)",
                        data: hist.map(h => h.within),
                        borderColor: "#f76ca3",
                        backgroundColor: "rgba(247, 108, 163, 0.1)",
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: "Antar Provinsi (Between)",
                        data: hist.map(h => h.between),
                        borderColor: "#3b82f6",
                        borderDash: [5, 5],
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "top", labels: { color: "#94a3b8", font: { size: 10 } } }
                },
                scales: {
                    x: { grid: { color: "#1e293b" }, ticks: { color: "#94a3b8" } },
                    y: { grid: { color: "#1e293b" }, ticks: { color: "#94a3b8" }, title: { display: true, text: "Theil T Index", color: "#64748b" } }
                }
            }
        });
    }

    // 4. Gap Driver Contributions Bar Chart
    function initGapDriversChart() {
        const ctx = document.getElementById("gapDriversChart").getContext("2d");
        const drivers = window.DATA_SLAYER.theil.penyebab_gap_kontribusi;

        state.charts.gapDrivers = new Chart(ctx, {
            type: "bar",
            data: {
                labels: drivers.map(d => d.faktor),
                datasets: [{
                    label: "Kontribusi terhadap Opportunity Gap (%)",
                    data: drivers.map(d => d.kontribusi_persen),
                    backgroundColor: [
                        "#f76ca3", // Ekonomi
                        "#3b82f6", // Wilayah Spasial
                        "#f59e0b", // Desa/Kota
                        "#8b5cf6"  // Gender
                    ],
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            afterLabel: (c) => `Keterangan: ${drivers[c.dataIndex].keterangan}`
                        }
                    }
                },
                scales: {
                    x: {
                        max: 60,
                        ticks: { callback: (v) => v + "%", color: "#94a3b8" },
                        grid: { color: "#1e293b" }
                    },
                    y: {
                        ticks: { color: "#e2e8f0", font: { size: 11, weight: "600" } },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // Start App
    init();
});
