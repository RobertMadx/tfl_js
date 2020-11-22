
document.title += " - v1.3";

var db = new JsStore.Connection(new Worker("./js/jsstore.worker.min.js"));

async function initDb() {
    var isDbCreated = await db.initDb(getDbSchema());
    if (isDbCreated) {
        //console.log('db created');
        initTables(db);
    }
    else {
        //console.log('db opened');
    }
}

async function insertdb(table, values) {
    await db.insert({
        into: table,
        values: [values]
    });
}

function resultrow(name, id, color) {
    let btn = btncolor(color);
    return `
    <div class="row border-bottom p-1">
        <div>
            <button data-toggle="tooltip" class='btn ${btn} lap p-1'>${name}</button>
        </div>
        <div id="${id}" class="col">

        </div>
    </div>`;
}

function tableresultrow(number = "#", name = "Uknown", bike = "Uknown", POS1 = "", PTS1 = "", POS2 = "", PTS2 = "", POS3 = "", PTS3 = "", POS4 = "", PTS4 = "", POS5 = "", PTS5 = "") {
    return `
    <tr class="border-bottom">
        <th scope="row" class="text-center">${number}</th>
        <td>${name}</td>
        <td></td>
        <td>${bike}</td>
        <td></td>
        <td class="text-center border-left">${POS1}</td>
        <td class="text-center border-right">${PTS1}</td>
        <td class="text-center border-left">${POS2}</td>
        <td class="text-center border-right">${PTS2}</td>
        <td class="text-center border-left">${POS3}</td>
        <td class="text-center border-right">${PTS3}</td>
        <td class="text-center border-left">${POS4}</td>
        <td class="text-center border-right">${PTS4}</td>
        <td class="text-center border-left">${POS5}</td>
        <td class="text-center border-right">${PTS5}</td>
    </tr>`;
}

function btncolor(color) {
    switch (color) {
        case 0: return `btn-outline-success`
        case 1: return `btn-outline-primary`;
        case 2: return `btn-outline-danger`;
        case 3: return `btn-outline-warning`;
        case 4: return `btn-outline-secondary`;
        case 5: return `btn-outline-dark`;
        default: return `btn-outline-dark`;
    }
}


function racebtn(Num, id = "", active = "", color, Name = "Unknown", Bike = "Unknown") {
    let btn = btncolor(color);
    return `<button id="${id}" data-toggle="tooltip" data-placement="bottom" data-html="true"
    title="<span>Name: ${Name}</span><br>
    <span>Bike: ${Bike}</span>"
    class='btn ${btn} entry p-1 ${active}'>${Num}</button>`;
}
function racebtngrp(Num, color = 1, id = "", pos = "", Name = "Name", Bike = "Bike", laps = "") {
    let btn = btncolor(color);
    return `<button id="${id}" data-toggle="tooltip" data-placement="bottom" data-html="true" 
    title="<span>Name: ${Name}</span><br>
    <span>Bike: ${Bike}</span><br>
    <span>Laps: ${laps}</span><br>
    <span>Place: ${pos}</span>" 
    class='btn ${btn} racebtngrp p-1'>${Num}</button>`;
}

async function initTables(db) {
    const seasons = await db.select({
        from: "Season",
    });
    if (seasons.length == 0) {
        var season = {
            Name: '2020-2021',
        };
        var noOfDataInserted = await db.insert({
            into: 'Season',
            values: [season]
        });
    }

    let rounds = await db.select({
        from: "Round",
    });
    if (rounds.length == 0) {
        for (i = 1; i <= 8; i++) {
            await insertdb('Round', {
                Name: 'Round ' + i,
                Season_id: 1
            })
        }
    }

    let races = await db.select({
        from: "Race",
    });
    if (races.length == 0) {
        for (i = 1; i <= 8; i++) {
            await insertdb('Race', {
                Name: 'Race 1',
                Order: 1,
                Season_id: 1,
                Round_id: i
            })
            await insertdb('Race', {
                Name: 'Race 2',
                Order: 1,
                Season_id: 1,
                Round_id: i
            })
            await insertdb('Race', {
                Name: 'Race 3',
                Order: 1,
                Season_id: 1,
                Round_id: i
            })
        }
    }
    const classes = await db.select({
        from: "Class",
    });
    if (classes.length == 0) {
        await insertdb('Class', { Name: "Pre 75 Smallbore", Group_id: 1 })
        await insertdb('Class', { Name: "Pre 75 Midbore", Group_id: 1 })
        await insertdb('Class', { Name: "Pre 75 Bigbore", Group_id: 1 })
        await insertdb('Class', { Name: "Pre 96 Womens", Group_id: 2 })
        await insertdb('Class', { Name: "Over 60", Group_id: 2 })
        await insertdb('Class', { Name: "Pre 86 Womens", Group_id: 2 })
        await insertdb('Class', { Name: "Pre 86 4T Over", Group_id: 3 })
        await insertdb('Class', { Name: "Pre 96 4T Over", Group_id: 3 })
        await insertdb('Class', { Name: "Pre 96 4T Under", Group_id: 3 })
        await insertdb('Class', { Name: "Pre 86 Enduro", Group_id: 4 })
        await insertdb('Class', { Name: "Pre 96 Enduro", Group_id: 4 })
        await insertdb('Class', { Name: "Pre 70", Group_id: 5 })
        await insertdb('Class', { Name: "Pre 78 Smallbore", Group_id: 5 })
        await insertdb('Class', { Name: "Pre 78 Midbore", Group_id: 5 })
        await insertdb('Class', { Name: "Pre 78 Bigbore", Group_id: 5 })
        await insertdb('Class', { Name: "Evo Bigbore", Group_id: 6 })
        await insertdb('Class', { Name: "Evo Midbore", Group_id: 6 })
        await insertdb('Class', { Name: "Evo Smallbore", Group_id: 6 })
        await insertdb('Class', { Name: "Pre 86 Midbore", Group_id: 7 })
        await insertdb('Class', { Name: "Pre 91 Midbore", Group_id: 7 })
        await insertdb('Class', { Name: "Pre 96 Midbore", Group_id: 8 })
        await insertdb('Class', { Name: "Pre 86 Smallbore", Group_id: 9 })
        await insertdb('Class', { Name: "Pre 91 Smallbore", Group_id: 9 })
        await insertdb('Class', { Name: "Pre 96 Smallbore", Group_id: 9 })
        await insertdb('Class', { Name: "Pre 86 Bigbore", Group_id: 10 })
        await insertdb('Class', { Name: "Pre 91 Bigbore", Group_id: 10 })
        await insertdb('Class', { Name: "Pre 96 Bigbore", Group_id: 10 })
    }
    const season_classes = await db.select({
        from: "Season_Class",
    });
    if (season_classes.length == 0) {
        for (i = 1; i <= 27; i++) {
            await insertdb('Season_Class', { Season_id: 1, Class_id: i })
        }
    }

    let numbers = [];
    let names = [];
    let class_ids = [];
    const results = await db.select({
        from: "Class",
    });

    for (let i = 0; i < results.length; i++) {
        var index = numbers.indexOf(results[i].Group_id);
        if (index == -1) {
            numbers.push(results[i].Group_id)
            names.push(results[i].Name)
            class_ids.push(`${results[i].id}`)
        } else {
            names[index] = names[index] + ", " + results[i].Name;
            class_ids[index] = class_ids[index] + "," + results[i].id;
        }

    }


    let groups = await db.select({
        from: "Group",
    });

    if (groups.length == 0) {
        for (let i = 0; i < names.length; i++) {
            insertdb('Group', { Name: names[i], Classes: class_ids[i] })
        }
    }
}
async function getTable(tbl) {
    const temp = await db.select({
        from: tbl,
    });
    return temp;
}

function postopoints(pos) {
    switch (pos) {
        case 1: return 25;
        case 2: return 22;
        case 3: return 20;
        case 4: return 18;
        case 5: return 16;
        case 6: return 15;
        case 7: return 14;
        case 8: return 13;
        case 9: return 12;
        case 10: return 11;
        case 11: return 10;
        case 12: return 9;
        case 13: return 8;
        case 14: return 7;
        case 15: return 6;
        case 16: return 5;
        case 17: return 4;
        case 18: return 3;
        case 19: return 2;
        case 20: return 1;
        default: return 0;
    }
}

async function loadSelect(src, origin, originvalue) {
    await $('#' + src).empty()
    let val = await localStorage.getItem(src);
    let results = [];
    if (originvalue) {
        let origin_id = origin + "_id";
        qry = {
            [origin_id]: originvalue
        }
        results = await db.select({
            from: src,
            where: qry,
        });
    } else if (!origin) {
        results = await db.select({
            from: src,
        });
    }

    $('#' + src).append(val ? $(`<option value='0' disabled>Select ${src}</option>`) : $(`<option value='0' selected disabled>Select ${src}</option>`));
    for (let i = 0; i < results.length; i++) {
        $('#' + src).append(val == results[i].id ? $(`<option selected value="${results[i].id}">${results[i].Name}</option>`) : $(`<option value="${results[i].id}">${results[i].Name}</option>`));
    }
}

function entrytable(cls, cls_id, sc) {
    return `
    <div class="bg-light card mb-4">
        <div class="text-center">
            <h2>${cls}</h2>
        </div>
        <table class="table table-hover table-sm mb-0">
            <thead>
                <tr id="entry_">
                    <td scope="col" class="text-center border p-0 w-25">
                        <input id="number_new_${sc}" data-sc="${sc}" style="font-size: 22px;" placeholder="Number" type="text" class="text-center new w-100" value="">
                    </td>
                    <td scope="col" class="text-center border p-0 w-25">
                        <select id="name_new_${sc}" data-sc="${sc}" class="form-control new" id="Season">
                            <option value="0" selected disabled>Select Racer</option>
                        </select>
                    </td>
                    <td scope="col" class="text-center border p-0 w-25">
                        <select id="bike_new_${sc}" data-sc="${sc}" class="form-control new" id="Season">
                            <option value="0" selected disabled>Select Bike</option>
                        </select>
                    </td>
                    <td scope="col" class="text-center border p-0 w-25">
                        <botton id="add_new" data-sc="${sc}" class="btn btn-secondary float-left new w-100">ADD NEW</botton>
                    </td>
                </tr>
                <tr>
                    <th scope="col" class="text-center border-right border-left">Number</th>
                    <th scope="col" class="text-center border-right border-left">Name</th>
                    <th scope="col" class="text-center border-right border-left">Bike</th>
                    <th scope="col" class="text-center border-right border-left">Action</th>
                </tr>
            </thead>
            <tbody id="class_${cls_id}">
            </tbody>
        </table>
    </div>
    `;
}
async function entryrow(entry_id, number, name, bike, racer_id, bike_id, racers_db, bikes_db) {
    return `
    <tr id="entry_${entry_id}">
        <td scope="col" class="text-center border p-0 w-25">
            <input id="number_${entry_id}" data-id="${entry_id}" style="font-size: 13px;" type="text" class="text-center edit w-100" value="${number}">
        </td>
        <td scope="col" class="text-center border p-0 w-25">
            <select id="name_${entry_id}" data-id="${entry_id}" class="edit p-0 w-100">
                <option value="${racer_id}" selected>${name}</option>
                ${await getraceroptions(racers_db)}
            </select>
        </td>
        <td scope="col" class="text-center border p-0 w-25">
            <select id="bike_${entry_id}" data-id="${entry_id}" class="edit p-0 w-100">
                <option value="${bike_id}" selected>${bike}</option>
                ${await getbikeoptions(bikes_db)}
            </select>
        </td>
        <td scope="col" class="text-center border p-0 w-25 d-table-cell align-middle">
            <botton id="save_${entry_id}" data-id="${entry_id}" class="btn btn-secondary float-left save p-0 w-50">Save</botton>
            <botton class="btn btn-danger delete float-right w-50 p-0" data-toggle="modal" data-target="#deleteModal" data-table="Entry" data-id="${entry_id}">Delete</botton>
        </td>
    </tr>
    `;
}

async function racerrow(firstname, lastname, racer_id, entries = 0, bikes = 0, results = 0) {
    return `
    <tr id="${racer_id}" class="racer" data-firstname="${firstname}" data-lastname="${lastname}">
        <td scope="col" class="text-center border p-0" style="width:30%;">
            <input id="firstname_${racer_id}" data-id="${racer_id}" style="font-size: 15px;" type="text" class="text-center editr bg-transparent w-100" value="${firstname}">
        </td>
        <td scope="col" class="text-center border p-0" style="width:30%;">
            <input id="lastname_${racer_id}" data-id="${racer_id}" style="font-size: 15px;" type="text" class="text-center editr bg-transparent w-100" value="${lastname}">
        </td>
        <td scope="col" class="text-center border p-0" style="width:20%;">
            <botton id="saver_${racer_id}" data-id="${racer_id}" class="btn btn-secondary float-left saver p-0 disabled w-50">Save</botton>
            <botton class="btn btn-danger deleter float-right p-0 w-50" data-toggle="modal" data-target="#deleteModal" data-table="Racer" data-id="${racer_id}">Delete</botton>
        </td>
        <td scope="col" class="text-center border p-0" style="width:20%;">
        <button type="button" class="btn btn-secondary p-0 w-100" data-toggle="tooltip" data-placement="left" title="Entries:${entries} Bikes:${bikes} Results:${results}">
            E:${entries} B:${bikes} R:${results}
        </button>
        </td>
    </tr>
    `;
}

async function bikerow(Year, Model, CC, bike_id) {
    return `
    <tr id="bike_${bike_id}" class="racer">
        <td scope="col" class="text-center border p-0 w-25">
            <input id="Year_${bike_id}" data-id="${bike_id}" style="font-size: 15px;" type="text" class="text-center editb w-100" value="${Year}">
        </td>
        <td scope="col" class="text-center border p-0 w-25">
            <input id="Model_${bike_id}" data-id="${bike_id}" style="font-size: 15px;" type="text" class="text-center editb w-100" value="${Model}">
        </td>
        <td scope="col" class="text-center border p-0 w-25">
            <input id="CC_${bike_id}" data-id="${bike_id}" style="font-size: 15px;" type="text" class="text-center editb w-100" value="${CC}">
        </td>
        <td scope="col" class="text-center border p-0 w-25">
        <botton id="saveb_${bike_id}" data-id="${bike_id}" class="btn btn-secondary float-left saveb disabled p-0 w-50">Save</botton>
        <botton class="btn btn-danger deleteb float-right p-0 w-50" data-table="Bike" data-toggle="modal" data-target="#deleteModal" data-id="${bike_id}">Delete</botton>
        </td>
    </tr>
    `;
}

async function seasonrow(name, season_id, classes = 0, entries = 0, results = 0) {
    return `
    <tr id="season_${season_id}" class="season" data-name="${name}">
        <td scope="col" class="text-center border p-0 w-50">
            <input id="seasonname_${season_id}" data-id="${season_id}" style="font-size: 15px;" type="text" class="text-center edits bg-transparent w-100" value="${name}">
        </td>
        <td scope="col" class="text-center border p-0 w-25">
            <botton id="saves_${season_id}" data-id="${season_id}" class="btn btn-secondary float-left saves p-0 disabled w-50">Save</botton>
            <botton class="btn btn-danger deletes float-right p-0 w-50" data-toggle="modal" data-target="#deleteModal" data-table="Season" data-id="${season_id}">Delete</botton>
        </td>
        <td scope="col" class="text-center border p-0 w-25">
            <button type="button" class="btn btn-secondary p-0 w-100" data-toggle="tooltip" data-placement="left" title="Classes:${classes} Entries:${entries}">
                C:${classes} E:${entries}
            </button>
        </td>
    </tr>
    `;
}

async function classrow(name, class_id, group, entries = 0, ingroup = 0, active = "active") {
    return `
    <tr id="class_${class_id}" class="class" data-name="${name}">
        <td scope="col" class="text-center border p-0 select" style="width: 5%;">
            <button id="select_${class_id}" type="button" data-class="${class_id}" class="btn btn-outline-success w=100 season_class d-none ${active}"></button>
        </td>
        <td scope="col" class="text-center border p-0" style="width: 35%;">
            <input id="classname_${class_id}" data-id="${class_id}" style="font-size: 14px;" type="text" class="text-center editc bg-transparent w-100" value="${name}">
        </td>
        <td scope="col" class="text-center border p-0 d-table-cell align-middle" style="width: 10%;">
            <select id="classgroup_${class_id}" data-id="${class_id}" class="editc w-100">
                ${getgroups(group)}
            </select>
        </td>
        <td scope="col" class="text-center border p-0" style="width: 25%;">
            <botton id="savec_${class_id}" data-id="${class_id}" class="btn btn-secondary float-left savec p-0 disabled w-50">Save</botton>
            <botton class="btn btn-danger deletec float-right p-0 w-50" data-toggle="modal" data-target="#deleteModal" data-table="Class" data-id="${class_id}">Delete</botton>
        </td>
        <td scope="col" class="text-center border p-0" style="width: 25%;">
            <button type="button" class="btn btn-secondary p-0 w-100" data-toggle="tooltip" data-placement="left" title="Entries:${entries} Classes in Group:${ingroup}">
                E:${entries} G:${ingroup}
            </button>
        </td>
    </tr>
    `;
}

function getgroups(selected = 0) {
    let html = '';
    for (let i = 0; i <= 20; i++) {
        const sel = selected == i ? "selected" : "";
        html += `<option value="${i}" ${sel}>${i}</option>`;
    }
    return html;
}

async function pageli(pos = 1, num) {
    switch (pos) {
        case 1: return `<li class="page-item disabled"><a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a></li>`;
        case 2: return `<li class="page-item"><a class="page-link" href="#">${num}</a></li>`;
        case 3: return `<li class="page-item active" aria-current="page"><a class="page-link" href="#">${num}<span class="sr-only">(current)</span></a></li>`;
        case 4: return `<li class="page-item"><a class="page-link" href="#">Next</a></li>`;
        case 5: return `<li class="page-item disabled"><a class="page-link" href="#" tabindex="-1" aria-disabled="true">Next</a></li>`;
        case 6: return `<li class="page-item"><a class="page-link" href="#">Previous</a></li>`;
    }


}

async function getraceroptions(racer_db) {
    let html;
    for (let i = 0; i < racer_db.length; i++) {
        html += await option(racer_db[i].id, `${racer_db[i].FirstName} ${racer_db[i].LastName}`);
    }
    return html;
}

async function getbikeoptions(bike_db) {
    let html;
    for (let i = 0; i < bike_db.length; i++) {
        html += await option(bike_db[i].id, `${bike_db[i].Year > 0 ? bike_db[i].Year : ""} ${bike_db[0].Model} ${bike_db[0].CC > 0 ? bike_db[i].CC : ""}`);
    }
    return html;
}

async function option(id, name) {
    return `<option value="${id}">${name}</option>`;
}

function progressbar(id) {
    const html = `
        <div id="${id}_bar">
            <div class="row">
                <div class="col text-center">
                    ${id}
                </div>
            </div>
            <div class="progress">
                <div id="${id}" class="progress-bar progress-bar-striped" role="progressbar" style="width: 0">${id}</div>
            </div>
        <div/>`;
    return html;
};

async function confirmDelete(id, table) {
    $(".modal-body").html("");
    $("#deleteModalLabel").text(`Delete ${table}`)
    $("#delete").data("id", id)
    $("#delete").data("table", table)
    if (table == "Racer") {
        const racer = await db.select({
            from: "Racer",
            where: {
                id: id
            }
        })
        $(".modal-body").append(`<p>${racer[0].FirstName} ${racer[0].LastName}</p>`);
        const delete_bikes = await db.count({
            from: "Bike",
            where: {
                Racer_id: id
            }
        })
        $(".modal-body").append(`<p>Bikes to be deleted: ${delete_bikes}</p>`);
        const delete_entries = await db.select({
            from: "Entry",
            where: {
                Racer_id: id
            }
        })
        $(".modal-body").append(`<p>Entries to be deleted: ${delete_entries.length}</p>`);
        let count_results = 0;
        for (let e = 0; e < delete_entries.length; e++) {
            const delete_results = await db.count({
                from: "Result",
                where: {
                    Entry_id: delete_entries[e].id
                }
            })
            count_results += delete_results
        }
        $(".modal-body").append(`<p>Results to be deleted: ${count_results}</p>`);
    } else if (table == "Bike") {
        const bike = await db.select({
            from: "Bike",
            where: {
                id: id
            }
        })
        $(".modal-body").html(`<p>${bike[0].Year} ${bike[0].Model} ${bike[0].CC}</p>`);
        const delete_entries = await db.select({
            from: "Entry",
            where: {
                Bike_id: id
            }
        })
        $(".modal-body").append(`<p>Entries to be deleted: ${delete_entries.length}</p>`);
        let count_results = 0;
        for (let e = 0; e < delete_entries.length; e++) {
            const delete_results = await db.count({
                from: "Result",
                where: {
                    Entry_id: delete_entries[e].id
                }
            })
            count_results += delete_results
        }
        $(".modal-body").append(`<p>Results to be deleted: ${count_results}</p>`);
    } else if (table == "Season") {
        const season = await db.select({
            from: "Season",
            where: {
                id: id
            }
        })
        $(".modal-body").html(`<p>${season[0].Name}</p>`);
        const rounds = await db.select({
            from: "Round",
            where: {
                Season_id: id
            }
        })
        let Lap_Race_count = 0;
        for (let r = 0; r < rounds.length; r++) {
            const Lap_Race = await db.select({
                from: "Lap_Race",
                where: {
                    Round_id: rounds[r].id
                }
            })
            Lap_Race_count += Lap_Race.length
        }
        $(".modal-body").append(`<p>Rounds to be deleted: ${rounds.length}</p>`);
        $(".modal-body").append(`<p>Lap_Race to be deleted: ${Lap_Race_count}</p>`);
        const season_class = await db.select({
            from: "Season_Class",
            where: {
                Season_id: id
            }
        })
        $(".modal-body").append(`<p>Season_Class to be deleted: ${season_class.length}</p>`);
        let entries_count = 0;
        let results_count = 0;
        for (let sc = 0; sc < season_class.length; sc++) {
            const entries = await db.select({
                from: "Entry",
                where: {
                    Season_Class_id: season_class[sc].id
                }
            })
            entries_count += entries.length;
            for (let e = 0; e < entries.length; e++) {
                const results = await db.select({
                    from: "Result",
                    where: {
                        Entry_id: entries[e].id
                    }
                })
                results_count += results.length;
            }
        }
        $(".modal-body").append(`<p>Entries to be deleted: ${entries_count}</p>`);
        $(".modal-body").append(`<p>Results to be deleted: ${results_count}</p>`);
    } else if (table == "Class") {
        const cls = await db.select({
            from: "Class",
            where: {
                id: id
            }
        })
        $(".modal-body").html(`<p>${cls[0].Name}</p>`);
        const season_class = await db.select({
            from: "Season_Class",
            where: {
                Class_id: id
            }
        })
        $(".modal-body").append(`<p>Season_Class to be deleted: ${season_class.length}</p>`);
        let entries_count = 0;
        let results_count = 0;
        for (let sc = 0; sc < season_class.length; sc++) {
            const entries = await db.select({
                from: "Entry",
                where: {
                    Season_Class_id: season_class[sc].id
                }
            })
            entries_count += entries.length;
            for (let e = 0; e < entries.length; e++) {
                const results = await db.select({
                    from: "Result",
                    where: {
                        Entry_id: entries[e].id
                    }
                })
                results_count += results.length;
            }
        }
        $(".modal-body").append(`<p>Entries to be deleted: ${entries_count}</p>`);
        $(".modal-body").append(`<p>Results to be deleted: ${results_count}</p>`);
    } else if (table == "Entry") {
        const entry = await db.select({
            from: "Entry",
            where: {
                id: id
            }
        })
        $(".modal-body").html(`<p>${entry[0].Number}</p>`);
        const results = await db.count({
            from: "Result",
            where: {
                Entry_id: entry[0].id
            }
        })
        $(".modal-body").append(`<p>Results to be deleted: ${results}</p>`);
    }
}

async function deleterecords(id, table) {
    if (table == "Racer") {
        await db.remove({
            from: table,
            where: {
                id: id
            }
        })
        await db.remove({
            from: "Bike",
            where: {
                Racer_id: id
            }
        })
        const delete_entries = await db.select({
            from: "Entry",
            where: {
                Racer_id: id
            }
        })
        await db.remove({
            from: "Entry",
            where: {
                Racer_id: id
            }
        })
        for (let e = 0; e < delete_entries.length; e++) {
            await db.remove({
                from: "Result",
                where: {
                    Entry_id: delete_entries[e].id
                }
            })
        }
    } else if (table == "Bike") {
        await db.remove({
            from: table,
            where: {
                id: id
            }
        })
        const delete_entries = await db.select({
            from: "Entry",
            where: {
                Bike_id: id
            }
        })
        await db.remove({
            from: "Entry",
            where: {
                Bike_id: id
            }
        })
        for (let e = 0; e < delete_entries.length; e++) {
            await db.remove({
                from: "Result",
                where: {
                    Entry_id: delete_entries[e].id
                }
            })
        }
    } else if (table == "Season") {
        await db.remove({
            from: table,
            where: {
                id: id
            }
        })
        const rounds = await db.select({
            from: "Round",
            where: {
                Season_id: id
            }
        })
        await db.remove({
            from: "Round",
            where: {
                Season_id: id
            }
        })
        for (let r = 0; r < rounds.length; r++) {
            await db.remove({
                from: "Lap_Race",
                where: {
                    Round_id: rounds[r].id
                }
            })
        }
        const season_class = await db.select({
            from: "Season_Class",
            where: {
                Season_id: id
            }
        })
        await db.remove({
            from: "Season_Class",
            where: {
                Season_id: id
            }
        })
        for (let sc = 0; sc < season_class.length; sc++) {
            const entries = await db.select({
                from: "Entry",
                where: {
                    Season_Class_id: season_class[sc].id
                }
            })
            await db.remove({
                from: "Entry",
                where: {
                    Season_Class_id: season_class[sc].id
                }
            })
            for (let e = 0; e < entries.length; e++) {
                await db.remove({
                    from: "Result",
                    where: {
                        Entry_id: entries[e].id
                    }
                })
            }
        }
    } else if (table == "Class"){
        const cls = await db.remove({
            from: table,
            where: {
                id: id
            }
        })
        const season_class = await db.select({
            from: "Season_Class",
            where: {
                Class_id: id
            }
        })
        await db.remove({
            from: "Season_Class",
            where: {
                Class_id: id
            }
        })
        for (let sc = 0; sc < season_class.length; sc++) {
            const entries = await db.select({
                from: "Entry",
                where: {
                    Season_Class_id: season_class[sc].id
                }
            })
            await db.remove({
                from: "Entry",
                where: {
                    Season_Class_id: season_class[sc].id
                }
            })
            for (let e = 0; e < entries.length; e++) {
                await db.remove({
                    from: "Result",
                    where: {
                        Entry_id: entries[e].id
                    }
                })
            }
        }
    } else if (table == "Entry") {
        
        await db.remove({
            from: "Entry",
            where: {
                id: id
            }
        })
        await db.remove({
            from: "Result",
            where: {
                Entry_id: id
            }
        })
    }
}









