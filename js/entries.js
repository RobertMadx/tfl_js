window.onload = function () {
    initDb();
    loadAllSelect();
    refreshTableData();
    registerEvents();
};

async function loadAllSelect() {
    await loadSelect("Season");
    await loadSelect("Round", "Season", parseInt(localStorage.getItem("Season")));
    await loadSelect("Group");
}

function registerEvents() {
    $('select').on('change', async function (e) {
        localStorage.setItem(this.id, this.value);
        if (this.id == "Season") {
            localStorage.removeItem("Round");
            localStorage.removeItem("Group");
            await loadSelect("Round", "Season", parseInt(localStorage.getItem("Season")));
            await loadSelect("Group");
        }
        refreshTableData();
    });



}

async function refreshTableData() {
    let group = parseInt(localStorage.getItem("Group"));
    let round = parseInt(localStorage.getItem("Round"));
    let season = parseInt(localStorage.getItem("Season"));
    let classes = [];
    let racers = [];
    let sc = [];
    let classes_id = [];
    $("#entries").html("");
    if (group && season && round) {
        const group_db = await db.select({
            from: "Group",
            where: {
                id: group
            },
        });
        classes = (group_db[0].Name).split(",")
        classes_id = (group_db[0].Classes).split(",")
        for (let i = 0; i < classes_id.length; i++) {
            racers.push([]);
            const season_class = await db.select({
                from: "Season_Class",
                where: {
                    Season_id: season,
                    Class_id: parseInt(classes_id[i])
                },
            });
            const entry_db = await db.select({
                from: "Entry",
                where: {
                    Season_Class_id: season_class[0].id,
                },
            })
            sc.push(season_class[0].id);
            $("#entries").append(await entrytable(classes[i], classes_id[i], season_class[0].id));
            for (let e = 0; e < entry_db.length; e++) {
                racers[i].push(entry_db[e].Racer_id);
                const racer_db = await db.select({
                    from: "Racer",
                    where: {
                        id: entry_db[e].Racer_id,
                    },
                })
                const racers_db = await db.select({
                    from: "Racer",
                    where: {
                        id: {
                            '!=': entry_db[e].Racer_id
                        }
                    },
                    order: {
                        by: 'FirstName',
                        type: 'asc'
                    }
                })
                const bike_db = await db.select({
                    from: "Bike",
                    where: {
                        id: entry_db[e].Bike_id,
                    },
                })
                const bikes_db = await db.select({
                    from: "Bike",
                    where: {
                        Racer_id: racer_db[0].id,
                        id: {
                            '!=': bike_db[0].id
                        }
                    },
                })
                $(`#class_${classes_id[i]}`).append(
                    await entryrow(entry_db[e].id,
                        entry_db[e].Number,
                        `${racer_db[0].FirstName} ${racer_db[0].LastName}`,
                        `${bike_db[0].Year > 0 ? bike_db[0].Year : ""} ${bike_db[0].Model} ${bike_db[0].CC > 0 ? bike_db[0].CC : ""}`,
                        racer_db[0].id,
                        bike_db[0].id,
                        racers_db,
                        bikes_db
                    )
                );
            }
        }
        const racers_all = await db.select({
            from: "Racer",
            order: {
                by: 'FirstName',
                type: 'asc'
            }
        })
        for (let c = 0; c < sc.length; c++) {
            for (let r = 0; r < racers_all.length; r++) {
                if (!racers[c].includes(racers_all[r].id)) {
                    $(`#name_new_${sc[c]}`).append(await option(racers_all[r].id, `${racers_all[r].FirstName} ${racers_all[r].LastName}`))
                }
            }
        }
        $(".save").prop("disabled", true);
        $("add_new").prop("disabled", true);
        $('.edit').on('input', async function (e) {
            let number = $(`#number_${e.target.dataset.id}`).val();
            let bike_id = parseInt($(`#bike_${e.target.dataset.id}`).val());
            let racer_id = parseInt($(`#name_${e.target.dataset.id}`).val());
            const entry_check = await db.select({
                from: "Entry",
                where: {
                    id: parseInt(e.target.dataset.id),
                },
            })
            if (number != entry_check[0].Number || bike_id != entry_check[0].Bike_id || racer_id != entry_check[0].Racer_id) {
                $(`#save_${e.target.dataset.id}`).removeClass("btn-secondary");
                $(`#save_${e.target.dataset.id}`).addClass("btn-success");
                $(`#save_${e.target.dataset.id}`).prop("disabled", false);
            } else {
                $(`#save_${e.target.dataset.id}`).addClass("btn-secondary");
                $(`#save_${e.target.dataset.id}`).removeClass("btn-success");
                $(`#save_${e.target.dataset.id}`).prop("disabled", true);
            }

        });
        $('.new').on('input', async function (e) {
            let number = $(`#number_new_${e.target.dataset.sc}`).val();
            let bike_id = parseInt($(`#bike_new_${e.target.dataset.sc}`).val());
            let racer_id = parseInt($(`#name_new_${e.target.dataset.sc}`).val());

            if (!bike_id && racer_id) {
                const bikes = await db.select({
                    from: "Bike",
                    where: {
                        Racer_id: racer_id,
                    },
                })
                $(`#bike_new_${e.target.dataset.sc}`).html(`<option value="0" selected disabled>Select Bike</option>`);
                for (let b = 0; b < bikes.length; b++) {
                    $(`#bike_new_${e.target.dataset.sc}`).append(await option(bikes[b].id,
                        `${bikes[b].Year > 0 ? bikes[b].Year : ""} ${bikes[b].Model} ${bikes[b].CC > 0 ? bikes[b].CC : ""}`))
                }
            } else if (number != "" && bike_id && racer_id) {
                const entry_check = await db.select({
                    from: "Entry",
                    where: {
                        Number: number,
                        Bike_id: bike_id,
                        Racer_id: racer_id,
                        Season_Class_id: parseInt(e.target.dataset.sc),
                    },
                })
                if (entry_check.length == 0) {
                    $(`#add_new`).removeClass("btn-secondary");
                    $(`#add_new`).addClass("btn-success");
                    $(`#add_new`).prop("disabled", false);
                } else {
                    $(`#add_new`).addClass("btn-secondary");
                    $(`#add_new`).removeClass("btn-success");
                    $(`#add_new`).prop("disabled", true);
                }
            } else {
                $(`#add_new`).addClass("btn-secondary");
                $(`#add_new`).removeClass("btn-success");
                $(`#add_new`).prop("disabled", true);
            }
        });
        $('#add_new').on('click', async function (e) {
            let number = $(`#number_new_${e.target.dataset.sc}`).val();
            let bike_id = parseInt($(`#bike_new_${e.target.dataset.sc}`).val());
            let racer_id = parseInt($(`#name_new_${e.target.dataset.sc}`).val());
            if (number != "" && bike_id && racer_id) {
                const entry_check = await db.select({
                    from: "Entry",
                    where: {
                        Number: number,
                        Bike_id: bike_id,
                        Racer_id: racer_id,
                        Season_Class_id: parseInt(e.target.dataset.sc),
                    },
                })
                if (entry_check.length == 0) {
                    await insertdb("Entry",{
                        Number: number,
                        Bike_id: bike_id,
                        Racer_id: racer_id,
                        Season_Class_id: parseInt(e.target.dataset.sc),
                    })
                    refreshTableData()
                }
            }
        })
        $('.delete').on('click', async function (e) {
            await db.remove({
                from: "Entry",
                where: {
                    id: parseInt(e.target.dataset.id),
                }
            });
            let round = parseInt(localStorage.getItem("Round"));
            await db.remove({
                from: "Result",
                where: {
                    Entry_id: parseInt(e.target.dataset.id),
                    Round_id: round
                }
            });
            $(`#entry_${e.target.dataset.id}`).remove();
        });
        $('.save').on('click', async function (e) {
            if ($(`#save_${e.target.dataset.id}`).prop("disabled")) return;
            let number = $(`#number_${e.target.dataset.id}`).val();
            let bike_id = $(`#bike_${e.target.dataset.id}`).val();
            let racer_id = $(`#name_${e.target.dataset.id}`).val();
            await db.update({
                in: "Entry",
                set: {
                    Number: number,
                    Bike_id: parseInt(bike_id),
                    Racer_id: parseInt(racer_id)
                },
                where: {
                    id: parseInt(e.target.dataset.id),
                }
            });
            $(`#save_${e.target.dataset.id}`).addClass("btn-secondary");
            $(`#save_${e.target.dataset.id}`).removeClass("btn-success");
            $(`#save_${e.target.dataset.id}`).prop("disabled", true);
        });
    }
}
