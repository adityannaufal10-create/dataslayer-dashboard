/**
 * DATA SLAYER - Statistical Calculation & Model Engine
 * Implements the Stratified Probability Estimation Model,
 * Opportunity Gap calculation, and Cluster Analytics.
 */

const ModelEngine = {
    // National average baseline APS references
    NATIONAL_BASELINE: {
        aps_7_12: 99.18,
        aps_13_15: 95.90,
        aps_16_18: 73.85,
        rls: 8.77,
        hls: 13.15
    },

    /**
     * Calculates R_provinsi ratios for each stage based on provincial APS
     */
    calculateProvincialRatios(province) {
        if (!province) {
            return { SD: 1.0, SMP: 1.0, SMA: 1.0, PT: 1.0 };
        }
        
        const r_sd = Math.min(1.05, Math.max(0.85, province.aps_7_12 / this.NATIONAL_BASELINE.aps_7_12));
        const r_smp = Math.min(1.08, Math.max(0.75, province.aps_13_15 / this.NATIONAL_BASELINE.aps_13_15));
        const r_sma = Math.min(1.20, Math.max(0.65, province.aps_16_18 / this.NATIONAL_BASELINE.aps_16_18));
        
        // PT ratio combines SMA participation and educational attainment stock
        const r_pt = Math.min(1.25, Math.max(0.60, (r_sma * 0.6) + ((province.rls / this.NATIONAL_BASELINE.rls) * 0.4)));

        return {
            SD: r_sd,
            SMP: r_smp,
            SMA: r_sma,
            PT: r_pt
        };
    },

    /**
     * Calculates completion probability for a profile:
     * P(j) = MIN(100%, P_nasional(j | kuintil) * R_prov * R_daerah * R_gender)
     */
    calculateProfileProbabilities(profile) {
        const { provinsiKode, daerah, kuintil, gender } = profile;
        const provData = window.DATA_SLAYER.provinces.find(p => p.kode === provinsiKode) || window.DATA_SLAYER.provinces[12]; // default Jawa Tengah
        const rProv = this.calculateProvincialRatios(provData);
        const rDaerah = window.DATA_SLAYER.rDaerah[daerah] || { SD: 1, SMP: 1, SMA: 1, PT: 1 };
        const rGender = window.DATA_SLAYER.rGender[gender] || { SD: 1, SMP: 1, SMA: 1, PT: 1 };
        const qData = window.DATA_SLAYER.nationalCompletion[kuintil] || window.DATA_SLAYER.nationalCompletion["Q1"];

        const stages = ["SD", "SMP", "SMA", "PT"];
        const results = {};

        stages.forEach(stage => {
            const pNas = qData[stage];
            const rp = rProv[stage];
            const rd = rDaerah[stage];
            const rg = rGender[stage];

            const rawProb = pNas * rp * rd * rg;
            const finalProb = Math.min(100.0, Math.max(1.0, rawProb));

            results[stage] = {
                pNas: pNas,
                rProv: rp,
                rDaerah: rd,
                rGender: rg,
                probability: parseFloat(finalProb.toFixed(2))
            };
        });

        return {
            province: provData,
            profile: profile,
            stages: results
        };
    },

    /**
     * Compares selected profile against reference/benchmark profile
     */
    calculateOpportunityGap(selectedResult, benchmarkResult) {
        const stages = ["SD", "SMP", "SMA", "PT"];
        const gaps = {};
        let largestGapStage = "SMA";
        let maxGapVal = -1;

        stages.forEach(stg => {
            const selP = selectedResult.stages[stg].probability;
            const bmkP = benchmarkResult.stages[stg].probability;
            const diff = parseFloat((bmkP - selP).toFixed(2));
            gaps[stg] = {
                selected: selP,
                benchmark: bmkP,
                gap: diff
            };
            if (diff > maxGapVal) {
                maxGapVal = diff;
                largestGapStage = stg;
            }
        });

        // Determine largest obstacle factor
        const selProfile = selectedResult.profile;
        let largestObstacle = "Faktor Ekonomi (Kuintil Rendah)";
        let obstacleDesc = "Keterbatasan biaya langsung & tingginya biaya peluang bersekolah.";

        if (selProfile.kuintil === "Q1" || selProfile.kuintil === "Q2") {
            largestObstacle = "Faktor Ekonomi (Kuintil Rendah)";
            obstacleDesc = "Kesenjangan pendapatan keluarga menjadi hambatan terbesar melanjutkan ke SMA & PT.";
        } else if (selectedResult.stages.SMA.rProv < 0.93) {
            largestObstacle = "Disparitas Wilayah (Provinsi)";
            obstacleDesc = "Ketersediaan fasilitas SMA/SMK dan daya tampung di provinsi berada di bawah rata-rata nasional.";
        } else if (selProfile.daerah === "Perdesaan") {
            largestObstacle = "Kesenjangan Akses Desa-Kota";
            obstacleDesc = "Jarak tempuh, akses transportasi, dan konsentrasi sekolah menengah di wilayah perkotaan.";
        } else {
            largestObstacle = "Faktor Ekonomi / Biaya Lanjutan";
            obstacleDesc = "Biaya kuliah dan seleksi masuk perguruan tinggi.";
        }

        return {
            gaps: gaps,
            largestGapStage: largestGapStage,
            largestObstacle: largestObstacle,
            obstacleDesc: obstacleDesc,
            smaGap: gaps.SMA.gap,
            smaProbSelected: gaps.SMA.selected,
            smaProbBenchmark: gaps.SMA.benchmark
        };
    }
};

window.ModelEngine = ModelEngine;
