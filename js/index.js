window.onload = async function () {
    await initDb();
    loadAllSelect();
    refreshTableData();
    registerEvents();
};

async function loadAllSelect() {
    await loadSelect("Season");
    await loadSelect("Round", "Season", parseInt(localStorage.getItem("Season")));
    await loadSelect("Group");
    await loadSelect("Race");
    await loadSelect("Class");
}


function display(html, id) {
    $("#selectall").removeClass("active");
    $("#moveup").removeClass("disabled");
    $("#movedown").removeClass("disabled");
    $("#racercard").removeClass("d-none");
    $("#disp").html(html);
    $("#disp").data("identity", id);
}


async function refreshTableData(selected = "") {

    clear_laps();
    let group = parseInt(localStorage.getItem("Group"));
    let race = parseInt(localStorage.getItem("Race"));
    let round = parseInt(localStorage.getItem("Round"));
    let season = parseInt(localStorage.getItem("Season"));
    let classes = [];
    let classes_id = [];
    let numbers = [];
    let numbers_all = [];
    let laps_done = [];
    let last_lap = [];
    let entries = [];
    let entries_id = [];
    let names = [];
    let bikes = [];
    let lap_results = [];
    let lap_results_final = [];

    if (group && race) {
        $("#Number_input").prop("disabled", false);
        $("#Submit").prop("disabled", false);
        $("#Clear_all").prop("disabled", false);
        $("#Save").prop("disabled", false);
        $("#Number_input").attr("placeholder", "Enter Number Here");
        $("#Number_input").focus();

        const group_db = await db.select({
            from: "Group",
            where: {
                id: group
            },
        });
        classes = (group_db[0].Name).split(",")
        classes_id = (group_db[0].Classes).split(",")
        $("#results").html("");
        $("#results").append(resultrow("Unknown", "Unknown"));


        for (let i = 0; i < classes.length; i++) {
            $("#results").append(resultrow(classes[i], `class_${classes_id[i]}`, i));
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
            names.push([])
            bikes.push([])
            lap_results.push([])
            lap_results_final.push([])
            for (let e = 0; e < entry_db.length; e++) {
                entries[i].push(entry_db[e].Number);
                entries_id[i].push(entry_db[e].id);
                const racer = await db.select({
                    from: "Racer",
                    where: {
                        id: entry_db[e].Racer_id,
                    },
                })
                const bike = await db.select({
                    from: "Bike",
                    where: {
                        id: entry_db[e].Bike_id,
                    },
                })
                if (bike.length > 0) {
                    bikes[i].push(`${bike[0].Year} ${bike[0].Model} ${bike[0].CC}`);
                } else {
                    bikes[i].push(`Unknown`);

                }
                if (racer.length > 0) {
                    names[i].push(`${racer[0].FirstName} ${racer[0].LastName}`);
                } else {
                    names[i].push(`Unknown`);
                }
            }


        }
        $("#results").append(resultrow("DNF", "DNF"));
        const results = await db.select({
            from: "Lap_Race",
            where: {
                Group_id: group,
                Race_id: race,
                Round_id: round,
            },
        });

        var lap = 1;
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
                }
                last_lap[index] = lap;
            }
            let found = false
            for (let c = 0; c < entries.length; c++) {
                let idx = await entries[c].indexOf(results[i].Number)
                if (idx != -1) {
                    found = true;
                    if (results[i].id == selected) {
                        await $('#Lap' + lap).append(racebtn(results[i].Number,
                            results[i].id,
                            "active",
                            c,
                            await names[c][idx],
                            await bikes[c][idx]))
                    } else {
                        await $('#Lap' + lap).append(racebtn(results[i].Number,
                            results[i].id,
                            "",
                            c,
                            await names[c][idx],
                            await bikes[c][idx]))
                        break;
                    }

                }
            }
            if (!found) {
                (results[i].id == selected) ? $('#Lap' + lap).append(racebtn(results[i].Number, results[i].id, "active", 5)) : $('#Lap' + lap).append(racebtn(results[i].Number, results[i].id, "", 5))
            }
            $('#laprow' + lap).removeClass("d-none");
        }
        for (i = lap + 1; i <= 9; i++) {
            $('#laprow' + i).addClass("d-none");
        }
        $('.entry').on('click', function (e) {
            $('.entry').removeClass("active");
            $(this).addClass("active");
            $('#disp').attr('class', $(this).attr('class'));
            display($(this).html(), $(this).attr('id'));
        });
        if (selected != "") {
            $(`#${selected}`).click()
        }



        // console.log(entries);
        // console.log(numbers);
        // console.log(lap);
        let last_numbers = [];
        $(`#Lap${lap}`).children().each(function () {
            last_numbers.push($(this).html());
        });


        let lap_count = [];
        for (let i = 0; i < last_numbers.length; i++) {
            let laps = 0;
            for (let x = 0; x < numbers_all.length; x++) {
                if (numbers_all[x] == last_numbers[i]) {
                    laps++;
                }
            }
            lap_count.push(laps);
            let found = false;
            let cl = 0;
            let clid = 0;
            for (let j = 0; j < entries.length; j++) {
                if (entries[j].includes(last_numbers[i])) {
                    cl = classes_id[j]
                    clid = j
                    found = true;
                    break;
                }
                if (found) break;
            }

            if (!found) {
                $("#Unknown").append(racebtngrp(last_numbers[i], 5));
            } else {
                lap_results[clid].push(last_numbers[i])
            }
        }
        for (let i = lap; i > 0; i--) {
            for (let j = 0; j < lap_results.length; j++) {
                for (let k = 0; k < lap_results[j].length; k++) {
                    if (lap_count[last_numbers.indexOf(lap_results[j][k])] == i) {
                        lap_results_final[j].push(lap_results[j][k]);
                    }
                }
            }
        }

        for (let i = 0; i < classes_id.length; i++) {
            for (let j = 0; j < lap_results_final[i].length; j++) {
                let index;
                let info;
                let id;
                for (let k = 0; k < entries.length; k++) {
                    index = entries[k].indexOf(lap_results_final[i][j])
                    if (index != -1) {
                        info = k
                        id = entries_id[k][index]
                        break;
                    }
                }
                $(`#class_${classes_id[i]}`).append(racebtngrp(lap_results_final[i][j], i, id, j + 1, names[info][index], bikes[info][index], lap_count[last_numbers.indexOf(lap_results_final[i][j])]));
            }
        }


        let found = false;
        for (let i = 0; i < numbers.length; i++) {
            found = false
            for (let j = 0; j < last_numbers.length; j++) {
                if (last_numbers[j] == numbers[i]) {
                    found = true
                    continue;
                }
            }
            if (!found) {
                let index;
                let info;
                let name = "Unknown"
                let bike = "Unknown"
                for (let k = 0; k < entries.length; k++) {
                    index = entries[k].indexOf(numbers[i])
                    if (index != -1) {
                        name = names[k][index]
                        bike = bikes[k][index]
                        break;
                    }
                }
                $("#DNF").append(racebtngrp(numbers[i], 5, "", "DNF", name, bike, "N/A"));
            }
        }

        $('.racebtngrp').on('click', function (e) {
            $('.racebtngrp').removeClass("active");
            $(this).addClass("active");
            let num = $(this).html()
            $('.entry').each(function () {
                if ($(this).html() == num) {
                    $(this).addClass("active");
                } else {
                    $(this).removeClass("active");
                }
            });
        });
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
    } else {
        $("#Number_input").prop("disabled", true);
        $("#Number_input").attr("placeholder", "Select Option Above");
        $("#results").html("");
        $("#Submit").prop("disabled", true);
        $("#Clear_all").prop("disabled", true);
        $("#Save").prop("disabled", true);
    }

}


function registerEvents() {
    $(`#version`).html(version);
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
    $("#browse").click(function () {
        $("#fileUpload").click();
    });
    $("#Save").click(async function () {
        let classes_id = [];
        //let classes = [];
        //let class_result = [];
        let race = parseInt(localStorage.getItem("Race"));
        let round = parseInt(localStorage.getItem("Round"));
        let group = parseInt(localStorage.getItem("Group"));
        let season = parseInt(localStorage.getItem("Season"));
        let group_db = await db.select({
            from: "Group",
            where: {
                id: group
            },
        });
        classes_id = await (group_db[0].Classes).split(",")
        //classes = await (group_db[0].Name).split(",")
        for (let c = 0; c < classes_id.length; c++) {
            //class_result.push([]);
            const season_class = await db.select({
                from: "Season_Class",
                where: {
                    Season_id: season,
                    Class_id: parseInt(classes_id[c]),
                },
            });
            const entry_db = await db.select({
                from: "Entry",
                where: {
                    Season_Class_id: season_class[0].id,
                },
            })
            for (let e = 0; e < entry_db.length; e++) {
                const result_db = await db.select({
                    from: "Result",
                    where: {
                        Entry_id: entry_db[e].id,
                        Round_id: round
                    },
                })
                if (result_db.length > 0) {
                    await db.update({
                        in: "Result", set: { [`PTS${race}`]: 0, [`POS${race}`]: 0 }, where: { Entry_id: entry_db[e].id, Round_id: round }
                    });
                }
            }
            let i = 1;
            let btn_order = $(`#class_${classes_id[c]}`).children();
            for (let b = 0; b < btn_order.length; b++) {

                let entry_id = parseInt(btn_order[b].id)
                const result_db = await db.select({
                    from: "Result",
                    where: {
                        Entry_id: entry_id,
                        Round_id: round
                    },
                })
                if (result_db.length > 0) {
                    await db.update({
                        in: "Result", set: { [`PTS${race}`]: postopoints(i), [`POS${race}`]: i }, where: { Entry_id: entry_id, Round_id: round }
                    });
                } else {
                    await insertdb("Result", { Entry_id: entry_id, Round_id: round, [`PTS${race}`]: postopoints(i), [`POS${race}`]: i })
                }
                i++;
            }
        }
        $('#resultsModal').modal('show')
    });
    $('#Number_input').on('keypress', function (e) {
        if (e.key == 'Enter') {
            Process_number();
        }
    });
    $('#delete').on('click', async function (e) {
        if ($("#selectall").hasClass("active")) {
            let num = $('#disp').html();
            let group = parseInt($('#Group').val());
            let round = parseInt($('#Round').val());
            let race = parseInt($('#Race').val());
            await db.remove({
                from: "Lap_Race",
                where: {
                    Group_id: group,
                    Race_id: race,
                    Round_id: round,
                    Number: num
                }
            });
            refreshTableData();
        } else {
            let id = parseInt($('#disp').data('identity'));
            await db.remove({
                from: "Lap_Race",
                where: { id: id, }
            });
            refreshTableData();
        }
    })

    $('#change').on('click', async function (e) {
        let changeto = $("#changeto").val();
        if (changeto != "") {
            if ($("#selectall").hasClass("active")) {
                let num = $('#disp').html();
                let group = parseInt($('#Group').val());
                let round = parseInt($('#Round').val());
                let race = parseInt($('#Race').val());
                await db.update({
                    in: "Lap_Race", 
                    set: { Number: changeto }, 
                    where: { 
                        Group_id: group,
                        Race_id: race,
                        Round_id: round,
                        Number: num
                    }
                });
                refreshTableData();
            } else {
                let id = parseInt($('#disp').data('identity'));
                await db.update({
                    in: "Lap_Race", set: { Number: changeto }, where: { id: id }
                });
                refreshTableData();
            }
        }
    })

    $('#moveup').on('click', async function (e) {
        if (!$("#moveup").hasClass("disabled")) {
            let id = $('#disp').data('identity');
            let group = parseInt($('#Group').val());
            let race = parseInt($('#Race').val());
            let round = parseInt($('#Round').val());
            const results = await db.select({
                from: "Lap_Race",
                where: {
                    Group_id: group,
                    Race_id: race,
                    Round_id: round,
                },
            });
            for (let i = 0; i < results.length; i++) {
                if (results[i].id == id && i > 0) {
                    let valuea = results[i].Number
                    let valueb = results[i - 1].Number
                    await db.update({
                        in: "Lap_Race", set: { Number: valueb }, where: { id: results[i].id }
                    });
                    await db.update({
                        in: "Lap_Race", set: { Number: valuea }, where: { id: results[i - 1].id }
                    });
                    $("#disp").data("identity", results[i - 1].id);
                    refreshTableData(results[i - 1].id);
                    return;
                }
            }
        }
    });
    $('#movedown').on('click', async function (e) {
        if (!$("#movedown").hasClass("disabled")) {
            let id = $('#disp').data('identity');
            let group = parseInt($('#Group').val());
            let race = parseInt($('#Race').val());
            let round = parseInt($('#Round').val());
            const results = await db.select({
                from: "Lap_Race",
                where: {
                    Group_id: group,
                    Race_id: race,
                    Round_id: round,
                },
            });
            for (let i = 0; i < results.length; i++) {
                if (results[i].id == id && i < results.length - 1) {
                    let valuea = results[i].Number
                    let valueb = results[i + 1].Number
                    await db.update({
                        in: "Lap_Race", set: { Number: valueb }, where: { id: results[i].id }
                    });
                    await db.update({
                        in: "Lap_Race", set: { Number: valuea }, where: { id: results[i + 1].id }
                    });
                    $("#disp").data("identity", results[i + 1].id);
                    refreshTableData(results[i + 1].id);
                    return;
                }
            }
        }
    });

    $('#Clear_all').on('click', function (e) {
        clear_all();
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    $('#Submit').on('click', function (e) {
        Process_number();
    });

    $('#download').on('click', function (e) {
        DownloadDatabase();
    });
    $('#selectall').on('click', function (e) {
        $('.entry').each(function () {
            if ($(this).html() == $('#disp').html()) {
                $(this).addClass("active");
            } else {
                $(this).removeClass("active");

            }
        });
        $("#selectall").addClass("active");
        $("#moveup").addClass("disabled");
        $("#movedown").addClass("disabled");
    });

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

async function Process_number() {
    let num = $('#Number_input').val().toUpperCase();
    let group = parseInt($('#Group').val());
    let round = parseInt($('#Round').val());
    let race = parseInt($('#Race').val());
    if (group && race && num != "") {
        $('#Number_input').val("");
        var laprace = {
            Number: num,
            Group_id: group,
            Race_id: race,
            Round_id: round,
        };
        try {
            var noOfDataInserted = await db.insert({
                into: 'Lap_Race',
                values: [laprace]
            });
            if (noOfDataInserted === 1) {
                refreshTableData();
            }
        } catch (ex) {
            alert(ex.message);
        }
    }
}

async function clear_laps() {
    await $(".lap-row").each(function (index, element) {
        $(this).html("");
    });
    await $(".lap").each(function (index, element) {
        $(this).removeClass("active");
    });
    for (i = 1; i <= 9; i++) {
        $('#laprow' + i).addClass("d-none");
    }
    $("#racercard").addClass("d-none");
}

async function clear_all() {
    $("#racercard").addClass("d-none");
    let group = parseInt($('#Group').val());
    let round = parseInt($('#Round').val());
    let race = parseInt($('#Race').val());
    if (group && race) {
        try {
            await db.remove({
                from: 'Lap_Race',
                where: {
                    Group_id: group,
                    Race_id: race,
                    Round_id: round
                },
            });
            refreshTableData();
        } catch (ex) {
            alert(ex.message);
        }
        $("#Number_input").focus();
    }
}

