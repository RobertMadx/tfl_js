window.onload = async function () {
    initDb();
    await loadAllSelect();
    registerEvents();
    refreshTableData();
};

async function loadAllSelect() {
    await loadSelect("Season");
    await loadSelect("Round", "Season", parseInt(localStorage.getItem("Season")));
    await loadSelect("Class");
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
    let results = [];
    
    if (season && round && cls) {

        $("#cls_name").html("Loading....");
        $("tbody").html("");
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
        const race_db = await db.select({
            from: "Race",
            where: {
                Round_id: round,
                Season_id: season,
            },
        })
        const race_db_all = await db.select({
            from: "Race",
            where: {
                Season_id: season,
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
            let result_pos = [];
            let result_pts = [];
            let totalroundpts = 0;
            for (let r = 0; r < race_db.length; r++) {
                const result_db = await db.select({
                    from: "Result",
                    where: {
                        Entry_id: entry_db[i].id,
                        Race_id: race_db[r].id,
                    },
                })
                if (result_db[0]) {
                    result_pos.push(result_db[0].Position);
                    result_pts.push(result_db[0].Points);
                    totalroundpts += result_db[0].Points
                } else {
                    result_pos.push(0);
                    result_pts.push(0);
                }
            }
            result_pos.push(0);
            result_pts.push(totalroundpts);
            let grandtotal = 0;
            for (let r = 0; r < race_db_all.length; r++) {
                const result_db = await db.select({
                    from: "Result",
                    where: {
                        Entry_id: entry_db[i].id,
                        Race_id: race_db_all[r].id,
                    },
                })
                grandtotal += result_db[0] ? result_db[0].Points : 0;
            }
            result_pos.push(0);
            result_pts.push(grandtotal);

            let CC = bike_db[0].CC == "0" ? "" : bike_db[0].CC;
            let Year = bike_db[0].Year == "0" ? "" : bike_db[0].Year;
            results.push({
                Number: entry_db[i].Number,
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
            if (results[i].PTS4 == 0){
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
            if (results[i].PTS5 == 0){
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
        for (let i = 0; i < results.length; i++) {
            $("tbody").append(tableresultrow(
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
}

function registerEvents() {
    $('#download').on('click', function (e) {
        let round = $(`#Round`).find(":selected").text();
        let season = $(`#Season`).find(":selected").text();
        let cls = $(`#Class`).find(":selected").text();

        if (season != "Select Season" && round != "Select Round" && cls != "Select Class") {
            round = round.replace("Round ", "RD")
            season = season.replace("Season ", "")
            var wb = XLSX.utils.table_to_book(document.getElementById("results"), { sheet: "Sheet JS" });
            XLSX.writeFile(wb, `${season}-${round}-${cls}.xlsx`) // name of the file is 'book.xlsx'
        }

    });
    $('select').on('change',async function (e) {
        localStorage.setItem(this.id, this.value);
        if (this.id == "Season") {
            await loadSelect("Round", "Season", parseInt(localStorage.getItem("Season")));
        } 
        refreshTableData();
    });
}

