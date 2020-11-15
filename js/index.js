

window.onload = function () {
    initDb();
    loadAllSelect();
    refreshTableData();
    registerEvents();
};



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
    let season = parseInt(localStorage.getItem("Season"));
    let classes = [];
    let classes_id = [];
    let numbers = [];
    let laps_done = [];
    let last_lap = [];
    let entries = [];
    let names = [];
    let bikes = [];
    let lap_results = [];
    let lap_results_final = [];

    if (group && race) {
        $("#Number_input").prop("disabled", false);
        $("#Number_input").attr("placeholder", "Enter Number Here");

        let group_db = await db.select({
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
            names.push([])
            bikes.push([])
            lap_results.push([])
            lap_results_final.push([])
            for (let e = 0; e < entry_db.length; e++) {
                entries[i].push(entry_db[e].Number);
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
                Race_id: race
            },
        });

        var lap = 1;
        for (let i = 0; i < results.length; i++) {
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
            console.log($(this).attr('class'));
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
            $('.entry').each(function () {
                if ($(this).html() == last_numbers[i]) {
                    laps++;
                }
            });
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
                $("#unknown").append(racebtngrp(last_numbers[i]));
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
                for (let k = 0; k < entries.length; k++) {
                    index = entries[k].indexOf(lap_results_final[i][j])
                    if (index != -1) {
                        info = k
                        break;
                    }
                }
                $(`#class_${classes_id[i]}`).append(racebtngrp(lap_results_final[i][j], i, "", j + 1, names[info][index], bikes[info][index], lap_count[last_numbers.indexOf(lap_results_final[i][j])]));
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
    }
}








