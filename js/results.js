window.onload = async function () {
    await initDb();
    await loadAllSelect();
    await recalculateResults();
    registerEvents();
    refreshTableData();
    
};

async function recalculateResults() {
    const seasons = await db.select({
        from: "Season",
    });
    const groups = await db.select({
        from: "Group",
    });
    const rounds = await db.select({
        from: "Round",
    });
    await db.remove({
        from: "Result",
    })
    $("#bars").append(progressbar("Season_progress"));
    $("#bars").append(progressbar("Round_progress"));
    $("#bars").append(progressbar("Group_progress"));

    

    // if (per == 100) {
    //     $(`#${sheetName}_bar`).remove()
    // }

    for (let s = 0; s < seasons.length; s++) {
        for (let r = 0; r < rounds.length; r++) {
            for (let g = 0; g < groups.length; g++) {
                await ResultsPerRound(seasons[s].id, groups[g].id, rounds[r].id);
                let per = Math.round(((g + 1) / groups.length) * 100);
                $(`#Group_progress`).css('width', `${per}%`)
                $(`#Group_progress`).html(`${groups[g].Name}`)
                per = Math.round(((r + 1) / rounds.length) * 100);
                $(`#Round_progress`).css('width', `${per}%`)
                $(`#Round_progress`).html(`${rounds[r].Name}`)
                per = Math.round(((s) / seasons.length) * 100);
                $(`#Season_progress`).css('width', `${per}%`)
                $(`#Season_progress`).html(`${per}%`)
            }
        }        
    }
    $('#bars').addClass("d-none")
}

async function ResultsPerRound(season, group, round) {
    const race = await db.select({
        from: "Race",
    });
    for (let r = 0; r < race.length; r++) {
        const results = await db.select({
            from: "Lap_Race",
            where: {
                Group_id: group,
                Race_id: race[r].id,
                Round_id: round,
            },
        });
        if (results.length == 0){break;}

        let classes = [];
        let classes_id = [];
        let numbers = [];
        let numbers_all = [];
        let laps_done = [];
        let laps = [];
        let last_lap = [];
        let entries = [];
        let entries_id = [];
        let lap_results = [];
        let lap_results_final = [];

        const group_db = await db.select({
            from: "Group",
            where: {
                id: group
            },
        });
        classes = (group_db[0].Name).split(",")
        classes_id = (group_db[0].Classes).split(",")
        for (let i = 0; i < classes.length; i++) {
            const season_class = await db.select({
                from: "Season_Class",
                where: {
                    Season_id: season,
                    Class_id: parseInt(classes_id[i]),
                },
            });
            const entry_db = await db.select({
                from: "Entry",
                where: {
                    Season_Class_id: season_class[0].id,
                },
            })
            entries.push([])
            entries_id.push([])
            lap_results.push([])
            lap_results_final.push([])
            for (let e = 0; e < entry_db.length; e++) {
                entries[i].push(entry_db[e].Number);
                entries_id[i].push(entry_db[e].id);
            }
        }

        

        var lap = 1;
        laps.push([])
        laps.push([])
        for (let i = 0; i < results.length; i++) {
            numbers_all.push(results[i].Number);
            var index = numbers.indexOf(results[i].Number);
            if (index == -1) {
                numbers.push(results[i].Number)
                laps_done.push(1);
                last_lap.push(1);
                last_lap.push(lap);
            } else {
                laps_done[index]++;
                if (lap < laps_done[index] || last_lap[index] == lap) {
                    lap++
                    laps.push([])
                }
                last_lap[index] = lap;
            }
            for (let c = 0; c < entries.length; c++) {
                let idx = await entries[c].indexOf(results[i].Number)
                if (idx != -1) {
                    laps[lap].push(results[i].Number);
                }
            }
        }

        let lap_count = [];
        for (let i = 0; i < laps[lap].length; i++) {
            let laps_total = 0;
            for (let x = 0; x < numbers_all.length; x++) {
                if (numbers_all[x] == laps[lap][i]) {
                    laps_total++;
                }
            }
            lap_count.push(laps_total);
            let found = false;
            let cl = 0;
            let clid = 0;
            for (let j = 0; j < entries.length; j++) {
                if (entries[j].includes(laps[lap][i])) {
                    cl = classes_id[j]
                    clid = j
                    found = true;
                    break;
                }
                if (found) break;
            }

            if (found) {
                lap_results[clid].push(laps[lap][i])
            }
        }
        for (let i = lap; i > 0; i--) {
            for (let j = 0; j < lap_results.length; j++) {
                for (let k = 0; k < lap_results[j].length; k++) {
                    if (lap_count[laps[lap].indexOf(lap_results[j][k])] == i) {
                        lap_results_final[j].push(lap_results[j][k]);
                    }
                }
            }
        }

        let lap_results_final_entries = [];
        for (let i = 0; i < classes_id.length; i++) {
            lap_results_final_entries.push([]);
            for (let j = 0; j < lap_results_final[i].length; j++) {
                let index;
                let info;
                let id;
                for (let k = 0; k < entries.length; k++) {
                    index = entries[k].indexOf(lap_results_final[i][j])
                    if (index != -1) {
                        lap_results_final_entries[i].push(entries_id[k][index])
                        break;
                    }
                }
            }
        }

        for (let re = 0; re < lap_results_final_entries.length; re++) {
            for (let pos = 1; pos <= lap_results_final_entries[re].length; pos++) {
                const result_db = await db.select({
                    from: "Result",
                    where: {
                        Entry_id: lap_results_final_entries[re][pos - 1],
                        Round_id: round
                    },
                })
                if (result_db.length > 0) {
                    await db.update({
                        in: "Result", set: { [`PTS${r + 1}`]: postopoints(pos), [`POS${r + 1}`]: pos }, where: { Entry_id: lap_results_final_entries[re][pos - 1], Round_id: round }
                    });
                } else {
                    await insertdb("Result", { Entry_id: lap_results_final_entries[re][pos - 1], Round_id: round, [`PTS${r + 1}`]: postopoints(pos), [`POS${r + 1}`]: pos })
                }
            }
        }
    }
}

async function loadAllSelect() {
    await loadSelect("Season");
    await loadSelect("Round", "Season", parseInt(localStorage.getItem("Season")));
    await loadSelect("Class");
}

async function generateResults(season, round, cls) {
    let results = [];
    const season_class = await db.select({
        from: "Season_Class",
        where: {
            Season_id: season,
            Class_id: cls,
        },
    });

    const entry_db = await db.select({
        from: "Entry",
        where: {
            Season_Class_id: season_class[0].id,
        },
    })

    for (let i = 0; i < entry_db.length; i++) {
        const racer_db = await db.select({
            from: "Racer",
            where: {
                id: entry_db[i].Racer_id,
            },
        })
        const bike_db = await db.select({
            from: "Bike",
            where: {
                id: entry_db[i].Bike_id,
            },
        })
        const result_db = await db.select({
            from: "Result",
            where: {
                Entry_id: entry_db[i].id,
                Round_id: round,
            },
        })
        let result_pos = [];
        let result_pts = [];
        if (result_db.length > 0) {
            result_pos.push(result_db[0].POS1 ? result_db[0].POS1 : 0)
            result_pos.push(result_db[0].POS2 ? result_db[0].POS2 : 0)
            result_pos.push(result_db[0].POS3 ? result_db[0].POS3 : 0)
            result_pts.push(result_db[0].PTS1 ? result_db[0].PTS1 : 0)
            result_pts.push(result_db[0].PTS2 ? result_db[0].PTS2 : 0)
            result_pts.push(result_db[0].PTS3 ? result_db[0].PTS3 : 0)
        } else {
            result_pos.push(0)
            result_pos.push(0)
            result_pos.push(0)
            result_pts.push(0)
            result_pts.push(0)
            result_pts.push(0)
        }
        result_pts.push(result_pts[0] + result_pts[1] + result_pts[2])
        const result_db_all = await db.select({
            from: "Result",
            where: {
                Entry_id: entry_db[i].id,
            },
        })
        let totalpts = 0;
        for (let rs = 0; rs < result_db_all.length; rs++) {
            totalpts += result_db_all[rs].PTS1 ? result_db_all[rs].PTS1 : 0;
            totalpts += result_db_all[rs].PTS2 ? result_db_all[rs].PTS2 : 0;
            totalpts += result_db_all[rs].PTS3 ? result_db_all[rs].PTS3 : 0;
        }
        result_pos.push(0)
        result_pts.push(totalpts)
        let CC = bike_db[0].CC == "0" ? "" : bike_db[0].CC;
        let Year = bike_db[0].Year == "0" ? "" : bike_db[0].Year;
        results.push({
            Number: "`" + entry_db[i].Number + "`",
            Name: `${racer_db[0].FirstName} ${racer_db[0].LastName}`,
            Bike: `${Year} ${bike_db[0].Model} ${CC}`,
            POS1: result_pos[0],
            PTS1: result_pts[0],
            POS2: result_pos[1],
            PTS2: result_pts[1],
            POS3: result_pos[2],
            PTS3: result_pts[2],
            POS4: result_pos[3],
            PTS4: result_pts[3],
            POS5: result_pos[4],
            PTS5: result_pts[4],
        })
    }
    results.sort(function (a, b) {
        var keyA = new Date(a.PTS4),
            keyB = new Date(b.PTS4);
        // Compare the 2 dates
        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;
        return 0;
    });
    let place = 0;
    let pts = 0;
    let prev_place = 0;
    for (let i = 0; i < results.length; i++) {
        if (results[i].PTS4 == 0) {
            results[i].POS4 = 0;
        } else if (results[i].PTS4 != pts) {
            pts = results[i].PTS4
            place++;
            prev_place = place;
            results[i].POS4 = place;
        } else {
            results[i].POS4 = prev_place;
            place++;
        }
    }
    results.sort(function (a, b) {
        var keyA = new Date(a.PTS5),
            keyB = new Date(b.PTS5);
        // Compare the 2 dates
        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;
        return 0;
    });
    place = 0;
    pts = 0;
    prev_place = 0;
    for (let i = 0; i < results.length; i++) {
        if (results[i].PTS5 == 0) {
            results[i].POS5 = 0;
        } else if (results[i].PTS5 != pts) {
            pts = results[i].PTS5
            place++;
            prev_place = place;
            results[i].POS5 = place;
        } else {
            results[i].POS5 = prev_place;
            place++;
        }
    }
    return results;
}

async function refreshTableData() {
    let round = parseInt(localStorage.getItem("Round"));
    let season = parseInt(localStorage.getItem("Season"));
    let cls = parseInt(localStorage.getItem("Class"));
    let cls_name = $(`#Class`).find(":selected").text();
    let season_name = $(`#Season`).find(":selected").text();
    let round_name = $(`#Round`).find(":selected").text();
    round_name = round_name.replace("Round ", "RD")
    season_name = season_name.replace("Season ", "")


    if (season && round && cls) {

        $("#cls_name").html("Loading....");
        $("#tbody").html("");

        let results = await generateResults(season, round, cls);

        for (let i = 0; i < results.length; i++) {
            $("#tbody").append(tableresultrow(
                results[i].Number,
                results[i].Name,
                results[i].Bike,
                results[i].POS1,
                results[i].PTS1,
                results[i].POS2,
                results[i].PTS2,
                results[i].POS3,
                results[i].PTS3,
                results[i].POS4,
                results[i].PTS4,
                results[i].POS5,
                results[i].PTS5,
            ));
        }
        $("#cls_name").html(`${season_name}-${round_name}-${cls_name}`);

    }

    $('.results_container').removeClass("d-none");
}

function registerEvents() {
    $(`#version`).html(version);
    $('#download').on('click', function (e) {
        let round = $(`#Round`).find(":selected").text();
        let season = $(`#Season`).find(":selected").text();
        let cls = $(`#Class`).find(":selected").text();

        if (season != "Select Season" && round != "Select Round" && cls != "Select Class") {
            round = round.replace("Round ", "RD")
            season = season.replace("Season ", "")
            var wb = XLSX.utils.table_to_book(document.getElementById("results"), { sheet: `${cls}` });
            XLSX.writeFile(wb, `${season}-${round}-${cls}.xlsx`) // name of the file is 'book.xlsx'
        }

    });
    $('#downloadall').on('click', async function (e) {

        let round_text = $(`#Round`).find(":selected").text();
        let season_text = $(`#Season`).find(":selected").text();
        let round = parseInt(localStorage.getItem("Round"));
        let season = parseInt(localStorage.getItem("Season"));

        if (season_text != "Select Season" && round_text != "Select Round") {
            round_text = round_text.replace("Round ", "RD")
            season_text = season_text.replace("Season ", "")
            var wb = XLSX.utils.book_new();

            const season_class = await db.select({
                from: "Season_Class",
                where: {
                    Season_id: season,
                },
            });
            $("#bars").append(progressbar("progress"));
            for (let sc = 0; sc < season_class.length; sc++) {
                const cls = await db.select({
                    from: "Class",
                    where: {
                        id: season_class[sc].Class_id,
                    },
                });
                wb.SheetNames.push(cls[0].Name);
                let results = await generateResults(season, round, parseInt(cls[0].id));

                let per = Math.round((sc / season_class.length) * 100);
                $(`#progress`).css('width', `${per}%`)
                $(`#progress`).html(`${per}%`)

                $("#hidden_tbody").html("");
                for (let r = 0; r < results.length; r++) {
                    $("#hidden_tbody").append(tableresultrow(
                        results[r].Number,
                        results[r].Name,
                        results[r].Bike,
                        results[r].POS1,
                        results[r].PTS1,
                        results[r].POS2,
                        results[r].PTS2,
                        results[r].POS3,
                        results[r].PTS3,
                        results[r].POS4,
                        results[r].PTS4,
                        results[r].POS5,
                        results[r].PTS5,
                    ));
                }
                var ws = XLSX.utils.table_to_sheet(document.getElementById("hidden_results"));
                wb.Sheets[cls[0].Name] = ws;
            }
            XLSX.writeFile(wb, `${season_text}-${round_text}.xlsx`) // name of the file is 'book.xlsx'
            $("#bars").html("");
        }

    });
    $('select').on('change', async function (e) {
        localStorage.setItem(this.id, this.value);
        if (this.id == "Season") {
            await loadSelect("Round", "Season", parseInt(localStorage.getItem("Season")));
        }
        refreshTableData();
    });
}


