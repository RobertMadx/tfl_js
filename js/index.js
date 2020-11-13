if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
    // .then((reg) => console.log('service worker registered', reg))
    // .catch((err) => console.log('service worker not registered', err))
}

var db = new JsStore.Connection(new Worker("./js/jsstore.worker.min.js"));
var textFields = ['Number', 'FirstName', 'LastName', 'Model', 'Classes', 'Name']
var classes = [];
var classes_id = [];

window.onload = function () {
    initDb();
    loadAllSelect();
    refreshTableData();
    registerEvents();
};

function loadAllSelect() {
    loadSelect("Season");
    loadSelect("Round", "Season", parseInt(localStorage.getItem("Season")));
    loadSelect("Race", "Round", parseInt(localStorage.getItem("Round")));
    loadSelect("Group");
}

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

async function Process_number() {
    let num = $('#Number_input').val().toUpperCase();
    let group = parseInt($('#Group').val());
    let race = parseInt($('#Race').val());
    if (group && race && num != "") {
        $('#Number_input').val("");
        var numbers = [];
        var laps_done = [];

        var laprace = {
            Number: num,
            Group_id: group,
            Race_id: race,
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

function display(html, id) {
    $("#selectall").removeClass("active");
    $("#moveup").removeClass("disabled");
    $("#movedown").removeClass("disabled");
    $("#racercard").removeClass("d-none");
    $("#disp").html(html);
    $("#disp").data("identity", id);
}

function registerEvents() {
    $('#Number_input').on('keypress', function (e) {
        if (e.key == 'Enter') {
            Process_number();
        }
    });
    $('#delete').on('click', async function (e) {
        if ($("#selectall").hasClass("active")) {
            let num = $('#disp').html();
            let group = parseInt($('#Group').val());
            let race = parseInt($('#Race').val());
            await db.remove({
                from: "Lap_Race",
                where: {
                    Group_id: group,
                    Race_id: race,
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

    $('#moveup').on('click', async function (e) {
        if (!$("#moveup").hasClass("disabled")) {
            let id = $('#disp').data('identity');
            let group = parseInt($('#Group').val());
            let race = parseInt($('#Race').val());
            const results = await db.select({
                from: "Lap_Race",
                where: {
                    Group_id: group,
                    Race_id: race
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
            const results = await db.select({
                from: "Lap_Race",
                where: {
                    Group_id: group,
                    Race_id: race
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

    $('select').on('change', function (e) {
        localStorage.setItem(this.id, this.value);
        if (this.id == "Season") {
            localStorage.removeItem("Round");
            localStorage.removeItem("Race");
            localStorage.removeItem("Group");
        }
        if (this.id == "Round") {
            localStorage.removeItem("Race");
        }
        loadAllSelect()
        refreshTableData();
    });

}

//var csv is the CSV file with headers
function csvJSON(csv) {

    var lines = csv.split("\n");

    var result = [];

    // NOTE: If your columns contain commas in their values, you'll need
    // to deal with those before doing the next step 
    // (you might convert them to &&& or something, then covert them back later)
    // jsfiddle showing the issue https://jsfiddle.net/
    var headers = lines[0].split(",");

    for (var i = 1; i < lines.length; i++) {

        var obj = {};
        var currentline = lines[i].split(",");

        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);

    }

    //return result; //JavaScript object
    return JSON.stringify(result); //JSON
}

async function ProcessExcel(data) {
    //Read the Excel File data.
    var workbook = XLSX.read(data, {
        type: 'binary'
    });
    $("#bars").html("");
    workbook.SheetNames.forEach(async function (sheetName) {
        $("#bars").append(progressbar(sheetName));
    })
    workbook.SheetNames.forEach(async function (sheetName) {

        // Here is your object
        var json_object = await XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });


        await db.remove({
            from: sheetName,
        });
        if (json_object.length < 1) {
            $(`#${sheetName}_bar`).remove()
        }

        for (let i = 1; i <= json_object.length; i++) {
            let per = Math.round((i / json_object.length) * 100);

            $(`#${sheetName}`).css('width', `${per}%`)
            $(`#${sheetName}`).html(`${per}%`)

            if (per == 100) {
                $(`#${sheetName}_bar`).remove()
            }

            let entry = {};
            if (typeof json_object[i] != 'undefined') {

                for (let j = 0; j < json_object[i].length; j++) {
                    let key = json_object[0][j];
                    let value = json_object[i][j];

                    if (textFields.includes(key)) {
                        value = json_object[i][j].replace('"', "").replace('"', "");
                    } else {
                        value = json_object[i][j];
                    }
                    Object.assign(entry, { [key]: value })
                }
                await insertdb(sheetName, entry)
            }
        }
    })
};




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

function Upload() {
    //Reference the FileUpload element.
    var fileUpload = document.getElementById("fileUpload");

    //Validate whether File is valid Excel file.
    if (typeof (FileReader) != "undefined") {
        var reader = new FileReader();

        //For Browsers other than IE.
        if (reader.readAsBinaryString) {
            reader.onload = function (e) {
                ProcessExcel(e.target.result);
            };
            reader.readAsBinaryString(fileUpload.files[0]);
        } else {
            //For IE Browser.
            reader.onload = function (e) {
                var data = "";
                var bytes = new Uint8Array(e.target.result);
                for (var i = 0; i < bytes.byteLength; i++) {
                    data += String.fromCharCode(bytes[i]);
                }
                ProcessExcel(data);
            };
            reader.readAsArrayBuffer(fileUpload.files[0]);
        }
    } else {
        alert("This browser does not support HTML5.");
    }
}


async function loadSelect(src, origin, originvalue) {
    $('#' + src).empty()
    let val = localStorage.getItem(src);
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

    results.forEach(function (n) {
        $('#' + src).append(val == n.id ? $(`<option selected value="${n.id}">${n.Name}</option>`) : $(`<option value="${n.id}">${n.Name}</option>`));
        if (src == "Group" && val == n.id) {
            classes = (n.Name).split(",")
            classes_id = (n.Classes).split(",")
        }
    })
}

async function refreshTableData(selected = "") {

    clear_laps();
    let group = parseInt(localStorage.getItem("Group"));
    let race = parseInt(localStorage.getItem("Race"));
    let season = parseInt(localStorage.getItem("Season"));
    let round = parseInt(localStorage.getItem("Round"));


    var numbers = [];
    var laps_done = [];
    var last_lap = [];

    if (group && race) {
        $("#Number_input").prop("disabled", false);
        $("#Number_input").attr("placeholder", "Enter Number Here");
        const results = await db.select({
            from: "Lap_Race",
            where: {
                Group_id: group,
                Race_id: race
            },
        });

        var lap = 1;
        results.forEach(function (n) {
            var index = numbers.indexOf(n.Number);
            if (index == -1) {
                numbers.push(n.Number)
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
            if (n.id == selected) {
                $('#Lap' + lap).append(racebtn(n.Number, n.id, "active"));
            } else {
                $('#Lap' + lap).append(racebtn(n.Number, n.id));
            }
            $('#laprow' + lap).removeClass("d-none");
        })
        for (i = lap + 1; i <= 9; i++) {
            $('#laprow' + i).addClass("d-none");
        }
    } else {
        $("#Number_input").prop("disabled", true);
        $("#Number_input").attr("placeholder", "Select Option Above");
    }
    $('.entry').on('click', function (e) {
        $('.entry').removeClass("active");
        $(this).addClass("active");
        display($(this).html(), $(this).attr('id'));
    });


    $("#results").html("");
    $("#results").append(resultrow("Unknown", "Unknown"));

    let entries = [];
    let lap_results = [];
    let lap_results_final = [];
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
        lap_results.push([])
        lap_results_final.push([])
        entry_db.forEach(function (n) {
            entries[i].push(n.Number);
        })

    }
    $("#results").append(resultrow("DNF", "DNF"));




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
            //$(`#class_${cl}`).append(racebtngrp(last_numbers[i]));
        }
    }
    console.log(lap_results)
    for (let i = lap; i > 0; i--) {
        for (let j = 0; j < lap_results.length; j++) {
            for (let k = 0; k < lap_results[j].length; k++) {
                if (lap_count[last_numbers.indexOf(lap_results[j][k])] == i) {
                    lap_results_final[j].push(lap_results[j][k]);
                }
            }
        }
    }
    console.log(lap_results_final)

    for (let i = 0; i < classes_id.length; i++) {
        for (let j = 0; j < lap_results_final[i].length; j++) {
            $(`#class_${classes_id[i]}`).append(racebtngrp(lap_results_final[i][j], i, "", j + 1));
        }
    }
    

    console.log(last_numbers)
    console.log(lap_count)
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
            //dnf_numbers.push(numbers[i]);
            $("#DNF").append(racebtngrp(numbers[i]));
        }
    }
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
}

function resultrow(name, id, color) {
    let btn;
    switch (color) {
        case 0: btn = `btn-outline-success`
            break;
        case 1: btn = `btn-outline-primary`;
            break;
        case 2: btn = `btn-outline-danger`;
            break;
        case 3: btn = `btn-outline-secondary`;
            break;
        case 4: btn = `btn-outline-warning`;
            break;
        default: btn = `btn-outline-dark`;
            break;
    }
    return `
    <div class="row border-bottom p-1">
        <div>
            <button data-toggle="tooltip" class='btn ${btn} lap p-1'>${name}</button>
        </div>
        <div id="${id}" class="col">

        </div>
    </div>`;
}


function racebtn(Num, id = "", active = "") {
    return `<button id="${id}" class='btn btn-outline-primary entry p-1 ${active}'>${Num}</button>`;
}
function racebtngrp(Num, color = 1, id = "", pos = "",Name = "Name",Bike = "Bike") {
    let btn;
    switch (color) {
        case 0: btn = `btn-outline-success`
            break;
        case 1: btn = `btn-outline-primary`;
            break;
        case 2: btn = `btn-outline-danger`;
            break;
        case 3: btn = `btn-outline-secondary`;
            break;
        case 4: btn = `btn-outline-warning`;
            break;
        default: btn = `btn-outline-dark`;
            break;
    }

    return `<button id="${id}" data-toggle="tooltip" data-html="true" title="<span>${Name}</span><br><span>${Bike}</span><br><span>${pos}</span>" class='btn ${btn} p-1'>${Num}</button>`;
}

function clear_laps() {
    $(".lap-row").each(function (index, element) {
        $(this).html("");
    });
    $(".lap").each(function (index, element) {
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
    let race = parseInt($('#Race').val());
    if (group && race) {
        try {
            await db.remove({
                from: 'Lap_Race',
                where: {
                    Group_id: group,
                    Race_id: race,
                },
            });
            refreshTableData();
        } catch (ex) {
            alert(ex.message);
        }
    }
}


async function DownloadDatabase() {
    const dbschema = await db.getDbSchema("TheFinishLine");
    var wb = XLSX.utils.book_new();

    for (const table of dbschema.tables) {
        const temp_raw = await getTable(table.name);
        let temp_json = [];
        temp_raw.forEach(function (r) {
            textFields.forEach(element => {
                if (element in r) r[element] = `"${r[element]}"`
            });
            temp_json.push(r);
        })
        let temp = XLSX.utils.json_to_sheet(temp_json)
        XLSX.utils.book_append_sheet(wb, temp, table.name)
    }
    XLSX.writeFile(wb, 'database.xlsx') // name of the file is 'book.xlsx'
}

async function getTable(tbl) {
    const temp = await db.select({
        from: tbl,
    });
    return temp;

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

    results.forEach(function (n) {
        var index = numbers.indexOf(n.Group_id);
        if (index == -1) {
            numbers.push(n.Group_id)
            names.push(n.Name)
            class_ids.push(`${n.id}`)
        } else {
            names[index] = names[index] + ", " + n.Name;
            class_ids[index] = class_ids[index] + "," + n.id;
        }

    })

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