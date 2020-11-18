
document.title += " - v1.0";

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

function tableresultrow(number = "#",name = "Uknown", bike = "Uknown",POS1 = "",PTS1 = "",POS2 = "",PTS2 = "",POS3 = "",PTS3 = "",POS4 = "",PTS4 = "",POS5 = "",PTS5 = "") {
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
    loadAllSelect();
}
async function getTable(tbl) {
    const temp = await db.select({
        from: tbl,
    });
    return temp;
}

function postopoints(pos){
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
        default:return 0;
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

function entrytable(cls, cls_id, sc){
    return `
    <h4>${cls}</h4>
    <table class="table table-hover table-sm table-striped">
        <thead>
            <tr id="entry_">
                <td scope="col" class="text-center border">
                    <input id="number_new_${sc}" data-sc="${sc}" style="font-size: 20px;width: 100px;" placeholder="Number" type="text" class="text-center new" value="">
                </td>
                <td scope="col" class="text-center border">
                    <select id="name_new_${sc}" data-sc="${sc}" class="form-control new" id="Season">
                        <option value="0" selected disabled>Select Racer</option>
                    </select>
                </td>
                <td scope="col" class="text-center border">
                    <select id="bike_new_${sc}" data-sc="${sc}" class="form-control new" id="Season">
                        <option value="0" selected disabled>Select Bike</option>
                    </select>
                </td>
                <td scope="col" class="text-center border">
                    <botton id="add_new" data-sc="${sc}" class="btn btn-secondary float-left new">ADD NEW</botton>
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
    `;
}
async function entryrow(entry_id,number,name,bike,racer_id,bike_id,racers_db,bikes_db){
    return `
    <tr id="entry_${entry_id}">
        <td scope="col" class="text-center border">
            <input id="number_${entry_id}" data-id="${entry_id}" style="font-size: 20px;width: 100px;" type="text" class="text-center edit" value="${number}">
        </td>
        <td scope="col" class="text-center border">
            <select id="name_${entry_id}" data-id="${entry_id}" class="form-control edit" id="Season">
                <option value="${racer_id}" selected>${name}</option>
                ${await getraceroptions(racers_db)}
            </select>
        </td>
        <td scope="col" class="text-center border">
            <select id="bike_${entry_id}" data-id="${entry_id}" class="form-control edit" id="Season">
                <option value="${bike_id}" selected>${bike}</option>
                ${await getbikeoptions(bikes_db)}
            </select>
        </td>
        <td scope="col" class="text-center border">
            <botton id="save_${entry_id}" data-id="${entry_id}" class="btn btn-secondary float-left save">Save</botton>
            <botton class="btn btn-danger delete float-right" data-id="${entry_id}">Delete</botton>
        </td>
    </tr>
    `;
}

async function getraceroptions(racer_db){
    let html;
    for (let i = 0; i < racer_db.length; i++) {
        html += await option(racer_db[i].id,`${racer_db[i].FirstName} ${racer_db[i].LastName}`);
    }
    return html;
}

async function getbikeoptions(bike_db){
    let html;
    for (let i = 0; i < bike_db.length; i++) {
        html += await option(bike_db[i].id,`${bike_db[i].Year>0?bike_db[i].Year:""} ${bike_db[0].Model} ${bike_db[0].CC>0?bike_db[i].CC:""}`);
    }
    return html;
}

async function option(id,name){
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











